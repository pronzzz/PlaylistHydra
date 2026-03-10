import { EventEmitter } from 'events'
import { v4 as uuidv4 } from 'uuid'
import { MAX_CONCURRENT_DOWNLOADS, MAX_RETRIES } from '../utils/constants.js'
import { downloadVideo } from './ytdlp.js'

/**
 * In-memory download queue with concurrency control
 */
class DownloadQueue extends EventEmitter {
    constructor(concurrency = MAX_CONCURRENT_DOWNLOADS) {
        super()
        this.concurrency = concurrency
        this.jobs = new Map()        // jobId -> JobState
        this.activeCount = 0
        this.queue = []              // Pending video tasks
        this.setMaxListeners(100)
    }

    /**
     * Create a new download job for a batch of videos
     */
    createJob(videos, format, quality, outputDir, playlistTitle) {
        const jobId = uuidv4()
        const videoStates = videos.map(v => ({
            id: v.id,
            title: v.title,
            status: 'pending',     // pending | downloading | completed | failed
            progress: 0,
            retries: 0,
            error: null,
        }))

        const job = {
            id: jobId,
            status: 'active',       // active | paused | completed | cancelled
            format,
            quality,
            outputDir,
            playlistTitle: playlistTitle || 'playlist',
            videos: videoStates,
            totalVideos: videos.length,
            completedCount: 0,
            failedCount: 0,
            createdAt: Date.now(),
        }

        this.jobs.set(jobId, job)

        // Enqueue all videos
        for (const video of videoStates) {
            this.queue.push({ jobId, video })
        }

        // Start processing
        this._processQueue()

        return job
    }

    /**
     * Process queued downloads respecting concurrency limit
     */
    async _processQueue() {
        while (this.queue.length > 0 && this.activeCount < this.concurrency) {
            const task = this.queue.shift()
            if (!task) break

            const job = this.jobs.get(task.jobId)
            if (!job || job.status === 'cancelled' || job.status === 'paused') continue

            this.activeCount++
            task.video.status = 'downloading'
            this._emitProgress(task.jobId)

            this._downloadWithRetry(task).finally(() => {
                this.activeCount--
                this._processQueue()
            })
        }
    }

    /**
     * Download with retry logic
     */
    async _downloadWithRetry(task) {
        const { jobId, video } = task
        const job = this.jobs.get(jobId)
        if (!job) return

        try {
            await downloadVideo(
                video.id,
                job.format,
                job.quality,
                job.outputDir,
                (progress) => {
                    video.progress = progress
                    this._emitProgress(jobId)
                }
            )

            video.status = 'completed'
            video.progress = 100
            job.completedCount++
        } catch (err) {
            video.retries++

            if (video.retries < MAX_RETRIES) {
                // Re-queue for retry
                video.status = 'pending'
                video.progress = 0
                video.error = null
                this.queue.push({ jobId, video })
            } else {
                video.status = 'failed'
                video.error = err.message
                job.failedCount++
            }
        }

        // Check if job is complete
        const allDone = job.videos.every(v =>
            v.status === 'completed' || v.status === 'failed'
        )
        if (allDone) {
            job.status = 'completed'
        }

        this._emitProgress(jobId)
    }

    /**
     * Emit progress event for SSE consumers
     */
    _emitProgress(jobId) {
        const job = this.jobs.get(jobId)
        if (!job) return

        this.emit(`progress:${jobId}`, {
            jobId,
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
        })
    }

    /**
     * Get job state
     */
    getJob(jobId) {
        return this.jobs.get(jobId) || null
    }

    /**
     * Cancel a job
     */
    cancelJob(jobId) {
        const job = this.jobs.get(jobId)
        if (job) {
            job.status = 'cancelled'
            this.queue = this.queue.filter(t => t.jobId !== jobId)
            this._emitProgress(jobId)
        }
    }

    /**
     * Retry failed videos in a job
     */
    retryFailed(jobId) {
        const job = this.jobs.get(jobId)
        if (!job) return null

        const failedVideos = job.videos.filter(v => v.status === 'failed')
        failedVideos.forEach(v => {
            v.status = 'pending'
            v.progress = 0
            v.retries = 0
            v.error = null
            this.queue.push({ jobId, video: v })
        })

        job.failedCount = 0
        job.status = 'active'
        this._processQueue()

        return job
    }

    /**
     * Update concurrency
     */
    setConcurrency(n) {
        this.concurrency = Math.max(1, Math.min(n, 10))
        this._processQueue()
    }
}

// Singleton export
export const downloadQueue = new DownloadQueue()
