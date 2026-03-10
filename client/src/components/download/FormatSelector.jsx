import Toggle from '../ui/Toggle'
import Select from '../ui/Select'
import Card from '../ui/Card'

const MP4_QUALITIES = [
    { value: '360p', label: '360p — SD' },
    { value: '480p', label: '480p — SD+' },
    { value: '720p', label: '720p — HD' },
    { value: '1080p', label: '1080p — Full HD' },
    { value: 'best', label: 'Best Available' },
]

const MP3_QUALITIES = [
    { value: '128kbps', label: '128 kbps — Standard' },
    { value: '192kbps', label: '192 kbps — High' },
    { value: '320kbps', label: '320 kbps — Maximum' },
]

export default function FormatSelector({ format, quality, onFormatChange, onQualityChange }) {
    const qualities = format === 'mp4' ? MP4_QUALITIES : MP3_QUALITIES

    return (
        <Card className="animate-fade-in p-6">
            <h4
                className="text-xs font-semibold mb-5 uppercase tracking-wider"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}
            >
                Download Format
            </h4>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Format Toggle */}
                <Toggle
                    value={format}
                    onChange={onFormatChange}
                    options={[
                        { value: 'mp4', label: '🎬 MP4' },
                        { value: 'mp3', label: '🎵 MP3' },
                    ]}
                />

                {/* Quality Dropdown */}
                <div className="flex-1 w-full sm:w-auto">
                    <Select
                        value={quality}
                        onChange={onQualityChange}
                        options={qualities}
                    />
                </div>
            </div>
        </Card>
    )
}
