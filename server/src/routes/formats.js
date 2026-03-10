import { Router } from 'express'
import { getFormats } from '../services/ytdlp.js'
import { sanitizeForShell } from '../utils/sanitize.js'

export const formatsRouter = Router()

/**
 * GET /api/formats/:videoId
 * Get available download formats for a video
 */
formatsRouter.get('/:videoId', async (req, res, next) => {
    try {
        const videoId = sanitizeForShell(req.params.videoId)

        if (!videoId || videoId.length > 30) {
            return res.status(400).json({
                success: false,
                error: 'Invalid video ID',
            })
        }

        const formats = await getFormats(videoId)

        res.json({
            success: true,
            data: formats,
        })
    } catch (err) {
        next(err)
    }
})
