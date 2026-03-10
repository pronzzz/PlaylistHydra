import { create } from 'zustand'
import { startDownload, cancelJob, retryFailed, subscribeToProgress } from '../lib/api.js'

export const useDownloadStore = create((set, get) => ({
    // ── State ──
    jobId: null,
    jobStatus: null,          // 'active' | 'completed' | 'cancelled'
    totalVideos: 0,
    completedCount: 0,
    failedCount: 0,
    videos: [],               // [{ id, title, status, progress, error }]
    isStarting: false,
    error: null,
    unsubscribe: null,         // SSE cleanup fn

    // ── Derived ──
    overallProgress: () => {
        const { totalVideos, completedCount } = get()
        if (totalVideos === 0) return 0
        return Math.round((completedCount / totalVideos) * 100)
    },

    // ── Actions ──
    startDownload: async ({ videos, format, quality, playlistTitle }) => {
        set({ isStarting: true, error: null })
        try {
            const data = await startDownload({ videos, format, quality, playlistTitle })
            set({
                jobId: data.jobId,
                jobStatus: 'active',
                totalVideos: data.totalVideos,
                isStarting: false,
            })

            // Subscribe to SSE progress
            const unsub = subscribeToProgress(
                data.jobId,
                (progressData) => {
                    set({
                        jobStatus: progressData.status,
                        totalVideos: progressData.totalVideos,
                        completedCount: progressData.completedCount,
                        failedCount: progressData.failedCount,
                        videos: progressData.videos,
                    })
                },
                () => {
                    // On done
                    set({ jobStatus: 'completed' })
                }
            )

            set({ unsubscribe: unsub })
            return data
        } catch (err) {
            set({ error: err.message, isStarting: false })
            throw err
        }
    },

    cancelDownload: async () => {
        const { jobId, unsubscribe } = get()
        if (!jobId) return

        try {
            await cancelJob(jobId)
            if (unsubscribe) unsubscribe()
            set({ jobStatus: 'cancelled', unsubscribe: null })
        } catch (err) {
            set({ error: err.message })
        }
    },

    retryFailed: async () => {
        const { jobId, unsubscribe } = get()
        if (!jobId) return

        try {
            await retryFailed(jobId)

            // Re-subscribe to SSE
            if (unsubscribe) unsubscribe()

            const unsub = subscribeToProgress(
                jobId,
                (progressData) => {
                    set({
                        jobStatus: progressData.status,
                        totalVideos: progressData.totalVideos,
                        completedCount: progressData.completedCount,
                        failedCount: progressData.failedCount,
                        videos: progressData.videos,
                    })
                },
                () => {
                    set({ jobStatus: 'completed' })
                }
            )

            set({ jobStatus: 'active', unsubscribe: unsub })
        } catch (err) {
            set({ error: err.message })
        }
    },

    reset: () => {
        const { unsubscribe } = get()
        if (unsubscribe) unsubscribe()
        set({
            jobId: null,
            jobStatus: null,
            totalVideos: 0,
            completedCount: 0,
            failedCount: 0,
            videos: [],
            isStarting: false,
            error: null,
            unsubscribe: null,
        })
    },
}))
