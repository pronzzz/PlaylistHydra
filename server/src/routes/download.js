import { Router } from 'express'
import path from 'path'
import fs from 'fs'
import archiver from 'archiver'
import { validate, downloadRequestSchema } from '../middleware/validation.js'
import { downloadQueue } from '../services/queue.js'
import { sanitizeFilename } from '../utils/sanitize.js'
import { DOWNLOAD_DIR } from '../utils/constants.js'

export const downloadRouter = Router()

/**
 * POST /api/download
 * Start a download job for a batch of videos
 */
downloadRouter.post('/', validate(downloadRequestSchema), async (req, res, next) => {
    try {
        const { videoIds, format, quality, batchSize } = req.body

        // Create safe output directory
        const outputDir = path.resolve(DOWNLOAD_DIR, sanitizeFilename('playlist'))

        // Map videoIds to video objects expected by queue
        const videos = videoIds.map(id => ({ id, title: id }))

        const job = downloadQueue.createJob(videos, format, quality, outputDir)

        res.json({
            success: true,
            data: {
                jobId: job.id,
                status: job.status,
                totalVideos: job.totalVideos,
            },
        })
    } catch (err) {
        next(err)
    }
})

/**
 * POST /api/download/start
 * Start download with full video info (title etc.)
 */
downloadRouter.post('/start', async (req, res, next) => {
    try {
        const { videos, format, quality, playlistTitle } = req.body

        if (!videos || !Array.isArray(videos) || videos.length === 0) {
            return res.status(400).json({ success: false, error: 'No videos provided' })
        }

        const dirName = sanitizeFilename(playlistTitle || 'playlist')
        const outputDir = path.resolve(DOWNLOAD_DIR, dirName)

        const job = downloadQueue.createJob(videos, format, quality, outputDir, playlistTitle)

        res.json({
            success: true,
            data: {
                jobId: job.id,
                status: job.status,
                totalVideos: job.totalVideos,
            },
        })
    } catch (err) {
        next(err)
    }
})

/**
 * GET /api/download/:jobId
 * Get job status
 */
downloadRouter.get('/:jobId', (req, res) => {
    const job = downloadQueue.getJob(req.params.jobId)

    if (!job) {
        return res.status(404).json({ success: false, error: 'Job not found' })
    }

    res.json({
        success: true,
        data: {
            jobId: job.id,
            status: job.status,
            totalVideos: job.totalVideos,
            completedCount: job.completedCount,
            failedCount: job.failedCount,
            videos: job.videos.map(v => ({
                id: v.id,
                title: v.title,
                status: v.status,
                progress: v.progress,
                error: v.error,
            })),
        },
    })
})

/**
 * GET /api/download/:jobId/events
 * Server-Sent Events stream for real-time progress
 */
downloadRouter.get('/:jobId/events', (req, res) => {
    const jobId = req.params.jobId
    const job = downloadQueue.getJob(jobId)

    if (!job) {
        return res.status(404).json({ success: false, error: 'Job not found' })
    }

    // Set SSE headers
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
    })

    // Send initial state
    res.write(`data: ${JSON.stringify({
        jobId: job.id,
        status: job.status,
        totalVideos: job.totalVideos,
        completedCount: job.completedCount,
        failedCount: job.failedCount,
        videos: job.videos.map(v => ({
            id: v.id,
            title: v.title,
            status: v.status,
            progress: v.progress,
            error: v.error,
        })),
    })}\n\n`)

    // Listen for progress updates
    const handler = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`)

        // Close stream when job completes
        if (data.status === 'completed' || data.status === 'cancelled') {
            res.write('event: done\ndata: {}\n\n')
            res.end()
            downloadQueue.removeListener(`progress:${jobId}`, handler)
        }
    }

    downloadQueue.on(`progress:${jobId}`, handler)

    // Heartbeat to keep connection alive
    const heartbeat = setInterval(() => {
        res.write(': heartbeat\n\n')
    }, 15000)

    // Cleanup on disconnect
    req.on('close', () => {
        clearInterval(heartbeat)
        downloadQueue.removeListener(`progress:${jobId}`, handler)
    })
})

/**
 * POST /api/download/:jobId/cancel
 * Cancel a download job
 */
downloadRouter.post('/:jobId/cancel', (req, res) => {
    const job = downloadQueue.getJob(req.params.jobId)

    if (!job) {
        return res.status(404).json({ success: false, error: 'Job not found' })
    }

    downloadQueue.cancelJob(req.params.jobId)
    res.json({ success: true, message: 'Job cancelled' })
})

/**
 * POST /api/download/:jobId/retry
 * Retry failed downloads in a job
 */
downloadRouter.post('/:jobId/retry', (req, res) => {
    const result = downloadQueue.retryFailed(req.params.jobId)

    if (!result) {
        return res.status(404).json({ success: false, error: 'Job not found' })
    }

    res.json({ success: true, data: { jobId: result.id, status: result.status } })
})

/**
 * GET /api/download/:jobId/zip
 * Stream all completed files as a single zip archive
 */
downloadRouter.get('/:jobId/zip', async (req, res, next) => {
    try {
        const job = downloadQueue.getJob(req.params.jobId)
        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found' })
        }

        if (!job.outputDir || !fs.existsSync(job.outputDir)) {
            return res.status(404).json({ success: false, error: 'No files found' })
        }

        const entries = fs.readdirSync(job.outputDir)
        const files = entries.filter(name => {
            const filePath = path.join(job.outputDir, name)
            return fs.statSync(filePath).isFile()
        })

        if (files.length === 0) {
            return res.status(404).json({ success: false, error: 'No files found' })
        }

        const zipName = sanitizeFilename(job.playlistTitle || 'playlist') + '.zip'

        res.setHeader('Content-Type', 'application/zip')
        res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`)

        const archive = archiver('zip', { zlib: { level: 5 } })
        archive.pipe(res)

        for (const file of files) {
            archive.file(path.join(job.outputDir, file), { name: file })
        }

        await archive.finalize()
    } catch (err) {
        next(err)
    }
})

/**
 * GET /api/download/:jobId/files
 * List completed download files
 */
downloadRouter.get('/:jobId/files', async (req, res, next) => {
    try {
        const job = downloadQueue.getJob(req.params.jobId)
        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found' })
        }

        const { default: fs } = await import('fs')
        const { promisify } = await import('util')
        const readdir = promisify(fs.readdir)
        const stat = promisify(fs.stat)

        if (!job.outputDir || !fs.existsSync(job.outputDir)) {
            return res.json({ success: true, data: { files: [] } })
        }

        const entries = await readdir(job.outputDir)
        const files = []

        for (const name of entries) {
            const filePath = path.join(job.outputDir, name)
            const fileStat = await stat(filePath)
            if (fileStat.isFile()) {
                files.push({
                    name,
                    size: fileStat.size,
                    downloadUrl: `/api/download/${req.params.jobId}/files/${encodeURIComponent(name)}`,
                })
            }
        }

        res.json({ success: true, data: { files } })
    } catch (err) {
        next(err)
    }
})

/**
 * GET /api/download/:jobId/files/:filename
 * Serve a specific downloaded file for browser download
 */
downloadRouter.get('/:jobId/files/:filename', async (req, res, next) => {
    try {
        const job = downloadQueue.getJob(req.params.jobId)
        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found' })
        }

        const filename = decodeURIComponent(req.params.filename)
        const filePath = path.resolve(job.outputDir, filename)

        // Security: ensure the file is within the output directory
        if (!filePath.startsWith(path.resolve(job.outputDir))) {
            return res.status(403).json({ success: false, error: 'Access denied' })
        }

        const { default: fs } = await import('fs')
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, error: 'File not found' })
        }

        res.download(filePath, filename)
    } catch (err) {
        next(err)
    }
})
