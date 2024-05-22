import { NextRequest } from "next/server";
import { ServerConfig, getIP } from "../../common";

export const urlParamApikeyName = "key";

export const REQUEST_TIMEOUT_MS = 60000;

export const makeBearer = (s: string) => `Bearer ${s.trim()}`;
export const validString = (x?: string): x is string =>
  Boolean(x && x.length > 0);

export function ensureProperEnding(str: string) {
  if (str.startsWith("[") && !str.endsWith("]")) {
    return str + "]";
  }
  return str;
}

export function auth(req: NextRequest, serverConfig: ServerConfig) {
  let apiKey = req.nextUrl.searchParams.get(urlParamApikeyName);

  const { hideUserApiKey, googleApiKey } = serverConfig;

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
      apiKey,
    };
  }

  if (googleApiKey) {
    console.log("[Auth] use system api key");
    return {
      error: false,
      apiKey: googleApiKey,
    };
  }

  console.log("[Auth] admin did not provide an api key");
  return {
    error: true,
    message: `missing api key`,
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

export function parseResp(res: any) {
  if (res?.promptFeedback?.blockReason) {
    // being blocked
    throw new Error(
      "Message is being blocked for reason: " + res.promptFeedback.blockReason,
    );
  }
  return {
    message:
      res.candidates?.at(0)?.content?.parts?.at(0)?.text ||
      res.error?.message ||
      "",
  };
}
