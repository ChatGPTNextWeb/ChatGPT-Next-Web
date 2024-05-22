import { NextRequest } from "next/server";
import { ServerConfig, getIP } from "../../common";
import md5 from "spark-md5";

export const ACCESS_CODE_PREFIX = "nk-";

export const REQUEST_TIMEOUT_MS = 60000;

export const authHeaderName = "Authorization";

export const makeBearer = (s: string) => `Bearer ${s.trim()}`;

export const validString = (x?: string): x is string =>
  Boolean(x && x.length > 0);

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

export function getHeaders(accessCode: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    [authHeaderName]: makeBearer(ACCESS_CODE_PREFIX + accessCode),
  };

  return headers;
}

export function parseResp(res: { choices: { message: { content: any } }[] }) {
  return {
    message: res.choices?.[0]?.message?.content ?? "",
  };
}

function parseApiKey(req: NextRequest) {
  const authToken = req.headers.get("Authorization") ?? "";

  return {
    accessCode:
      authToken.startsWith(ACCESS_CODE_PREFIX) &&
      authToken.slice(ACCESS_CODE_PREFIX.length),
  };
}

export function auth(req: NextRequest, serverConfig: ServerConfig) {
  // check if it is openai api key or user token
  const { accessCode } = parseApiKey(req);
  const { googleApiKey, apiKey, anthropicApiKey, azureApiKey, codes } =
    serverConfig;

  const hashedCode = md5.hash(accessCode || "").trim();

  console.log("[Auth] allowed hashed codes: ", [...codes]);
  console.log("[Auth] got access code:", accessCode);
  console.log("[Auth] hashed access code:", hashedCode);
  console.log("[User IP] ", getIP(req));
  console.log("[Time] ", new Date().toLocaleString());

  if (!codes.has(hashedCode)) {
    return {
      error: true,
      message: !accessCode ? "empty access code" : "wrong access code",
    };
  }

  const systemApiKey = googleApiKey || apiKey || anthropicApiKey || azureApiKey;

  if (systemApiKey) {
    console.log("[Auth] use system api key");

    return {
      error: false,
      accessCode,
      systemApiKey,
    };
  }

  console.log("[Auth] admin did not provide an api key");

  return {
    error: true,
    message: `Server internal error`,
  };
}
