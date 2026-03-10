export default function ProgressBar({ value = 0, className = '', showLabel = true }) {
    const clamped = Math.min(100, Math.max(0, value))

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="progress-track flex-1">
                <div
                    className="progress-fill"
                    style={{ width: `${clamped}%` }}
                />
            </div>
            {showLabel && (
                <span
                    className="text-sm font-semibold min-w-[3rem] text-right"
                    style={{
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-text-secondary)'
                    }}
                >
                    {Math.round(clamped)}%
                </span>
            )}
        </div>
    )
}
