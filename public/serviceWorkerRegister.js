if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/serviceWorker.js')
      .then((registration) => console.log('ServiceWorker registration successful with scope: ', registration.scope))
      .catch((err) => console.error('ServiceWorker registration failed: ', err));
  });
}
