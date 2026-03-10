import { Router } from 'express'
import { validate, youtubeUrlSchema, playlistUrlSchema } from '../middleware/validation.js'
import { detectUrlType } from '../middleware/validation.js'
import { getPlaylistInfo, getVideoInfo } from '../services/ytdlp.js'
import { MAX_PLAYLIST_SIZE } from '../utils/constants.js'

export const playlistRouter = Router()

/**
 * POST /api/playlist
 * Unified endpoint: detects if URL is a single video or playlist
 * Returns appropriate metadata for either type.
 */
playlistRouter.post('/', async (req, res, next) => {
    try {
        const { url } = req.body

        if (!url || typeof url !== 'string') {
            return res.status(400).json({ success: false, error: 'URL is required' })
        }

        const urlType = detectUrlType(url.trim())

        if (urlType === 'unknown') {
            return res.status(400).json({
                success: false,
                error: 'Invalid URL. Please provide a YouTube video or playlist link.',
            })
        }

        if (urlType === 'video') {
            // Single video mode
            const videoInfo = await getVideoInfo(url.trim())
            return res.json({
                success: true,
                data: {
                    type: 'video',
                    title: videoInfo.title,
                    videoCount: 1,
                    channel: videoInfo.channel,
                    duration: videoInfo.duration,
                    thumbnail: videoInfo.thumbnail,
                    videos: [videoInfo],
                },
            })
        }

        // Playlist mode
        const playlist = await getPlaylistInfo(url.trim())

        if (playlist.videoCount > MAX_PLAYLIST_SIZE) {
            return res.status(400).json({
                success: false,
                error: `Playlist too large. Maximum ${MAX_PLAYLIST_SIZE} videos allowed.`,
            })
        }

        return res.json({
            success: true,
            data: {
                type: 'playlist',
                ...playlist,
            },
        })
    } catch (err) {
        next(err)
    }
})
