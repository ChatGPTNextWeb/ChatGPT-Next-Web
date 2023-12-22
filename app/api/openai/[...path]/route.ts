import { type OpenAIListModelResponse } from "@/app/client/platforms/openai";
import { getServerSideConfig } from "@/app/config/server";
import { OpenaiPath, AZURE_PATH, AZURE_MODELS } from "@/app/constant";
import { prettyObject } from "@/app/utils/format";
import { NextRequest, NextResponse } from "next/server";
import { auth, getIP } from "../../auth";
import { getToken } from "next-auth/jwt";
import { requestOpenai } from "../../common";
import { headers } from "next/headers";

const ALLOWD_PATH = new Set(Object.values({ ...OpenaiPath, ...AZURE_PATH }));

function getModels(remoteModelRes: OpenAIListModelResponse) {
  const config = getServerSideConfig();

  if (config.disableGPT4) {
    remoteModelRes.data = remoteModelRes.data.filter(
      (m) => !m.id.startsWith("gpt-4"),
    );
  }

  console.log(remoteModelRes.data);
  // 过滤不需要的模型
  remoteModelRes.data = remoteModelRes.data.filter(
    (m) =>
      m.id === "gpt-4-0613" ||
      m.id === "gpt-3.5-turbo-16k" ||
      m.id === "gpt-4-32k",
  );
  return remoteModelRes;
}

async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  // console.log("[OpenAI Route] params ", params);

  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }

  const subpath = params.path.join("/");

  if (!ALLOWD_PATH.has(subpath)) {
    console.log("[OpenAI Route] forbidden path ", subpath);
    return NextResponse.json(
      {
        error: true,
        msg: "you are not allowed to request " + subpath,
      },
      {
        status: 403,
      },
    );
  }
  let cloneBody, jsonBody;

  try {
    cloneBody = (await req.text()) as any;
    jsonBody = JSON.parse(cloneBody) as { model?: string };
  } catch (e) {
    jsonBody = {};
  }

  try {
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
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
      path: subpath,
      logEntry: JSON.stringify(jsonBody),
      model: jsonBody?.model,
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

  const isAzure = AZURE_MODELS.includes(jsonBody?.model as string);
  // console.log("[Models]", jsonBody?.model);
  const authResult = auth(req, isAzure);
  // if (authResult.error) {
  //   return NextResponse.json(authResult, {
  //     status: 401,
  //   });
  // }

  try {
    const response = await requestOpenai(
      req,
      cloneBody,
      isAzure,
      jsonBody?.model ?? "",
    );

    // list models
    if (subpath === OpenaiPath.ListModelPath && response.status === 200) {
      const resJson = (await response.json()) as OpenAIListModelResponse;
      const availableModels = getModels(resJson);
      return NextResponse.json(availableModels, {
        status: response.status,
      });
    }

    return response;
  } catch (e) {
    console.error("[OpenAI] ", e);
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
