import { type OpenAIListModelResponse } from "@/app/client/platforms/openai";
import { getServerSideConfig } from "@/app/config/server";
import { ModelProvider, OpenaiPath } from "@/app/constant";
import { prettyObject } from "@/app/utils/format";
import { NextRequest, NextResponse } from "next/server";
// import { auth } from "../../auth";
import { requestFastgpt } from "../../common";

const ALLOWD_PATH = new Set(Object.values(OpenaiPath));

// Model由FastAPI提供，该路由仅负责发送请求
function getModels(remoteModelRes: OpenAIListModelResponse) {
  const config = getServerSideConfig();

  // if (config.disableGPT4) {
  //   remoteModelRes.data = remoteModelRes.data.filter(
  //     (m) => !m.id.startsWith("gpt-4"),
  //   );
  // }
  return remoteModelRes;
}

async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  console.log("[FastGPT Route] params ", params);

  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }

  // const subpath = params.path.join("/");

  // if (!ALLOWD_PATH.has(subpath)) {
  //   console.log("[OpenAI Route] forbidden path ", subpath);
  //   return NextResponse.json(
  //     {
  //       error: true,
  //       msg: "you are not allowed to request " + subpath,
  //     },
  //     {
  //       status: 403,
  //     },
  //   );
  // }

  // const authResult = auth(req, ModelProvider.GPT);
  // if (authResult.error) {
  //   return NextResponse.json(authResult, {
  //     status: 401,
  //   });
  // }

  try {
    const response = await requestFastgpt(req);

    // list models
    if (response.status === 200) {
      const resJson = (await response.json()) as OpenAIListModelResponse;
      //原逻辑从返回的JSON中获取模型列表, 但FastGPT的模型由FastAPI提供
      //该逻辑直接跳过
      const availableModels = getModels(resJson);
      return NextResponse.json(availableModels, {
        status: response.status,
      });
    }

    return response;
  } catch (e) {
    console.error("[FastGPT] ", e);
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
