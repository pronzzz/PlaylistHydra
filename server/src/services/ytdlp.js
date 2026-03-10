import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs/promises'
import { sanitizeForShell, sanitizeFilename } from '../utils/sanitize.js'
import { DOWNLOAD_DIR } from '../utils/constants.js'

/**
 * Get playlist metadata using yt-dlp --flat-playlist
 */
export async function getPlaylistInfo(url) {
    const sanitizedUrl = sanitizeForShell(url)

    return new Promise((resolve, reject) => {
        const args = [
            '--flat-playlist',
            '--dump-json',
            '--no-warnings',
            '--ignore-errors',
            sanitizedUrl,
        ]

        const proc = spawn('yt-dlp', args, { timeout: 120_000 })
        let stdout = ''
        let stderr = ''

        proc.stdout.on('data', (data) => { stdout += data.toString() })
        proc.stderr.on('data', (data) => { stderr += data.toString() })

        proc.on('close', (code) => {
            if (code !== 0 && !stdout) {
                return reject(new Error(`yt-dlp failed: ${stderr || 'Unknown error'}`))
            }

            try {
                const lines = stdout.trim().split('\n').filter(Boolean)
                const videos = lines.map((line) => {
                    const info = JSON.parse(line)
                    return {
                        id: info.id,
                        title: info.title || 'Untitled',
                        duration: info.duration || 0,
                        thumbnail: info.thumbnails?.[0]?.url || info.thumbnail || null,
                        url: info.url || info.webpage_url || `https://www.youtube.com/watch?v=${info.id}`,
                    }
                })

                const firstParsed = JSON.parse(lines[0])
                const playlistTitle = firstParsed.playlist_title || firstParsed.playlist || 'Untitled Playlist'

                resolve({
                    title: playlistTitle,
                    videoCount: videos.length,
                    videos,
                })
            } catch (err) {
                reject(new Error(`Failed to parse yt-dlp output: ${err.message}`))
            }
        })

        proc.on('error', (err) => {
            reject(new Error(`Failed to run yt-dlp: ${err.message}. Is yt-dlp installed?`))
        })
    })
}

/**
 * Get single video info
 */
export async function getVideoInfo(url) {
    const sanitizedUrl = sanitizeForShell(url)

    return new Promise((resolve, reject) => {
        const args = ['--dump-json', '--no-download', '--no-warnings', sanitizedUrl]
        const proc = spawn('yt-dlp', args, { timeout: 30_000 })
        let stdout = ''
        let stderr = ''

        proc.stdout.on('data', (data) => { stdout += data.toString() })
        proc.stderr.on('data', (data) => { stderr += data.toString() })

        proc.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(`yt-dlp failed: ${stderr || 'Unknown error'}`))
            }

            try {
                const info = JSON.parse(stdout)
                resolve({
                    id: info.id,
                    title: info.title || 'Untitled',
                    duration: info.duration || 0,
                    thumbnail: info.thumbnail || null,
                    channel: info.channel || info.uploader || 'Unknown',
                    viewCount: info.view_count || 0,
                    uploadDate: info.upload_date || null,
                    url: info.webpage_url || url,
                })
            } catch (err) {
                reject(new Error(`Failed to parse video info: ${err.message}`))
            }
        })

        proc.on('error', (err) => {
            reject(new Error(`Failed to run yt-dlp: ${err.message}`))
        })
    })
}

/**
 * Get available formats for a specific video
 */
export async function getFormats(videoId) {
    const sanitizedId = sanitizeForShell(videoId)
    const url = `https://www.youtube.com/watch?v=${sanitizedId}`

    return new Promise((resolve, reject) => {
        const args = ['--dump-json', '--no-download', '--no-warnings', url]
        const proc = spawn('yt-dlp', args, { timeout: 30_000 })
        let stdout = ''
        let stderr = ''

        proc.stdout.on('data', (data) => { stdout += data.toString() })
        proc.stderr.on('data', (data) => { stderr += data.toString() })

        proc.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(`yt-dlp format check failed: ${stderr}`))
            }

            try {
                const info = JSON.parse(stdout)
                const formats = (info.formats || [])
                    .filter(f => f.ext && f.format_note)
                    .map(f => ({
                        formatId: f.format_id,
                        ext: f.ext,
                        quality: f.format_note,
                        resolution: f.resolution || null,
                        fps: f.fps || null,
                        filesize: f.filesize || f.filesize_approx || null,
                        acodec: f.acodec,
                        vcodec: f.vcodec,
                        isAudioOnly: f.vcodec === 'none',
                    }))

                resolve({
                    videoId,
                    title: info.title,
                    duration: info.duration,
                    thumbnail: info.thumbnail,
                    formats,
                })
            } catch (err) {
                reject(new Error(`Failed to parse format data: ${err.message}`))
            }
        })

        proc.on('error', (err) => {
            reject(new Error(`Failed to run yt-dlp: ${err.message}`))
        })
    })
}

/**
 * Download a single video. Returns a progress emitter via callback.
 */
export function downloadVideo(videoId, format, quality, outputDir, onProgress) {
    return new Promise(async (resolve, reject) => {
        const sanitizedId = sanitizeForShell(videoId)
        const url = `https://www.youtube.com/watch?v=${sanitizedId}`

        console.log(`[download] Starting: ${videoId} → ${format}/${quality} → ${outputDir}`)

        await fs.mkdir(outputDir, { recursive: true })

        const outputTemplate = path.join(outputDir, '%(title)s.%(ext)s')

        const args = [
            '--newline',
            '--no-warnings',
            '--no-check-certificates',
            '--prefer-free-formats',
            '--no-playlist',
            '-o', outputTemplate,
        ]

        if (format === 'mp3') {
            args.push('-x', '--audio-format', 'mp3')
            const bitrateMap = {
                '128kbps': '128',
                '192kbps': '192',
                '320kbps': '320',
            }
            const bitrate = bitrateMap[quality] || '192'
            args.push('--audio-quality', bitrate + 'K')
        } else {
            const qualityMap = {
                '360p': 'bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/best[height<=360]',
                '480p': 'bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480]',
                '720p': 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720]',
                '1080p': 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080]',
                'best': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best',
            }
            const formatStr = qualityMap[quality] || qualityMap['best']
            args.push('-f', formatStr, '--merge-output-format', 'mp4')
        }

        args.push(url)

        console.log(`[download] yt-dlp args: ${args.join(' ')}`)

        const proc = spawn('yt-dlp', args, { timeout: 600_000 })
        let stderr = ''
        let stdout = ''

        proc.stdout.on('data', (data) => {
            const line = data.toString().trim()
            stdout += line + '\n'
            const match = line.match(/\[download\]\s+([\d.]+)%/)
            if (match && onProgress) {
                onProgress(parseFloat(match[1]))
            }
        })

        proc.stderr.on('data', (data) => { stderr += data.toString() })

        proc.on('close', (code) => {
            if (code === 0) {
                console.log(`[download] ✅ Completed: ${videoId}`)
                resolve({ success: true, videoId })
            } else {
                console.error(`[download] ❌ Failed: ${videoId} (exit code ${code})`)
                console.error(`[download] stderr: ${stderr}`)
                console.error(`[download] stdout: ${stdout}`)
                reject(new Error(`Download failed for ${videoId}: ${stderr || stdout || 'Unknown error'}`))
            }
        })

        proc.on('error', (err) => {
            console.error(`[download] ❌ Process error: ${videoId}: ${err.message}`)
            reject(new Error(`yt-dlp process error: ${err.message}`))
        })
    })
}
