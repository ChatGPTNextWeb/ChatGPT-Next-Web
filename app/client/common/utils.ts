import { NextRequest } from "next/server";
import { RequestMessage, ServerConfig } from "./types";
import { cloneDeep } from "lodash-es";

export function getMessageTextContent(message: RequestMessage) {
  if (typeof message.content === "string") {
    return message.content;
  }
  for (const c of message.content) {
    if (c.type === "text") {
      return c.text ?? "";
    }
  }
  return "";
}

export function getMessageImages(message: RequestMessage): string[] {
  if (typeof message.content === "string") {
    return [];
  }
  const urls: string[] = [];
  for (const c of message.content) {
    if (c.type === "image_url") {
      urls.push(c.image_url?.url ?? "");
    }
  }
  return urls;
}

export function getIP(req: NextRequest) {
  let ip = req.ip ?? req.headers.get("x-real-ip");
  const forwardedFor = req.headers.get("x-forwarded-for");

  if (!ip && forwardedFor) {
    ip = forwardedFor.split(",").at(0) ?? "";
  }

  return ip;
}

export function formatUrl(baseUrl?: string) {
  if (baseUrl && !baseUrl.startsWith("http")) {
    baseUrl = `https://${baseUrl}`;
  }
  if (baseUrl?.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
  }

  return baseUrl;
}

function travel(
  config: ServerConfig,
  keys: Array<keyof ServerConfig>,
  handle: (prop: any) => any,
): ServerConfig {
  const copiedConfig = cloneDeep(config);
  keys.forEach((k) => {
    copiedConfig[k] = handle(copiedConfig[k] as string) as never;
  });
  return copiedConfig;
}

export const makeUrlsUsable = (
  config: ServerConfig,
  keys: Array<keyof ServerConfig>,
) => travel(config, keys, formatUrl);

export const disableSystemApiKey = (
  config: ServerConfig,
  keys: Array<keyof ServerConfig>,
  forbidden: boolean,
) =>
  travel(config, keys, (p) => {
    return forbidden ? undefined : p;
  });

export function isSameOrigin(requestUrl: string) {
  var a = document.createElement("a");
  a.href = requestUrl;

  // 检查协议、主机名和端口号是否与当前页面相同
  return (
    a.protocol === window.location.protocol &&
    a.hostname === window.location.hostname &&
    a.port === window.location.port
  );
}
