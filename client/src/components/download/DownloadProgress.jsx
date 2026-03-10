import Card from '../ui/Card'
import ProgressBar from '../ui/ProgressBar'

export default function DownloadProgress({
    totalVideos,
    completedCount,
    failedCount,
    jobStatus
}) {
    const progress = totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0
    const pendingCount = totalVideos - completedCount - failedCount

    return (
        <Card className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
                <h4
                    className="text-sm font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}
                >
                    Download Progress
                </h4>
                <StatusIndicator status={jobStatus} />
            </div>

            {/* Overall Progress Bar */}
            <ProgressBar value={progress} className="mb-5" />

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
                <StatBox
                    label="Completed"
                    value={completedCount}
                    color="var(--color-accent)"
                    icon="✓"
                />
                <StatBox
                    label="Pending"
                    value={pendingCount}
                    color="var(--color-primary)"
                    icon="◻"
                />
                <StatBox
                    label="Failed"
                    value={failedCount}
                    color="var(--color-danger)"
                    icon="✕"
                />
            </div>
        </Card>
    )
}

function StatBox({ label, value, color, icon }) {
    return (
        <div className="soft-inset p-3 text-center" style={{ borderRadius: 'var(--radius-sm)' }}>
            <span className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>
                {icon} {label}
            </span>
            <span
                className="text-xl font-bold block"
                style={{ fontFamily: 'var(--font-display)', color }}
            >
                {value}
            </span>
        </div>
    )
}

function StatusIndicator({ status }) {
    const config = {
        active: { label: 'Downloading', color: 'var(--color-primary)', pulse: true },
        completed: { label: 'Complete', color: 'var(--color-accent)', pulse: false },
        cancelled: { label: 'Cancelled', color: 'var(--color-danger)', pulse: false },
        paused: { label: 'Paused', color: 'var(--color-warning)', pulse: false },
    }

    const c = config[status] || config.active

    return (
        <div className="flex items-center gap-2">
            <span
                className={`w-2.5 h-2.5 rounded-full ${c.pulse ? 'animate-pulse-soft' : ''}`}
                style={{ background: c.color }}
            />
            <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: c.color, fontFamily: 'var(--font-display)' }}
            >
                {c.label}
            </span>
        </div>
    )
}
