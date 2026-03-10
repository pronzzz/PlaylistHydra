const CACHE_NAME = 'hydra-v2'
const STATIC_ASSETS = [
    '/',
    '/manifest.json',
]

// Install — cache shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(STATIC_ASSETS))
            .catch((err) => console.warn('SW install cache error:', err))
    )
    self.skipWaiting()
})

// Activate — clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((names) => {
            return Promise.all(
                names
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            )
        })
    )
    self.clients.claim()
})

// Fetch — network first, fallback to cache
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url)

    // Skip API calls, SSE streams, and non-GET requests
    if (url.pathname.startsWith('/api/') || event.request.method !== 'GET') {
        return
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response.ok && response.type === 'basic') {
                    const clone = response.clone()
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clone)
                    })
                }
                return response
            })
            .catch(() => {
                return caches.match(event.request)
                    .then((cached) => cached || caches.match('/'))
            })
    )
})
