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

type StreamResponse = {
  request_id: number;
  status: number;
  status_text: string;
  headers: Record<string, string>;
};

export function fetch(url: string, options?: RequestInit): Promise<any> {
  if (window.__TAURI__) {
    const {
      signal,
      method = "GET",
      headers: _headers = {},
      body = [],
    } = options || {};
    let unlisten: Function | undefined;
    let request_id = 0;
    const ts = new TransformStream();
    const writer = ts.writable.getWriter();

    const close = () => {
      unlisten && unlisten();
      writer.ready.then(() => {
        try {
          writer.releaseLock();
          ts.writable.close();
        } catch (e) {
          console.error(e);
        }
      });
    };

    if (signal) {
      signal.addEventListener("abort", () => close());
    }
    // @ts-ignore 2. listen response multi times, and write to Response.body
    window.__TAURI__.event
      .listen("stream-response", (e: ResponseEvent) => {
        const { request_id: rid, chunk, status } = e?.payload || {};
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

    const headers = {
      Accept: "*",
      Connection: "close",
      Origin: "http://localhost:3000",
      Referer: "http://localhost:3000/",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "cross-site",
      "User-Agent": navigator.userAgent,
    };
    for (const item of new Headers(_headers || {})) {
      headers[item[0]] = item[1];
    }
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
      .then((res: StreamResponse) => {
        request_id = res.request_id;
        const { status, status_text: statusText, headers } = res;
        return new Response(ts.readable, { status, statusText, headers });
      })
      .catch((e) => {
        console.error("stream error", e);
        throw e;
      });
  }
  return window.fetch(url, options);
}
