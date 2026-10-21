const CACHE_NAME = 'mh-pt-cache-v3';
const OFFLINE_ASSETS = [
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-192-maskable.png',
  '/icon-512-maskable.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (
        key.startsWith('mh-pt-cache-') && key !== CACHE_NAME ? caches.delete(key) : null
      )))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (!OFFLINE_ASSETS.includes(url.pathname)) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          event.waitUntil(
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(request, response.clone()))
              .catch(() => {})
          );
        }
        return response;
      })
      .catch(async () => (await caches.match(request)) || Response.error())
  );
});
