import Button from '../ui/Button'

export default function DownloadControls({
    jobStatus,
    jobId,
    failedCount,
    onStart,
    onCancel,
    onRetry,
    isStarting,
    hasPlaylist,
}) {
    const handleSave = () => {
        if (!jobId) return
        // Trigger zip download via browser navigation
        window.location.href = `/api/download/${jobId}/zip`
    }

    // Not started yet
    if (!jobStatus) {
        return (
            <div className="flex gap-3">
                <Button
                    variant="primary"
                    size="lg"
                    onClick={onStart}
                    loading={isStarting}
                    disabled={!hasPlaylist}
                    className="flex-1"
                >
                    {isStarting ? 'Starting...' : '⬇ Start Download'}
                </Button>
            </div>
        )
    }

    // Active download
    if (jobStatus === 'active') {
        return (
            <div className="flex gap-3">
                <Button
                    variant="danger"
                    onClick={onCancel}
                    className="flex-1"
                >
                    ⬜ Stop Download
                </Button>
            </div>
        )
    }

    // Completed
    if (jobStatus === 'completed') {
        return (
            <div className="flex flex-col gap-4">
                <div
                    className="soft-raised p-5 text-center"
                    style={{ borderRadius: 'var(--radius-md)' }}
                >
                    <span className="text-3xl">🎉</span>
                    <p
                        className="text-lg font-bold mt-2"
                        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent-dark)' }}
                    >
                        Download Complete!
                    </p>
                    <p
                        className="text-sm mt-1"
                        style={{ color: 'var(--color-text-muted)' }}
                    >
                        Your files are ready to save
                    </p>
                </div>

                <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSave}
                    className="w-full"
                >
                    💾 Save as ZIP
                </Button>

                {failedCount > 0 && (
                    <Button variant="danger" onClick={onRetry}>
                        🔄 Retry {failedCount} Failed
                    </Button>
                )}
            </div>
        )
    }

    // Cancelled
    if (jobStatus === 'cancelled') {
        return (
            <div className="flex gap-3">
                <Button variant="primary" onClick={onStart} className="flex-1">
                    ⬇ Restart Download
                </Button>
                {failedCount > 0 && (
                    <Button variant="danger" onClick={onRetry}>
                        🔄 Retry Failed
                    </Button>
                )}
            </div>
        )
    }

    return null
}
