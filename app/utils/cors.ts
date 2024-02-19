import { getClientConfig } from "../config/client";
import { ApiPath, DEFAULT_API_HOST } from "../constant";

export function corsPath(path: string) {
  const baseUrl = getClientConfig()?.isApp ? `${DEFAULT_API_HOST}` : "";

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

  let proxyUrl = options.proxyUrl ?? corsPath(ApiPath.Cors);
  if (!proxyUrl.endsWith("/")) {
    proxyUrl += "/";
  }

  url = url.replace("://", "/");

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

  const corsUrl = proxyUrl + url;
  console.info("[CORS] target = ", corsUrl);

  return fetch(corsUrl, corsOptions);
}
