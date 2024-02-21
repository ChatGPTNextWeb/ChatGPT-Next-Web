import { NextRequest, NextResponse } from "next/server";
import { getServerSideConfig } from "../config/server";
import { DEFAULT_MODELS, OPENAI_BASE_URL, GEMINI_BASE_URL } from "../constant";
import { collectModelTable } from "../utils/model";
import { makeAzurePath } from "../azure";
import { getIP } from "@/app/api/auth";

const serverConfig = getServerSideConfig();

export async function requestOpenai(
  req: NextRequest,
  cloneBody: any,
  isAzure: boolean,
  current_model: string,
) {
  const controller = new AbortController();

  var authValue,
    authHeaderName = "";
  if (isAzure) {
    authValue =
      req.headers
        .get("Authorization")
        ?.trim()
        .replaceAll("Bearer ", "")
        .trim() ?? "";

    authHeaderName = "api-key";
  } else {
    authValue = req.headers.get("Authorization") ?? "";
    authHeaderName = "Authorization";
  }
  // const authValue = req.headers.get("Authorization") ?? "";
  // const authHeaderName = isAzure ? "api-key" : "Authorization";

  let path = `${req.nextUrl.pathname}${req.nextUrl.search}`.replaceAll(
    "/api/openai/",
    "",
  );
  let baseUrl = isAzure
    ? serverConfig.azureUrl
    : serverConfig.baseUrl || OPENAI_BASE_URL;

  if (!baseUrl.startsWith("http")) {
    baseUrl = `https://${baseUrl}`;
  }

  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
  }

  // console.log("[Proxy] ", path);
  // console.log("[Base Url]", baseUrl);
  // // this fix [Org ID] undefined in server side if not using custom point
  // if (serverConfig.openaiOrgId !== undefined) {
  //   console.log("[Org ID]", serverConfig.openaiOrgId);
  // }

  const timeoutId = setTimeout(
    () => {
      controller.abort();
    },
    10 * 60 * 1000,
  );

  const fetchUrl = `${baseUrl}/${path}`;
  const fetchOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      [authHeaderName]: authValue,
      ...(serverConfig.openaiOrgId && {
        "OpenAI-Organization": serverConfig.openaiOrgId,
      }),
    },
    method: req.method,
    body: cloneBody,
    // to fix #2485: https://stackoverflow.com/questions/55920957/cloudflare-worker-typeerror-one-time-use-body
    redirect: "manual",
    // @ts-ignore
    duplex: "half",
    signal: controller.signal,
  };

  // #1815 try to refuse some model request
  if (current_model) {
    try {
      const modelTable = collectModelTable(
        DEFAULT_MODELS,
        serverConfig.customModels,
      );

      // not undefined and is false
      if (!modelTable[current_model ?? ""].available) {
        return NextResponse.json(
          {
            error: true,
            message: `you are not allowed to use ${current_model} model`,
          },
          {
            status: 403,
          },
        );
      }
    } catch (e) {
      console.error("[OpenAI] gpt model filter", e);
    }
  }

  try {
    const res = await fetch(fetchUrl, fetchOptions);

    // to prevent browser prompt for credentials
    const newHeaders = new Headers(res.headers);
    newHeaders.delete("www-authenticate");
    // to disable nginx buffering
    newHeaders.set("X-Accel-Buffering", "no");

    // The latest version of the OpenAI API forced the content-encoding to be "br" in json response
    // So if the streaming is disabled, we need to remove the content-encoding header
    // Because Vercel uses gzip to compress the response, if we don't remove the content-encoding header
    // The browser will try to decode the response with brotli and fail
    newHeaders.delete("content-encoding");

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: newHeaders,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function requestLog(
  req: NextRequest,
  jsonBody: any,
  url_path: string,
) {
  // LOG
  try {
    if (url_path.startsWith("mj/") && !url_path.startsWith("mj/submit/")) {
      return;
    }
    // const protocol = req.headers.get("x-forwarded-proto") || "http";
    //const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const baseUrl = "http://localhost:3000";
    const ip = getIP(req);
    // 对其进行 Base64 解码
    let h_userName = req.headers.get("x-request-name");
    if (h_userName) {
      const buffer = Buffer.from(h_userName, "base64");
      h_userName = decodeURIComponent(buffer.toString("utf-8"));
    }
    console.log("[中文]", h_userName, baseUrl);
    const logData = {
      ip: ip,
      path: url_path,
      // logEntry: JSON.stringify(jsonBody),
      model: url_path.startsWith("mj/") ? "midjourney" : jsonBody?.model, // 后面尝试请求是添加到参数
      userName: h_userName,
    };

    await fetch(`${baseUrl}/api/logs/openai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // ...req.headers,
      },
      body: JSON.stringify(logData),
    });
  } catch (e) {
    console.log("[LOG]", e, "==========");
  }
}
