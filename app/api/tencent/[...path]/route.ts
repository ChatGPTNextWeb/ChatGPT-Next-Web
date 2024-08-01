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
import CryptoJS from "crypto-js";
import mapKeys from "lodash-es/mapKeys";
import mapValues from "lodash-es/mapValues";
import isArray from "lodash-es/isArray";
import isObject from "lodash-es/isObject";

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

export const runtime = "edge";
export const preferredRegion = [
  "arn1",
  "bom1",
  "cdg1",
  "cle1",
  "cpt1",
  "dub1",
  "fra1",
  "gru1",
  "hnd1",
  "iad1",
  "icn1",
  "kix1",
  "lhr1",
  "pdx1",
  "sfo1",
  "sin1",
  "syd1",
];

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

  let body = null;
  if (req.body) {
    const bodyText = await req.text();
    console.log(
      "Dogtiti ~ request ~ capitalizeKeys(JSON.parse(bodyText):",
      capitalizeKeys(JSON.parse(bodyText)),
    );
    body = JSON.stringify(capitalizeKeys(JSON.parse(bodyText)));
  }

  const fetchOptions: RequestInit = {
    headers: {
      ...getHeader(body),
    },
    method: req.method,
    body: '{"Model":"hunyuan-pro","Messages":[{"Role":"user","Content":"你好"}]}', // FIXME
    redirect: "manual",
    // @ts-ignore
    duplex: "half",
    signal: controller.signal,
  };

  // #1815 try to refuse some request to some models
  if (serverConfig.customModels && req.body) {
    try {
      const clonedBody = await req.text();
      fetchOptions.body = clonedBody;

      const jsonBody = JSON.parse(clonedBody) as { model?: string };

      // not undefined and is false
      if (
        isModelAvailableInServer(
          serverConfig.customModels,
          jsonBody?.model as string,
          ServiceProvider.Tencent as string,
        )
      ) {
        return NextResponse.json(
          {
            error: true,
            message: `you are not allowed to use ${jsonBody?.model} model`,
          },
          {
            status: 403,
          },
        );
      }
    } catch (e) {
      console.error(`[Tencent] filter`, e);
    }
  }
  console.log("[Tencent request]", fetchOptions.headers, req.method);
  try {
    const res = await fetch(fetchUrl, fetchOptions);

    console.log("[Tencent response]", res.status, "   ", res.headers, res.url);
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

function capitalizeKeys(obj: any): any {
  if (isArray(obj)) {
    return obj.map(capitalizeKeys);
  } else if (isObject(obj)) {
    return mapValues(
      mapKeys(
        obj,
        (value: any, key: string) => key.charAt(0).toUpperCase() + key.slice(1),
      ),
      capitalizeKeys,
    );
  } else {
    return obj;
  }
}

// 使用 SHA-256 和 secret 进行 HMAC 加密
function sha256(message: any, secret = "", encoding = "hex") {
  const hmac = CryptoJS.HmacSHA256(message, secret);
  if (encoding === "hex") {
    return hmac.toString(CryptoJS.enc.Hex);
  } else if (encoding === "base64") {
    return hmac.toString(CryptoJS.enc.Base64);
  } else {
    return hmac.toString();
  }
}

// 使用 SHA-256 进行哈希
function getHash(message: any, encoding = "hex") {
  const hash = CryptoJS.SHA256(message);
  if (encoding === "hex") {
    return hash.toString(CryptoJS.enc.Hex);
  } else if (encoding === "base64") {
    return hash.toString(CryptoJS.enc.Base64);
  } else {
    return hash.toString();
  }
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
  const canonicalUri = "/";
  const canonicalQueryString = "";
  const canonicalHeaders =
    "content-type:application/json; charset=utf-8\n" +
    "host:" +
    endpoint +
    "\n" +
    "x-tc-action:" +
    action.toLowerCase() +
    "\n";
  const signedHeaders = "content-type;host;x-tc-action";

  const canonicalRequest =
    httpRequestMethod +
    "\n" +
    canonicalUri +
    "\n" +
    canonicalQueryString +
    "\n" +
    canonicalHeaders +
    "\n" +
    signedHeaders +
    "\n" +
    hashedRequestPayload;

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
    "Content-Type": "application/json; charset=utf-8",
    Host: endpoint,
    "X-TC-Action": action,
    "X-TC-Timestamp": timestamp.toString(),
    "X-TC-Version": version,
    "X-TC-Region": region,
  };
}
