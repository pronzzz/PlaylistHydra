import Card from '../ui/Card'

export default function PlaylistInfo({ playlist }) {
    if (!playlist) return null

    const isSingle = playlist.type === 'video'

    if (isSingle) {
        return <SingleVideoInfo video={playlist.videos[0]} />
    }

    return <PlaylistSummary playlist={playlist} />
}

/**
 * Single video card — ytmp3.gg style
 */
function SingleVideoInfo({ video }) {
    return (
        <Card className="animate-fade-in">
            <div className="flex gap-5">
                {/* Thumbnail */}
                {video.thumbnail && (
                    <div
                        className="soft-inset overflow-hidden flex-shrink-0"
                        style={{ borderRadius: 'var(--radius-md)', width: '200px', height: '112px' }}
                    >
                        <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.parentElement.style.display = 'none' }}
                        />
                    </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3
                        className="text-base font-bold leading-snug line-clamp-2"
                        style={{ fontFamily: 'var(--font-display)' }}
                    >
                        {video.title}
                    </h3>

                    {video.channel && (
                        <p
                            className="text-sm mt-1"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            {video.channel}
                        </p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-3">
                        {video.duration > 0 && (
                            <MiniPill icon="⏱" value={formatDuration(video.duration)} />
                        )}
                        <MiniPill icon="🎬" value="Ready to convert" accent />
                    </div>
                </div>
            </div>
        </Card>
    )
}

/**
 * Playlist summary card
 */
function PlaylistSummary({ playlist }) {
    const totalDuration = playlist.videos.reduce((sum, v) => sum + (v.duration || 0), 0)
    const hours = Math.floor(totalDuration / 3600)
    const minutes = Math.floor((totalDuration % 3600) / 60)

    return (
        <Card className="animate-fade-in">
            <div className="flex items-start gap-5">
                {/* Thumbnail */}
                {playlist.videos[0]?.thumbnail && (
                    <div
                        className="soft-inset overflow-hidden flex-shrink-0 relative"
                        style={{ borderRadius: 'var(--radius-md)', width: '160px', height: '90px' }}
                    >
                        <img
                            src={playlist.videos[0].thumbnail}
                            alt={playlist.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.parentElement.style.display = 'none' }}
                        />
                        {/* Video count overlay */}
                        <div
                            className="absolute bottom-1 right-1 px-2 py-0.5 text-xs font-bold text-white"
                            style={{
                                background: 'rgba(0,0,0,0.7)',
                                borderRadius: 'var(--radius-sm)',
                                fontFamily: 'var(--font-mono)',
                            }}
                        >
                            {playlist.videoCount} videos
                        </div>
                    </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span
                            className="text-xs font-bold uppercase px-2 py-0.5"
                            style={{
                                background: 'rgba(125, 162, 255, 0.15)',
                                color: 'var(--color-primary)',
                                borderRadius: 'var(--radius-full)',
                                fontFamily: 'var(--font-display)',
                            }}
                        >
                            Playlist
                        </span>
                    </div>
                    <h3
                        className="text-base font-bold leading-snug line-clamp-2"
                        style={{ fontFamily: 'var(--font-display)' }}
                    >
                        {playlist.title}
                    </h3>

                    <div className="flex flex-wrap gap-2 mt-3">
                        <MiniPill icon="📹" value={`${playlist.videoCount} videos`} />
                        <MiniPill
                            icon="⏱"
                            value={hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
                        />
                        <MiniPill icon="📦" value={estimateSize(playlist.videoCount)} />
                    </div>
                </div>
            </div>
        </Card>
    )
}

function MiniPill({ icon, value, accent }) {
    return (
        <span
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold"
            style={{
                background: accent ? 'rgba(142, 209, 178, 0.12)' : 'var(--color-bg)',
                color: accent ? 'var(--color-accent-dark)' : 'var(--color-text-secondary)',
                borderRadius: 'var(--radius-full)',
                fontFamily: 'var(--font-display)',
            }}
        >
            <span>{icon}</span>
            {value}
        </span>
    )
}

function formatDuration(seconds) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${m}:${String(s).padStart(2, '0')}`
}

function estimateSize(videoCount) {
    const totalMB = videoCount * 50
    if (totalMB >= 1000) return `~${(totalMB / 1000).toFixed(1)} GB`
    return `~${totalMB} MB`
}
