import { getClientConfig } from "@/app/config/client";

if (!(window.fetch as any).__hijacked__) {
  let _fetch = window.fetch;

  function fetch(...args: Parameters<typeof _fetch>) {
    const { isApp } = getClientConfig() || {};

    let fetch: typeof _fetch = _fetch;

    if (isApp) {
      try {
        fetch = window.__TAURI__!.http.fetch;
      } catch (e) {
        fetch = _fetch;
      }
    }

    return fetch(...args);
  }

  fetch.__hijacked__ = true;

  window.fetch = fetch;
}
