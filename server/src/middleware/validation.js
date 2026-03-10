import { z } from 'zod'

/**
 * Validates a YouTube URL (playlist or single video)
 */
const YOUTUBE_PLAYLIST_REGEX = /^https?:\/\/(www\.)?(music\.)?(youtube\.com|youtu\.be)\/(playlist\?list=|watch\?.*list=)[A-Za-z0-9_-]+/
const YOUTUBE_VIDEO_REGEX = /^https?:\/\/(www\.)?(music\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)[A-Za-z0-9_-]+/

export const playlistUrlSchema = z.object({
    url: z.string()
        .url('Must be a valid URL')
        .regex(YOUTUBE_PLAYLIST_REGEX, 'Must be a valid YouTube playlist URL'),
})

export const videoUrlSchema = z.object({
    url: z.string()
        .url('Must be a valid URL')
        .regex(YOUTUBE_VIDEO_REGEX, 'Must be a valid YouTube video URL'),
})

/**
 * Schema that accepts either a playlist or video URL
 */
export const youtubeUrlSchema = z.object({
    url: z.string()
        .url('Must be a valid URL')
        .refine(
            (url) => YOUTUBE_PLAYLIST_REGEX.test(url) || YOUTUBE_VIDEO_REGEX.test(url),
            'Must be a valid YouTube video or playlist URL'
        ),
})

export const downloadRequestSchema = z.object({
    playlistUrl: z.string().url().optional(),
    videoIds: z.array(z.string()).min(1).max(1000),
    format: z.enum(['mp4', 'mp3']),
    quality: z.string(),
    batchSize: z.number().int().min(1).max(100).default(50),
})

/**
 * Detect URL type
 */
export function detectUrlType(url) {
    if (YOUTUBE_PLAYLIST_REGEX.test(url)) return 'playlist'
    if (YOUTUBE_VIDEO_REGEX.test(url)) return 'video'
    return 'unknown'
}

/**
 * Middleware factory: validates req.body against a Zod schema
 */
export function validate(schema) {
    return (req, _res, next) => {
        try {
            req.body = schema.parse(req.body)
            next()
        } catch (err) {
            err.name = 'ZodError'
            err.status = 400
            next(err)
        }
    }
}
