import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function HomePage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">

            {/* Hero Content */}
            <div className="relative z-10 text-center max-w-xl stagger">
                {/* Logo */}
                <div
                    className="inline-flex items-center justify-center mb-8"
                    style={{
                        width: '96px',
                        height: '96px',
                        borderRadius: 'var(--radius-xl)',
                        background: 'var(--color-primary-pastel)',
                        border: '2px solid var(--color-primary-light)',
                    }}
                >
                    <span className="text-5xl">🐉</span>
                </div>

                {/* Title */}
                <h1
                    className="text-4xl sm:text-5xl font-black mb-2"
                    style={{
                        fontFamily: 'var(--font-display)',
                        color: 'var(--color-primary-dark)',
                        letterSpacing: '-0.02em',
                    }}
                >
                    PlaylistHydra
                </h1>

                {/* Tagline */}
                <p
                    className="text-base sm:text-lg mb-1"
                    style={{
                        color: 'var(--color-text-secondary)',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 500,
                    }}
                >
                    Cut off one video, download a hundred.
                </p>
                <p
                    className="text-sm mb-10 max-w-md mx-auto"
                    style={{ color: 'var(--color-text-muted)' }}
                >
                    Convert YouTube videos to MP3 or MP4. Paste a single video or an entire playlist —
                    we handle batching, progress, and retries.
                </p>

                {/* CTA Button */}
                <Button
                    variant="primary"
                    size="lg"
                    onClick={() => navigate('/download')}
                >
                    🚀 Start Converting
                </Button>

                {/* Feature Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-14">
                    <FeatureChip icon="🎵" title="MP3 / MP4" desc="Any format" />
                    <FeatureChip icon="📦" title="Batch" desc="500+ videos" />
                    <FeatureChip icon="🔄" title="Retry" desc="Auto-retry" />
                    <FeatureChip icon="📊" title="Live" desc="Real-time" />
                </div>

                {/* Trust line */}
                <p
                    className="text-xs mt-8"
                    style={{ color: 'var(--color-text-muted)' }}
                >
                    Powered by yt-dlp · No ads · No tracking · Open source
                </p>
            </div>
        </div>
    )
}

function FeatureChip({ icon, title, desc }) {
    return (
        <div
            className="soft-raised-sm flex flex-col items-center gap-1 py-4 px-3 cursor-default"
            style={{ borderRadius: 'var(--radius-md)' }}
        >
            <span className="text-xl">{icon}</span>
            <span
                className="text-xs font-bold"
                style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
            >
                {title}
            </span>
            <span
                className="text-xs"
                style={{ color: 'var(--color-text-muted)' }}
            >
                {desc}
            </span>
        </div>
    )
}
