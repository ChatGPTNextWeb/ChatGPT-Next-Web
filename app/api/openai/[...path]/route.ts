import { type OpenAIListModelResponse } from "@/app/client/platforms/openai";
import { getServerSideConfig } from "@/app/config/server";

import { prettyObject } from "@/app/utils/format";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../auth";
import { requestOpenai, requestWhisperConversion } from "../../common";
import { ModelProvider, OpenaiPath } from "@/app/constant";

const ALLOWD_PATH = new Set(Object.values(OpenaiPath));

function getModels(remoteModelRes: OpenAIListModelResponse) {
  const config = getServerSideConfig();

  if (config.disableGPT4) {
    remoteModelRes.data = remoteModelRes.data.filter(
      (m) => !m.id.startsWith("gpt-4"),
    );
  }

  return remoteModelRes;
}

async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  console.log("[OpenAI Route] params ", params);

  // console.log(req);

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

  const authResult = auth(req, ModelProvider.GPT);
  if (authResult.error) {
    return NextResponse.json(authResult, {
      status: 401,
    });
  }

  try {
    let response;
    if (subpath === OpenaiPath.WhisperConversion) {
      // const formData = await req.formData()
      // // const model = formData.get('model')
      // const file = formData.get('file')
      response = await requestWhisperConversion(req);
      const { text, error } = await response.json();
      console.log(text, error);
      if (error) {
        return NextResponse.json(error, {
          status: 401,
        });
      } else {
        return NextResponse.json(
          { text, code: 200 },
          {
            status: 200,
          },
        );
      }
    } else {
      response = await requestOpenai(req);
      // list models
      if (subpath === OpenaiPath.ListModelPath && response.status === 200) {
        const resJson = (await response.json()) as OpenAIListModelResponse;
        const availableModels = getModels(resJson);
        return NextResponse.json(availableModels, {
          status: response.status,
        });
      }
    }

    return response;
  } catch (e) {
    console.error("[OpenAI] ", e);
    return NextResponse.json(prettyObject(e));
  }
}

export const GET = handle;
export const POST = handle;

export const runtime = "nodejs"; // 'nodejs' (default) | 'edge'
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

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// }
