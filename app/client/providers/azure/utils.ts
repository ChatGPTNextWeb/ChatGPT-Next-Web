import { NextRequest } from "next/server";
import { ServerConfig, getIP } from "../../common";

export const authHeaderName = "api-key";
export const REQUEST_TIMEOUT_MS = 60000;

export function getHeaders(azureApiKey?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (validString(azureApiKey)) {
    headers[authHeaderName] = makeBearer(azureApiKey);
  }

  return headers;
}

export function parseResp(res: any) {
  return {
    message: res.choices?.at(0)?.message?.content ?? "",
  };
}

export function makeAzurePath(path: string, apiVersion: string) {
  // should add api-key to query string
  path += `${path.includes("?") ? "&" : "?"}api-version=${apiVersion}`;

  return path;
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

export const makeBearer = (s: string) => `Bearer ${s.trim()}`;
export const validString = (x?: string): x is string =>
  Boolean(x && x.length > 0);

export function parseApiKey(bearToken: string) {
  const token = bearToken.trim().replaceAll("Bearer ", "").trim();

  return {
    apiKey: token,
  };
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
  const authToken = req.headers.get(authHeaderName) ?? "";

  const { hideUserApiKey, apiKey: systemApiKey } = serverConfig;

  const { apiKey } = parseApiKey(authToken);

  console.log("[User IP] ", getIP(req));
  console.log("[Time] ", new Date().toLocaleString());

  if (hideUserApiKey && apiKey) {
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

  if (systemApiKey) {
    console.log("[Auth] use system api key");
    req.headers.set("Authorization", `Bearer ${systemApiKey}`);
  } else {
    console.log("[Auth] admin did not provide an api key");
  }

  return {
    error: false,
  };
}
