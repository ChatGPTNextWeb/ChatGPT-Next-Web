const CHATGPT_NEXT_WEB_CACHE = "chatgpt-next-web-cache";

self.addEventListener("activate", event => {
  console.log("ServiceWorker activated.");
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CHATGPT_NEXT_WEB_CACHE) {
            console.log(`Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("install", event => {
  const urlsToCache = ["/", "/styles/main.css", "/script/main.js"];
  console.log("ServiceWorker installing.");
  event.waitUntil(
    caches.open(CHATGPT_NEXT_WEB_CACHE).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchResponse => {
        return caches.open(CHATGPT_NEXT_WEB_CACHE).then(cache => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    })
  );
});
