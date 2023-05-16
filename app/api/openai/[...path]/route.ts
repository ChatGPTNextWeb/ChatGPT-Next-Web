import { prettyObject } from "@/app/utils/format";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../auth";
import { requestOpenai } from "../../common";

const TELEGRAPH_URL = "https://api.openai.com";
const proxy = async (request: Request) => {
  const url = new URL(request.url);
  const headers_Origin =
    request.headers.get("Access-Control-Allow-Origin") || "*";
  url.host = TELEGRAPH_URL.replace(/^https?:\/\//, "");
  url.pathname = url.pathname.replace(/^\/api\/openai/, "");
  // return new Response(url.toString());
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
};

async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  return await proxy(req);
  // console.log("[OpenAI Route] params ", params);

  // const authResult = auth(req);
  // if (authResult.error) {
  //   return NextResponse.json(authResult, {
  //     status: 401,
  //   });
  // }

  // try {
  //   return await requestOpenai(req);
  // } catch (e) {
  //   console.error("[OpenAI] ", e);
  //   return NextResponse.json(prettyObject(e));
  // }
}

export const GET = handle;
export const POST = handle;

export const runtime = "edge";
