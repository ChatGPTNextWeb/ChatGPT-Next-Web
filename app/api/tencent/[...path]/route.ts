"use server";
import { getServerSideConfig } from "@/app/config/server";
import {
  TENCENT_BASE_URL,
  ApiPath,
  ModelProvider,
  ServiceProvider,
  Tencent,
} from "@/app/constant";
import { prettyObject } from "@/app/utils/format";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth";
import { isModelAvailableInServer } from "@/app/utils/model";
import * as crypto from "node:crypto";

const serverConfig = getServerSideConfig();

async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  console.log("[Tencent Route] params ", params);

  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }

  const authResult = auth(req, ModelProvider.Hunyuan);
  if (authResult.error) {
    return NextResponse.json(authResult, {
      status: 401,
    });
  }

  try {
    const response = await request(req);
    return response;
  } catch (e) {
    console.error("[Tencent] ", e);
    return NextResponse.json(prettyObject(e));
  }
}

export const GET = handle;
export const POST = handle;

async function request(req: NextRequest) {
  const controller = new AbortController();

  // tencent just use base url or just remove the path
  let path = `${req.nextUrl.pathname}`.replaceAll(
    ApiPath.Tencent + "/" + Tencent.ChatPath,
    "",
  );

  let baseUrl = serverConfig.tencentUrl || TENCENT_BASE_URL;

  if (!baseUrl.startsWith("http")) {
    baseUrl = `https://${baseUrl}`;
  }

  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
  }

  console.log("[Proxy] ", path);
  console.log("[Base Url]", baseUrl);

  const timeoutId = setTimeout(
    () => {
      controller.abort();
    },
    10 * 60 * 1000,
  );

  const fetchUrl = `${baseUrl}${path}`;

  const body = await req.text();
  const fetchOptions: RequestInit = {
    headers: {
      ...getHeader(body),
    },
    method: req.method,
    body,
    redirect: "manual",
    // @ts-ignore
    duplex: "half",
    signal: controller.signal,
  };

  try {
    const res = await fetch(fetchUrl, fetchOptions);

    // to prevent browser prompt for credentials
    const newHeaders = new Headers(res.headers);
    newHeaders.delete("www-authenticate");
    // to disable nginx buffering
    newHeaders.set("X-Accel-Buffering", "no");

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: newHeaders,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

// 使用 SHA-256 和 secret 进行 HMAC 加密
function sha256(message: any, secret = "", encoding?: string) {
  return crypto.createHmac("sha256", secret).update(message).digest(encoding);
}

// 使用 SHA-256 进行哈希
function getHash(message: any, encoding = "hex") {
  return crypto.createHash("sha256").update(message).digest(encoding);
}

function getDate(timestamp: number) {
  const date = new Date(timestamp * 1000);
  const year = date.getUTCFullYear();
  const month = ("0" + (date.getUTCMonth() + 1)).slice(-2);
  const day = ("0" + date.getUTCDate()).slice(-2);
  return `${year}-${month}-${day}`;
}

function getHeader(payload: any) {
  // https://cloud.tencent.com/document/api/1729/105701
  // 密钥参数
  const SECRET_ID = serverConfig.tencentSecretId;
  const SECRET_KEY = serverConfig.tencentSecretKey;

  const endpoint = "hunyuan.tencentcloudapi.com";
  const service = "hunyuan";
  const region = ""; // optional
  const action = "ChatCompletions";
  const version = "2023-09-01";
  const timestamp = Math.floor(Date.now() / 1000);
  //时间处理, 获取世界时间日期
  const date = getDate(timestamp);

  // ************* 步骤 1：拼接规范请求串 *************

  const hashedRequestPayload = getHash(payload);
  const httpRequestMethod = "POST";
  const contentType = "application/json";
  const canonicalUri = "/";
  const canonicalQueryString = "";
  const canonicalHeaders =
    `content-type:${contentType}\n` +
    "host:" +
    endpoint +
    "\n" +
    "x-tc-action:" +
    action.toLowerCase() +
    "\n";
  const signedHeaders = "content-type;host;x-tc-action";

  const canonicalRequest = [
    httpRequestMethod,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    hashedRequestPayload,
  ].join("\n");

  // ************* 步骤 2：拼接待签名字符串 *************
  const algorithm = "TC3-HMAC-SHA256";
  const hashedCanonicalRequest = getHash(canonicalRequest);
  const credentialScope = date + "/" + service + "/" + "tc3_request";
  const stringToSign =
    algorithm +
    "\n" +
    timestamp +
    "\n" +
    credentialScope +
    "\n" +
    hashedCanonicalRequest;

  // ************* 步骤 3：计算签名 *************
  const kDate = sha256(date, "TC3" + SECRET_KEY);
  const kService = sha256(service, kDate);
  const kSigning = sha256("tc3_request", kService);
  const signature = sha256(stringToSign, kSigning, "hex");

  // ************* 步骤 4：拼接 Authorization *************
  const authorization =
    algorithm +
    " " +
    "Credential=" +
    SECRET_ID +
    "/" +
    credentialScope +
    ", " +
    "SignedHeaders=" +
    signedHeaders +
    ", " +
    "Signature=" +
    signature;

  return {
    Authorization: authorization,
    "Content-Type": contentType,
    Host: endpoint,
    "X-TC-Action": action,
    "X-TC-Timestamp": timestamp.toString(),
    "X-TC-Version": version,
    "X-TC-Region": region,
  };
}
