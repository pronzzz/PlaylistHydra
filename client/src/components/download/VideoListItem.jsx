import Badge from '../ui/Badge'
import ProgressBar from '../ui/ProgressBar'

export default function VideoListItem({ video, index }) {
    return (
        <div
            className="soft-raised-sm flex items-center gap-4 p-4 animate-fade-in"
            style={{ animationDelay: `${Math.min(index * 40, 300)}ms` }}
        >
            {/* Index */}
            <span
                className="text-sm font-bold min-w-[2rem] text-center"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
            >
                {index + 1}
            </span>

            {/* Thumbnail */}
            {video.thumbnail && (
                <div
                    className="flex-shrink-0 overflow-hidden"
                    style={{
                        borderRadius: 'var(--radius-sm)',
                        width: '64px',
                        height: '36px',
                        background: 'var(--color-bg-deep)',
                    }}
                >
                    <img
                        src={video.thumbnail}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => { e.target.style.display = 'none' }}
                    />
                </div>
            )}

            {/* Title & Progress */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" title={video.title}>
                    {video.title}
                </p>
                {video.status === 'downloading' && (
                    <ProgressBar value={video.progress} className="mt-1" showLabel={false} />
                )}
            </div>

            {/* Duration */}
            {video.duration > 0 && (
                <span
                    className="text-xs hidden sm:block"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
                >
                    {formatDuration(video.duration)}
                </span>
            )}

            {/* Status Badge */}
            {video.status && <Badge status={video.status} />}
        </div>
    )
}

function formatDuration(seconds) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${String(s).padStart(2, '0')}`
}
