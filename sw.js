const CACHE_NAME = 'workout-plan-v4';
const STATIC_ASSETS = [
  '/workout-plan/index.html',
  '/workout-plan/manifest.json',
  '/workout-plan/icons/icon-192x192.png',
  '/workout-plan/icons/icon-512x512.png',
  '/workout-plan/icons/apple-touch-icon.png',
  'https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        STATIC_ASSETS.map(url => cache.add(url).catch(e => console.warn('Failed to cache:', url)))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (
    url.hostname.includes('fonts.g') ||
    url.pathname.startsWith('/workout-plan/icons/') ||
    url.pathname === '/workout-plan/index.html' ||
    url.pathname === '/workout-plan/manifest.json'
  ) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        }).catch(() => caches.match('/workout-plan/index.html'));
      })
    );
    return;
  }
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
