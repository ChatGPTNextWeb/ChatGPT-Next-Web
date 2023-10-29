import { ApiPath } from "../constant";
import { getApiPath } from "./path";

export function corsFetch(
  url: string,
  options: RequestInit & {
    proxyUrl?: string;
  },
) {
  if (!url.startsWith("http")) {
    throw Error("[CORS Fetch] url must starts with http/https");
  }

  let proxyUrl = options.proxyUrl ?? getApiPath(ApiPath.Cors);
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
