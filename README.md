# 🐉 PlaylistHydra

> "Cut off one video, download a hundred."

A minimalist **Soft-UI** YouTube playlist downloader that handles massive playlists (500–1000+ videos) with batch processing, real-time progress tracking, and resumable downloads.

## Features

- **500+ Playlist Support** — Batched processing, memory-safe operations
- **Smart Batch Processing** — 50 videos per batch, configurable concurrency
- **Real-Time Progress** — SSE-powered live progress bars per video
- **Retry System** — Auto-retry failed downloads (3 attempts)
- **Format Flexibility** — MP4 (360p–1080p) / MP3 (128–320kbps)
- **Soft-UI Design** — Neumorphic, minimal, beautiful interface

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite 7, TailwindCSS v4, Zustand |
| Backend | Node.js, Express 5 |
| Download Engine | yt-dlp (via child_process) |
| Progress | Server-Sent Events (SSE) |

## Quick Start

```bash
# Prerequisites
brew install yt-dlp   # or pip install yt-dlp

# Install dependencies
cd client && npm install
cd ../server && npm install
cd ..

# Run development servers
npm run dev
```

Frontend: [http://localhost:5173](http://localhost:5173)  
Backend: [http://localhost:3001](http://localhost:3001)

## Project Structure

```
PlaylistHydra/
├── client/           # React + Vite frontend
│   ├── src/
│   │   ├── components/  # UI + domain components
│   │   ├── pages/       # Home, Downloader
│   │   ├── store/       # Zustand state
│   │   └── lib/         # API client
│   └── ...
├── server/           # Express backend
│   └── src/
│       ├── routes/      # API endpoints
│       ├── services/    # yt-dlp, queue, batch
│       └── middleware/  # validation, errors
└── downloads/        # Downloaded files
```

## License

MIT
