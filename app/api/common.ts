import { NextRequest } from "next/server";

const OPENAI_URL = "api.openai.com";
const DEFAULT_PROTOCOL = "https";
const PROTOCOL = process.env.PROTOCOL ?? DEFAULT_PROTOCOL;
const BASE_URL = process.env.BASE_URL ?? OPENAI_URL;
const STANDALONE = Boolean(process.env.STANDALONE);

let fetch: FetchLike = globalThis.fetch;

export async function requestOpenai(req: NextRequest) {
  const apiKey = req.headers.get("token");
  const openaiPath = req.headers.get("path");

  console.log("[Proxy] ", openaiPath);

  return fetch(`${PROTOCOL}://${BASE_URL}/${openaiPath}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    method: req.method,
    body: req.body,
  });
}

export type FetchLike = (
  url: string | Request,
  init?: RequestInit,
) => Promise<Response>;

if (STANDALONE) {
  const proxy =
    process.env.HTTPS_PROXY ||
    process.env.https_proxy ||
    process.env.ALL_PROXY ||
    process.env.all_proxy;
  if (proxy) {
    console.log(`[HTTP Proxy] ${new URL(proxy).hostname}`);
  }

  fetch = createFetchWithProxyByNextUndici({ proxy, fetch });
}

export function createFetchWithProxyByNextUndici({
  proxy,
  fetch,
}: {
  proxy?: string;
  fetch?: FetchLike;
} = {}): FetchLike {
  if (!proxy) {
    return fetch || globalThis.fetch;
  }
  let agent: any;
  return async (...args) => {
    const init = (args[1] ||= {});
    if (init.body instanceof ReadableStream) {
      // https://github.com/nodejs/node/issues/46221
      (init as any).duplex ||= "half";
    }
    if (!agent) {
      let ProxyAgent;
      if ("ProxyAgent" in globalThis) {
        ProxyAgent = (globalThis as any).ProxyAgent;
        fetch ||= globalThis.fetch;
      } else {
        // @ts-ignore
        const undici = await import("next/dist/compiled/undici");
        ProxyAgent = undici.ProxyAgent;
        fetch ||= undici.fetch;
      }
      agent = new ProxyAgent(proxy);
      // https://github.com/nodejs/node/issues/43187#issuecomment-1134634174
      (global as any)[Symbol.for("undici.globalDispatcher.1")] = agent;
    }
    return fetch!(...args);
  };
}

// @ts-ignore
declare module "next/dist/compiled/undici" {
  const fetch: FetchLike;
  const ProxyAgent: any;
  export { fetch, ProxyAgent };
}
