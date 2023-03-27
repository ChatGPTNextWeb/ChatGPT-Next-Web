const CHATGPT_NEXT_WEB_CACHE = "chatgpt-next-web-cache";

self.addEventListener('activate', function (event) {
  console.log('ServiceWorker activated.');
});

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CHATGPT_NEXT_WEB_CACHE)
      .then(function (cache) {
        return cache.addAll([
        ]);
      })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        return response || fetch(event.request);
      })
  );
});