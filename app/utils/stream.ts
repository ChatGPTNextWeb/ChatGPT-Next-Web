// using tauri register_uri_scheme_protocol, register `stream:` protocol
// see src-tauri/src/stream.rs, and src-tauri/src/main.rs
// 1. window.fetch(`stream://localhost/${fetchUrl}`), get request_id
// 2. listen event: `stream-response` multi times to get response headers and body

type ResponseEvent = {
  id: number;
  payload: {
    request_id: number;
    status?: number;
    error?: string;
    name?: string;
    value?: string;
    chunk?: number[];
  };
};

export function fetch(url: string, options?: RequestInit): Promise<any> {
  if (window.__TAURI__) {
    const tauriUri = window.__TAURI__.convertFileSrc(url, "stream");
    const { signal, ...rest } = options || {};
    return window
      .fetch(tauriUri, rest)
      .then((r) => r.text())
      .then((rid) => parseInt(rid))
      .then((request_id: number) => {
        // 1. using event to get status and statusText and headers, and resolve it
        let resolve: Function | undefined;
        let reject: Function | undefined;
        let status: number;
        let writable: WritableStream | undefined;
        let writer: WritableStreamDefaultWriter | undefined;
        const headers = new Headers();
        let unlisten: Function | undefined;

        if (signal) {
          signal.addEventListener("abort", () => {
            // Reject the promise with the abort reason.
            unlisten && unlisten();
            reject && reject(signal.reason);
          });
        }
        // @ts-ignore 2. listen response multi times, and write to Response.body
        window.__TAURI__.event
          .listen("stream-response", (e: ResponseEvent) => {
            const { id, payload } = e;
            const {
              request_id: rid,
              status: _status,
              name,
              value,
              error,
              chunk,
            } = payload;
            if (request_id != rid) {
              return;
            }
            /**
             * 1. get status code
             * 2. get headers
             * 3. start get body, then resolve response
             * 4. get body chunk
             */
            if (error) {
              unlisten && unlisten();
              return reject && reject(error);
            } else if (_status) {
              status = _status;
            } else if (name && value) {
              headers.append(name, value);
            } else if (chunk) {
              if (resolve) {
                const ts = new TransformStream();
                writable = ts.writable;
                writer = writable.getWriter();
                resolve(new Response(ts.readable, { status, headers }));
                resolve = undefined;
              }
              writer &&
                writer.ready.then(() => {
                  writer && writer.write(new Uint8Array(chunk));
                });
            } else if (_status === 0) {
              // end of body
              unlisten && unlisten();
              writer &&
                writer.ready.then(() => {
                  writer && writer.releaseLock();
                  writable && writable.close();
                });
            }
          })
          .then((u: Function) => (unlisten = u));
        return new Promise(
          (_resolve, _reject) => ([resolve, reject] = [_resolve, _reject]),
        );
      });
  }
  return window.fetch(url, options);
}
