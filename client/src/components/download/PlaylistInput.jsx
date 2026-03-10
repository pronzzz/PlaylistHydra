import { useState } from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'

export default function PlaylistInput({ onFetch, isLoading }) {
    const [url, setUrl] = useState('')
    const [errorMsg, setErrorMsg] = useState('')

    const handleSubmit = (e) => {
        e?.preventDefault()
        setErrorMsg('')

        const trimmed = url.trim()
        if (!trimmed) {
            setErrorMsg('Please paste a YouTube link')
            return
        }

        // Accept any YouTube URL (video, playlist, shorts)
        const ytRegex = /^https?:\/\/(www\.)?(music\.)?(youtube\.com|youtu\.be)\//
        if (!ytRegex.test(trimmed)) {
            setErrorMsg('Please enter a valid YouTube URL')
            return
        }

        onFetch(trimmed)
    }

    const handlePaste = (e) => {
        // Auto-fetch on paste for instant UX
        setTimeout(() => {
            const pasted = e.target.value.trim()
            const ytRegex = /^https?:\/\/(www\.)?(music\.)?(youtube\.com|youtu\.be)\//
            if (pasted && ytRegex.test(pasted)) {
                onFetch(pasted)
            }
        }, 100)
    }

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <Input
                        value={url}
                        onChange={(e) => { setUrl(e.target.value); setErrorMsg('') }}
                        onPaste={handlePaste}
                        placeholder="Paste YouTube video or playlist link..."
                        style={{ fontSize: '1.05rem', paddingLeft: '48px' }}
                    />
                    <span
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-xl pointer-events-none"
                        style={{ opacity: 0.4 }}
                    >
                        🔗
                    </span>
                </div>
                <Button
                    variant="primary"
                    loading={isLoading}
                    onClick={handleSubmit}
                    className="sm:min-w-[150px]"
                >
                    {isLoading ? 'Fetching...' : 'Convert'}
                </Button>
            </div>

            {/* Helper text */}
            <p
                className="mt-2 text-xs text-center sm:text-left"
                style={{ color: 'var(--color-text-muted)' }}
            >
                Supports videos, playlists, and Shorts · Auto-detects format
            </p>

            {errorMsg && (
                <p className="mt-2 text-sm" style={{ color: 'var(--color-danger-dark)' }}>
                    {errorMsg}
                </p>
            )}
        </form>
    )
}
