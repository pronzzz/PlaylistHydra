import { create } from 'zustand'
import { fetchPlaylist } from '../lib/api.js'

const DEFAULT_BATCH_SIZE = 50

export const usePlaylistStore = create((set, get) => ({
    // ── State ──
    url: '',
    playlist: null,          // { type, title, videoCount, videos[], channel?, duration?, thumbnail? }
    isLoading: false,
    error: null,

    // Batch navigation
    currentBatchIndex: 0,
    batchSize: DEFAULT_BATCH_SIZE,

    // Format selection
    format: 'mp3',           // Default to MP3 (ytmp3.gg-style)
    quality: '320kbps',

    // ── Derived ──
    isSingleVideo: () => get().playlist?.type === 'video',
    isPlaylist: () => get().playlist?.type === 'playlist',

    // ── Actions ──
    setUrl: (url) => set({ url }),

    setFormat: (format) => {
        const defaultQuality = format === 'mp4' ? '720p' : '320kbps'
        set({ format, quality: defaultQuality })
    },

    setQuality: (quality) => set({ quality }),

    fetchPlaylist: async (url) => {
        set({ isLoading: true, error: null, playlist: null, currentBatchIndex: 0 })
        try {
            const data = await fetchPlaylist(url)
            set({ playlist: data, isLoading: false, url })
            return data
        } catch (err) {
            set({ error: err.message, isLoading: false })
            throw err
        }
    },

    // Batch navigation (only relevant for playlists)
    getCurrentBatch: () => {
        const { playlist, currentBatchIndex, batchSize } = get()
        if (!playlist) return null

        const start = currentBatchIndex * batchSize
        const end = Math.min(start + batchSize, playlist.videos.length)
        const totalBatches = Math.ceil(playlist.videos.length / batchSize)

        return {
            videos: playlist.videos.slice(start, end),
            startIndex: start,
            endIndex: end,
            batchNumber: currentBatchIndex + 1,
            totalBatches,
            hasNext: end < playlist.videos.length,
            hasPrev: currentBatchIndex > 0,
        }
    },

    nextBatch: () => {
        const { currentBatchIndex, playlist, batchSize } = get()
        const totalBatches = Math.ceil((playlist?.videos.length || 0) / batchSize)
        if (currentBatchIndex < totalBatches - 1) {
            set({ currentBatchIndex: currentBatchIndex + 1 })
        }
    },

    prevBatch: () => {
        const { currentBatchIndex } = get()
        if (currentBatchIndex > 0) {
            set({ currentBatchIndex: currentBatchIndex - 1 })
        }
    },

    reset: () => set({
        url: '',
        playlist: null,
        isLoading: false,
        error: null,
        currentBatchIndex: 0,
        format: 'mp3',
        quality: '320kbps',
    }),
}))
