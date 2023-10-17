const CHATGPT_NEXT_WEB_CACHE = "chatgpt-next-web-cache";

importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

self.addEventListener("activate", function (event) {
  console.log("ServiceWorker activated.");
});

workbox.core.clientsClaim();
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

workbox.routing.registerRoute(
  new RegExp('/*'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CHATGPT_NEXT_WEB_CACHE
  })
);
