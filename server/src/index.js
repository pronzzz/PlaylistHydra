import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import path from 'path'
import { fileURLToPath } from 'url'
import { playlistRouter } from './routes/playlist.js'
import { formatsRouter } from './routes/formats.js'
import { downloadRouter } from './routes/download.js'
import { errorHandler } from './middleware/errorHandler.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001
const IS_PROD = process.env.NODE_ENV === 'production'

// ── Security ──
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({
    origin: IS_PROD ? true : (process.env.CLIENT_URL || 'http://localhost:5173'),
    credentials: true,
}))

// ── Rate Limiting ──
app.use('/api/', rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: { error: 'Too many requests, please try again later.' },
}))

// ── Body Parsing ──
app.use(express.json({ limit: '1mb' }))

// ── API Routes ──
app.use('/api/playlist', playlistRouter)
app.use('/api/formats', formatsRouter)
app.use('/api/download', downloadRouter)

// ── Health Check ──
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', name: 'PlaylistHydra', version: '1.0.0' })
})

// ── Serve Frontend in Production ──
if (IS_PROD) {
    const clientDist = path.resolve(__dirname, '../../client/dist')
    app.use(express.static(clientDist))
    // SPA fallback — serve index.html for all non-API routes
    app.get('*', (_req, res) => {
        res.sendFile(path.join(clientDist, 'index.html'))
    })
}

// ── Error Handler ──
app.use(errorHandler)

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  🐉 PlaylistHydra server running on port ${PORT}\n`)
})

export default app
