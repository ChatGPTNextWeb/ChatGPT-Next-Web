import { NextRequest } from "next/server";

export const OPENAI_URL = "api.openai.com";
const DEFAULT_PROTOCOL = "https";
const PROTOCOL = process.env.PROTOCOL ?? DEFAULT_PROTOCOL;
const BASE_URL = process.env.BASE_URL ?? OPENAI_URL;

export async function requestOpenai(req: NextRequest) {
  const controller = new AbortController();
  //徐中伟Azure
  //const authValue = req.headers.get("Authorization") ?? "";
  //const authValue = req.headers.get("api-key") ?? "";
  // const openaiPath = `${req.nextUrl.pathname}${req.nextUrl.search}`.replaceAll(
  //   "/api/openai/",
  //   "",
  // );
  // const openaiPath = '/openai/deployments/chatGPT/chat/completions\\?api-version\\=2023-05-15';
  //
  // let baseUrl = BASE_URL;

  // if (!baseUrl.startsWith("http")) {
  //   baseUrl = `${PROTOCOL}://${baseUrl}`;
  // }

  // console.log("[Proxy] ", openaiPath);
  // console.log("[Base Url]", baseUrl);

  if (process.env.OPENAI_ORG_ID) {
    console.log("[Org ID]", process.env.OPENAI_ORG_ID);
  }

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 10 * 60 * 1000);

  // const fetchUrl = `${baseUrl}/${openaiPath}`;
  const baseUrl = "https://nsf-gen.openai.azure.com";
  const openaiPath = "/openai/deployments/chatGPT/chat/completions";
  const apiVersion = "2023-05-15";
  const authValue = "02434786211b4d939777ec9384a51384";
  const fetchUrl = `${baseUrl}${openaiPath}?api-version=${apiVersion}`;
  const fetchOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      "api-key": authValue,
      ...(process.env.OPENAI_ORG_ID && {
        "OpenAI-Organization": process.env.OPENAI_ORG_ID,
      }),
    },
    cache: "no-store",
    method: req.method,
    body: req.body,
    signal: controller.signal, // 请确保定义了 controller.signal 变量
  };

  try {
    const res = await fetch(fetchUrl, fetchOptions);
    if (res.status === 401) {
      // to prevent browser prompt for credentials
      const newHeaders = new Headers(res.headers);
      newHeaders.delete("www-authenticate");
      return new Response(res.body, {
        status: res.status,
        statusText: res.statusText,
        headers: newHeaders,
      });
    }

    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}
