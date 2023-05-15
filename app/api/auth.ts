import { NextRequest } from "next/server";
import { getServerSideConfig } from "../config/server";
import md5 from "spark-md5";
import { ACCESS_CODE_PREFIX } from "../constant";
import { getTokenInfo } from "./lib/redis";

const serverConfig = getServerSideConfig();

function getIP(req: NextRequest) {
  let ip = req.ip ?? req.headers.get("x-real-ip");
  const forwardedFor = req.headers.get("x-forwarded-for");

  if (!ip && forwardedFor) {
    ip = forwardedFor.split(",").at(0) ?? "";
  }

  return ip;
}

function parseAccessCode(bearToken: string) {
  const token = bearToken.trim().replaceAll("Bearer ", "").trim();
  if (token.startsWith(ACCESS_CODE_PREFIX)) {
    return token.slice(ACCESS_CODE_PREFIX.length);
  }
}

type AuthRes =
  | { error: true; needAccessCode?: boolean; msg: string }
  | { error: false; accessCode: string };
export async function auth(req: NextRequest): Promise<AuthRes> {
  const authToken = req.headers.get("Authorization") ?? "";

  const accessCode = parseAccessCode(authToken);
  if (!accessCode) {
    return {
      error: true,
      needAccessCode: true,
      msg: "Please go settings page and fill your access code.",
    };
  }

  console.log("[Auth] got access code:", accessCode);
  console.log("[User IP] ", getIP(req));
  console.log("[Time] ", new Date().toLocaleString());

  const tokenInfo = await getTokenInfo(accessCode);
  const invalidMsg =
    !tokenInfo || !(tokenInfo.total || tokenInfo.expire)
      ? "invalid token"
      : tokenInfo.total &&
        tokenInfo.total <= tokenInfo.usage.completion + tokenInfo.usage.prompt
      ? "token is not enough"
      : tokenInfo.expire && tokenInfo.expire <= new Date().getMilliseconds()
      ? "token is expire"
      : null;

  if (invalidMsg) {
    return {
      error: true,
      msg: invalidMsg,
    };
  }

  const apiKey = serverConfig.apiKey;
  if (apiKey) {
    console.log("[Auth] use system api key");
    req.headers.set("Authorization", `Bearer ${apiKey}`);
  } else {
    console.log("[Auth] admin did not provide an api key");
    return {
      error: true,
      msg: "Empty Api Key",
    };
  }

  return {
    error: false,
    accessCode,
  };
}
