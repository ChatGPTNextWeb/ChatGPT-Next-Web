if ('serviceWorker' in navigator) {
  window.addEventListener('DOMContentLoaded', () => {
    navigator.serviceWorker.register('/serviceWorker.js').then((registration) => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      const sw = registration.installing || registration.waiting;
      if (sw) {
        sw.onstatechange = function () {
          if (sw.state === 'installed') {
            // SW installed.  Reload for SW intercept serving SW-enabled page.
            console.log('ServiceWorker installed reload page');
            window.location.reload();
          }
        };
      }
      registration.update().then((res) => {
        console.log('ServiceWorker registration update: ', res);
      });
      window._SW_ENABLED = true;
    }, (err) => {
      console.error('ServiceWorker registration failed: ', err);
    });
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('ServiceWorker controllerchange ');
      window.location.reload(true);
    });
  });
}
