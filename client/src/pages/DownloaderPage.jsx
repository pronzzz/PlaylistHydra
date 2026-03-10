import { useNavigate } from 'react-router-dom'
import { usePlaylistStore } from '../store/usePlaylistStore'
import { useDownloadStore } from '../store/useDownloadStore'
import PlaylistInput from '../components/download/PlaylistInput'
import PlaylistInfo from '../components/download/PlaylistInfo'
import FormatSelector from '../components/download/FormatSelector'
import VideoListItem from '../components/download/VideoListItem'
import BatchNavigator from '../components/download/BatchNavigator'
import DownloadProgress from '../components/download/DownloadProgress'
import DownloadControls from '../components/download/DownloadControls'

export default function DownloaderPage() {
    const navigate = useNavigate()

    const {
        playlist, isLoading, error,
        format, quality,
        setFormat, setQuality,
        fetchPlaylist, getCurrentBatch, nextBatch, prevBatch,
        reset: resetPlaylist,
        isSingleVideo,
    } = usePlaylistStore()

    const {
        jobId, jobStatus, totalVideos, completedCount, failedCount,
        videos: downloadVideos, isStarting,
        startDownload, cancelDownload, retryFailed, reset: resetDownload,
    } = useDownloadStore()

    const batch = getCurrentBatch()
    const singleVideo = isSingleVideo()

    const displayVideos = batch?.videos.map(v => {
        const dlState = downloadVideos.find(dv => dv.id === v.id)
        return dlState ? { ...v, ...dlState } : v
    }) || []

    const handleFetch = async (url) => {
        resetDownload()
        try {
            await fetchPlaylist(url)
        } catch (e) {
            // Error handled by store
        }
    }

    const handleStartDownload = async () => {
        if (!playlist) return
        const videosToDownload = singleVideo ? playlist.videos : batch?.videos
        if (!videosToDownload?.length) return
        await startDownload({
            videos: videosToDownload,
            format,
            quality,
            playlistTitle: playlist.title,
        })
    }

    const handleNewPlaylist = () => {
        resetPlaylist()
        resetDownload()
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>

            {/* Header */}
            <header className="py-5 px-6">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 cursor-pointer bg-transparent border-none"
                        style={{ fontFamily: 'var(--font-display)' }}
                    >
                        <span className="text-2xl">🐉</span>
                        <span
                            className="text-lg font-bold"
                            style={{ color: 'var(--color-primary-dark)' }}
                        >
                            PlaylistHydra
                        </span>
                    </button>

                    {playlist && (
                        <button onClick={handleNewPlaylist} className="btn-soft text-sm">
                            ✕ New
                        </button>
                    )}
                </div>
            </header>

            {/* Main */}
            <main className="max-w-3xl mx-auto px-4 pb-20">

                {/* ═══ Step 1: Input ═══ */}
                {!playlist && (
                    <div className="mt-8 sm:mt-16 text-center animate-fade-in">
                        <div className="mb-6">
                            <span className="text-5xl">🐉</span>
                            <h1
                                className="text-2xl sm:text-3xl font-bold mt-3"
                                style={{ fontFamily: 'var(--font-display)' }}
                            >
                                Convert YouTube to{' '}
                                <span style={{ color: 'var(--color-primary)' }}>MP3</span>
                                {' '}or{' '}
                                <span style={{ color: 'var(--color-accent-dark)' }}>MP4</span>
                            </h1>
                            <p
                                className="text-sm mt-2"
                                style={{ color: 'var(--color-text-muted)' }}
                            >
                                Paste any video or playlist • Batch downloads up to 1000 videos
                            </p>
                        </div>

                        <div
                            className="soft-raised p-6 sm:p-8"
                            style={{ borderRadius: 'var(--radius-lg)' }}
                        >
                            <PlaylistInput onFetch={handleFetch} isLoading={isLoading} />
                        </div>

                        {isLoading && (
                            <div className="mt-6 animate-pulse-soft">
                                <div className="flex items-center justify-center gap-3">
                                    <span className="spinner" />
                                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                                        Analyzing video...
                                    </span>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div
                                className="soft-raised p-4 mt-4 animate-fade-in text-left"
                                style={{
                                    borderRadius: 'var(--radius-md)',
                                    borderLeft: '4px solid var(--color-danger)',
                                }}
                            >
                                <p className="text-sm" style={{ color: 'var(--color-danger-dark)' }}>
                                    ❌ {error}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══ Step 2: Results ═══ */}
                {playlist && (
                    <div className="mt-8 space-y-6 stagger">
                        <PlaylistInfo playlist={playlist} />

                        <FormatSelector
                            format={format}
                            quality={quality}
                            onFormatChange={setFormat}
                            onQualityChange={setQuality}
                        />

                        <DownloadControls
                            jobStatus={jobStatus}
                            jobId={jobId}
                            failedCount={failedCount}
                            onStart={handleStartDownload}
                            onCancel={cancelDownload}
                            onRetry={retryFailed}
                            isStarting={isStarting}
                            hasPlaylist={!!playlist}
                        />

                        {jobStatus && (
                            <DownloadProgress
                                totalVideos={totalVideos}
                                completedCount={completedCount}
                                failedCount={failedCount}
                                jobStatus={jobStatus}
                            />
                        )}

                        {!singleVideo && playlist.videoCount > 50 && (
                            <BatchNavigator
                                batch={batch}
                                onNext={nextBatch}
                                onPrev={prevBatch}
                            />
                        )}

                        {!singleVideo && batch && (
                            <div className="space-y-3 mt-2">
                                <h4
                                    className="text-xs font-semibold uppercase tracking-wider px-1"
                                    style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}
                                >
                                    Videos in this batch
                                </h4>
                                {displayVideos.map((video, idx) => (
                                    <VideoListItem
                                        key={video.id}
                                        video={video}
                                        index={batch.startIndex + idx}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <footer className="mt-16 text-center pb-8" style={{ color: 'var(--color-text-muted)' }}>
                    <p className="text-xs">
                        PlaylistHydra uses{' '}
                        <span style={{ fontFamily: 'var(--font-mono)' }}>yt-dlp</span>
                        {' '}· Supports 500+ video playlists · Powered by SSE streaming
                    </p>
                </footer>
            </main>
        </div>
    )
}
