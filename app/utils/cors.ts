import { getClientConfig } from "../config/client";
import { ApiPath, DEFAULT_CORS_HOST } from "../constant";

export function corsPath(path: string) {
  const baseUrl = getClientConfig()?.isApp ? `${DEFAULT_CORS_HOST}` : "";

  if (!path.startsWith("/")) {
    path = "/" + path;
  }

  if (!path.endsWith("/")) {
    path += "/";
  }

  return `${baseUrl}${path}`;
}

export function corsFetch(
  url: string,
  options: RequestInit & {
    proxyUrl?: string;
  },
) {
  if (!url.startsWith("http")) {
    throw Error("[CORS Fetch] url must starts with http/https");
  }

  let corsUrl = url;
  if (options.proxyUrl) {
    let proxyUrl = options.proxyUrl;
    if (!proxyUrl.endsWith("/")) {
      proxyUrl += "/";
    }

    url = url.replace("://", "/");
    corsUrl = proxyUrl + url;
  }

  const corsOptions = {
    ...options,
    method: "POST",
    headers: options.method
      ? {
          ...options.headers,
          method: options.method,
        }
      : options.headers,
  };

  console.info("[CORS] target = ", corsUrl);
  return fetch(corsUrl, corsOptions);
}
