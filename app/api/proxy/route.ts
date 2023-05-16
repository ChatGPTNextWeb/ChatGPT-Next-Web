import { NextRequest } from "next/server";

const TELEGRAPH_URL = "https://api.openai.com";

async function proxy(request: NextRequest) {
  const url = new URL(request.url);
  const headers_Origin =
    request.headers.get("Access-Control-Allow-Origin") || "*";
  url.host = TELEGRAPH_URL.replace(/^https?:\/\//, "");
  url.pathname = url.pathname.replace(/^\/api/, "");
  const modifiedRequest = new Request(url.toString(), {
    headers: request.headers,
    method: request.method,
    body: request.body,
    redirect: "follow",
  });
  const response = await fetch(modifiedRequest);
  const modifiedResponse = new Response(response.body, response);
  // 添加允许跨域访问的响应头
  modifiedResponse.headers.set("Access-Control-Allow-Origin", headers_Origin);
  return modifiedResponse;
}

export const GET = proxy;
export const POST = proxy;
export const runtime = "edge";
