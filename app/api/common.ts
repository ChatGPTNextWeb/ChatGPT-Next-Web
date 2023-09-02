import { NextRequest, NextResponse } from "next/server";

export const OPENAI_URL = "api.openai.com";
const DEFAULT_PROTOCOL = "https";
const PROTOCOL = process.env.PROTOCOL || DEFAULT_PROTOCOL;
const BASE_URL = process.env.BASE_URL || OPENAI_URL;
const DISABLE_GPT4 = !!process.env.DISABLE_GPT4;
const AZURE_BASE_URL = process.env.AZURE_BASE_URL;
const AZURE_API_VERSION = process.env.AZURE_API_VERSION;
const AZURE_API_KEY = process.env.AZURE_API_KEY;

export async function requestOpenai(req: NextRequest) {
  const controller = new AbortController();
  const authValue = req.headers.get("Authorization") ?? "";

  const openaiPath = `${req.nextUrl.pathname}${req.nextUrl.search}`.replaceAll(
    "/api/openai/",
    "",
  );

  let baseUrl = BASE_URL;

  if (!baseUrl.startsWith("http")) {
    baseUrl = `${PROTOCOL}://${baseUrl}`;
  }

  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
  }

  // console.log("[Proxy] ", openaiPath);
  // console.log("[Base Url]", baseUrl);

  if (process.env.OPENAI_ORG_ID) {
    console.log("[Org ID]", process.env.OPENAI_ORG_ID);
  }

  const timeoutId = setTimeout(
    () => {
      controller.abort();
    },
    10 * 60 * 1000,
  );

  const fetchOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      Authorization: authValue,
      ...(process.env.OPENAI_ORG_ID && {
        "OpenAI-Organization": process.env.OPENAI_ORG_ID,
      }),
    },
    method: req.method,
    body: req.body,
    // to fix #2485: https://stackoverflow.com/questions/55920957/cloudflare-worker-typeerror-one-time-use-body
    redirect: "manual",
    // @ts-ignore
    duplex: "half",
    signal: controller.signal,
  };

  const body = await req.text();
  fetchOptions.body = body;
  const reqJson = JSON.parse(body);
  const reqModel = reqJson?.model ?? "";

  let fetchUrl;
  if (reqModel.startsWith("Azure")) {
    fetchUrl = `${PROTOCOL}://${AZURE_BASE_URL}/openai/deployments/${reqModel.replaceAll(
      ".",
      "",
    )}/chat/completions?api-version=${AZURE_API_VERSION}&api-key=${AZURE_API_KEY}`;
  } else {
    fetchUrl = `${baseUrl}/${openaiPath}`;
  }

  // #1815 try to refuse gpt4 request
  if (DISABLE_GPT4 && req.body) {
    try {
      if (reqModel.includes("gpt-4")) {
        return NextResponse.json(
          {
            error: true,
            message: "you are not allowed to use gpt-4 model",
          },
          {
            status: 403,
          },
        );
      }
    } catch (e) {
      console.error("[OpenAI] gpt4 filter", e);
    }
  }

  const logResponse = async (res: Response) => {
    const reader = res.clone().body?.getReader();
    if (!reader) {
      return;
    }
    let content = "";
    while (true) {
      const { done, value } = await reader.read();
      let msgList;
      try {
        msgList = new TextDecoder().decode(value).split("\n");
        msgList = msgList
          .map((msg) => msg.replace("data:", "").trim())
          .filter((msg) => msg);
        for (let msg of msgList) {
          const data = JSON.parse(msg);
          const delta = data?.choices?.[0]?.delta?.content || "";
          content += delta;
        }
      } catch (e) {}
      if (done || !msgList || msgList.indexOf("[DONE]") !== -1) break;
    }
    console.log(`[Response][${req.method}] ${content}`);
  };

  try {
    console.log(
      `[Request][${req.method}] ${fetchUrl} ${JSON.stringify(reqJson)}`,
    );
    const res = await fetch(fetchUrl, fetchOptions);
    logResponse(res);

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
