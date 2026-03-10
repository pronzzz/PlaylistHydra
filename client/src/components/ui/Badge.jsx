const STATUS_MAP = {
    pending: { className: 'badge-pending', icon: '◻', label: 'Pending' },
    downloading: { className: 'badge-downloading', icon: '↓', label: 'Downloading' },
    completed: { className: 'badge-completed', icon: '✓', label: 'Completed' },
    failed: { className: 'badge-failed', icon: '✕', label: 'Failed' },
}

export default function Badge({ status }) {
    const config = STATUS_MAP[status] || STATUS_MAP.pending

    return (
        <span className={`badge ${config.className}`}>
            <span>{config.icon}</span>
            {config.label}
        </span>
    )
}
