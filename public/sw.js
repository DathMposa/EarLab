const CACHE_NAME = 'earlab-v6';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.webmanifest',
  '/audio/studio-grand/manifest.json',
  '/audio/packs.json',
  '/soundtouch-processor.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable.png',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Application HTML, JavaScript and CSS must always be a matching current
  // build. Serving a cached Next bundle alongside fresh HTML causes the app to
  // render without its stylesheet after a deployment or local refresh.
  if (url.pathname.startsWith('/_next/') || event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request));
    return;
  }

  // Keep only explicitly offline-safe product assets in Cache Storage. This
  // preserves downloaded audio packs without treating all runtime assets as
  // app-shell cache entries.
  const isOfflineAsset = url.pathname.startsWith('/audio/')
    || url.pathname.startsWith('/icons/')
    || url.pathname === '/soundtouch-processor.js'
    || url.pathname === '/manifest.webmanifest';
  if (!isOfflineAsset) return;

  // Offline-safe assets are cache-first and refresh in the background.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
