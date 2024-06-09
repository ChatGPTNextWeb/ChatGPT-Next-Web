import { NextRequest } from "next/server";
import {
  RequestMessage,
  ServerConfig,
  getIP,
  getMessageTextContent,
} from "../../common";
import { ClaudeMapper } from "./config";

export const REQUEST_TIMEOUT_MS = 60000;
export const authHeaderName = "x-api-key";

export function trimEnd(s: string, end = " ") {
  if (end.length === 0) return s;

  while (s.endsWith(end)) {
    s = s.slice(0, -end.length);
  }

  return s;
}

export function bearer(value: string) {
  return `Bearer ${value.trim()}`;
}

export function prettyObject(msg: any) {
  const obj = msg;
  if (typeof msg !== "string") {
    msg = JSON.stringify(msg, null, "  ");
  }
  if (msg === "{}") {
    return obj.toString();
  }
  if (msg.startsWith("```json")) {
    return msg;
  }
  return ["```json", msg, "```"].join("\n");
}

export function getTimer() {
  const controller = new AbortController();

  // make a fetch request
  const requestTimeoutId = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  return {
    ...controller,
    clear: () => {
      clearTimeout(requestTimeoutId);
    },
  };
}

export function auth(req: NextRequest, serverConfig: ServerConfig) {
  const apiKey = req.headers.get(authHeaderName);

  console.log("[User IP] ", getIP(req));
  console.log("[Time] ", new Date().toLocaleString());

  if (serverConfig.hideUserApiKey && apiKey) {
    return {
      error: true,
      message: "you are not allowed to access with your own api key",
    };
  }

  if (apiKey) {
    console.log("[Auth] use user api key");
    return {
      error: false,
    };
  }

  // if user does not provide an api key, inject system api key
  const systemApiKey = serverConfig.anthropicApiKey;

  if (systemApiKey) {
    console.log("[Auth] use system api key");
    req.headers.set(authHeaderName, systemApiKey);
  } else {
    console.log("[Auth] admin did not provide an api key");
  }

  return {
    error: false,
  };
}

export function parseResp(res: any) {
  return {
    message: res?.content?.[0]?.text ?? "",
  };
}

export function formatMessage(
  messages: RequestMessage[],
  isVisionModel?: boolean,
) {
  return messages
    .flat()
    .filter((v) => {
      if (!v.content) return false;
      if (typeof v.content === "string" && !v.content.trim()) return false;
      return true;
    })
    .map((v) => {
      const { role, content } = v;
      const insideRole = ClaudeMapper[role] ?? "user";

      if (!isVisionModel || typeof content === "string") {
        return {
          role: insideRole,
          content: getMessageTextContent(v),
        };
      }
      return {
        role: insideRole,
        content: content
          .filter((v) => v.image_url || v.text)
          .map(({ type, text, image_url }) => {
            if (type === "text") {
              return {
                type,
                text: text!,
              };
            }
            const { url = "" } = image_url || {};
            const colonIndex = url.indexOf(":");
            const semicolonIndex = url.indexOf(";");
            const comma = url.indexOf(",");

            const mimeType = url.slice(colonIndex + 1, semicolonIndex);
            const encodeType = url.slice(semicolonIndex + 1, comma);
            const data = url.slice(comma + 1);

            return {
              type: "image" as const,
              source: {
                type: encodeType,
                media_type: mimeType,
                data,
              },
            };
          }),
      };
    });
}
