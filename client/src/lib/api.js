const API_BASE = '/api'

/**
 * Generic fetch wrapper
 */
async function request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`
    const config = {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    }

    const res = await fetch(url, config)
    const data = await res.json()

    if (!res.ok || !data.success) {
        throw new Error(data.error || `Request failed: ${res.status}`)
    }

    return data.data
}

/**
 * Fetch info for a YouTube URL (auto-detects video vs playlist)
 */
export async function fetchPlaylist(url) {
    return request('/playlist', {
        method: 'POST',
        body: JSON.stringify({ url }),
    })
}

/**
 * Get available formats for a video
 */
export async function fetchFormats(videoId) {
    return request(`/formats/${videoId}`)
}

/**
 * Start a download job
 */
export async function startDownload({ videos, format, quality, playlistTitle }) {
    return request('/download/start', {
        method: 'POST',
        body: JSON.stringify({ videos, format, quality, playlistTitle }),
    })
}

/**
 * Get job status
 */
export async function getJobStatus(jobId) {
    return request(`/download/${jobId}`)
}

/**
 * Get list of completed files for a job
 */
export async function fetchFiles(jobId) {
    return request(`/download/${jobId}/files`)
}
/**
 * Cancel a download job
 */
export async function cancelJob(jobId) {
    return request(`/download/${jobId}/cancel`, { method: 'POST' })
}

/**
 * Retry failed downloads in a job
 */
export async function retryFailed(jobId) {
    return request(`/download/${jobId}/retry`, { method: 'POST' })
}

/**
 * Subscribe to SSE progress for a download job
 */
export function subscribeToProgress(jobId, onMessage, onDone) {
    const url = `${API_BASE}/download/${jobId}/events`
    const eventSource = new EventSource(url)

    eventSource.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data)
            onMessage(data)
        } catch (e) {
            console.error('SSE parse error:', e)
        }
    }

    eventSource.addEventListener('done', () => {
        eventSource.close()
        if (onDone) onDone()
    })

    eventSource.onerror = () => {
        // EventSource auto-reconnects
    }

    return () => eventSource.close()
}
