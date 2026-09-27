const CACHE_NAME = 'nurapp-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return fetch('/asset-manifest.json')
        .then((res) => res.json())
        .then((manifest) => {
          const urls = ['/', '/index.html'];
          if (manifest && manifest.files) {
            Object.values(manifest.files).forEach((url) => urls.push(url));
          }
          return cache.addAll(urls);
        })
        .catch(() => cache.addAll(['/', '/index.html']));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
    })
  );
});
