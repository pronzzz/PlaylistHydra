import Button from '../ui/Button'

export default function BatchNavigator({ batch, onNext, onPrev }) {
    if (!batch) return null

    return (
        <div
            className="flex items-center justify-between p-4 soft-raised-sm"
            style={{ borderRadius: 'var(--radius-md)' }}
        >
            <Button
                size="sm"
                onClick={onPrev}
                disabled={!batch.hasPrev}
            >
                ← Previous
            </Button>

            <div className="text-center">
                <span
                    className="text-sm font-bold"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}
                >
                    {batch.startIndex + 1}–{batch.endIndex}
                </span>
                <span
                    className="text-sm mx-2"
                    style={{ color: 'var(--color-text-muted)' }}
                >
                    of {batch.totalBatches * 50 > batch.endIndex ? '...' : ''}
                </span>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Batch {batch.batchNumber} / {batch.totalBatches}
                </span>
            </div>

            <Button
                size="sm"
                onClick={onNext}
                disabled={!batch.hasNext}
            >
                Next →
            </Button>
        </div>
    )
}
