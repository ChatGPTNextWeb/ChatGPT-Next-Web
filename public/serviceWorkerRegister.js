const BASE_PATH='/ChatGPT-Next-Web';
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register(`.${BASE_PATH}/serviceWorker.js`).then(function (registration) {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function (err) {
      console.error('ServiceWorker registration failed: ', err);
    });
  });
}