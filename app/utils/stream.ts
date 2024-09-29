// using tauri command to send request
// see src-tauri/src/stream.rs, and src-tauri/src/main.rs
// 1. invoke('stream_fetch', {url, method, headers, body}), get response with headers.
// 2. listen event: `stream-response` multi times to get body

type ResponseEvent = {
  id: number;
  payload: {
    request_id: number;
    status?: number;
    chunk?: number[];
  };
};

export function fetch(url: string, options?: RequestInit): Promise<any> {
  if (window.__TAURI__) {
    const { signal, method = "GET", headers = {}, body = [] } = options || {};
    return window.__TAURI__
      .invoke("stream_fetch", {
        method,
        url,
        headers,
        // TODO FormData
        body:
          typeof body === "string"
            ? Array.from(new TextEncoder().encode(body))
            : [],
      })
      .then(
        (res: {
          request_id: number;
          status: number;
          status_text: string;
          headers: Record<string, string>;
        }) => {
          const { request_id, status, status_text: statusText, headers } = res;
          console.log("send request_id", request_id, status, statusText);
          let unlisten: Function | undefined;
          const ts = new TransformStream();
          const writer = ts.writable.getWriter();

          const close = () => {
            unlisten && unlisten();
            writer.ready.then(() => {
              try {
                writer.releaseLock();
              } catch (e) {
                console.error(e);
              }
              ts.writable.close();
            });
          };

          const response = new Response(ts.readable, {
            status,
            statusText,
            headers,
          });
          if (signal) {
            signal.addEventListener("abort", () => close());
          }
          // @ts-ignore 2. listen response multi times, and write to Response.body
          window.__TAURI__.event
            .listen("stream-response", (e: ResponseEvent) => {
              const { id, payload } = e;
              const { request_id: rid, chunk, status } = payload;
              if (request_id != rid) {
                return;
              }
              if (chunk) {
                writer &&
                  writer.ready.then(() => {
                    writer && writer.write(new Uint8Array(chunk));
                  });
              } else if (status === 0) {
                // end of body
                close();
              }
            })
            .then((u: Function) => (unlisten = u));
          return response;
        },
      )
      .catch((e) => {
        console.error("stream error", e);
        throw e;
      });
  }
  return window.fetch(url, options);
}

if (undefined !== window) {
  window.tauriFetch = fetch;
}
