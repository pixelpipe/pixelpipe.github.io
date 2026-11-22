/* Service worker for offline-capable PWA shell.
   Intentionally minimal: cache app shell and serve cache-first.
*/

// Service worker currently disabled by default in web/src/main.js.
// Keep this file around so it can be re-enabled later.

// Bump this whenever cached shell assets change.
const CACHE_NAME = 'cleverscore-lite-shell-v5'

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './src/main.js',
  './src/styles.css',
  './src/app.js',
  './src/i18n.js',
  './src/layout.js',
  './src/renderer.js',
  './src/matchState.js',
  './src/transport.js',
  './src/liveSocket.js',
  './src/canvasPreview.js',
  './src/previewHitTargets.js',
  './src/audio.js',
  './src/networkApi.js',
  './src/persistence.js',
  './src/eventLog.js',
  './src/fonts/index.js',
  './src/fonts/font5x7.js',
  './src/fonts/scoreDigits.js',
  './assets/icons/app-icon.svg',
  './assets/icons/app-icon-maskable.svg',
  './assets/icons/yellow.svg',
  './assets/icons/red.svg'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') {
    return
  }

  const url = new URL(request.url)

  // Only handle same-origin.
  if (url.origin !== self.location.origin) {
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached
      }
      return fetch(request).then((response) => {
        // Best-effort runtime caching for same-origin GETs.
        const copy = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {})
        return response
      })
    })
  )
})
