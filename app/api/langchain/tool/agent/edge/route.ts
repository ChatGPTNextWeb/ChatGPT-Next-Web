import { NextRequest, NextResponse } from "next/server";
import { AgentApi, RequestBody, ResponseBody } from "../agentapi";
import { auth } from "@/app/api/auth";
import { EdgeTool } from "../../../../langchain-tools/edge_tools";
import { ModelProvider } from "@/app/constant";
import { Embeddings } from "@langchain/core/embeddings";
import { BaseLanguageModel } from "@langchain/core/language_models/base";

async function handle(req: NextRequest) {
  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }
  try {
    const authResult = auth(req, ModelProvider.GPT);
    if (authResult.error) {
      return NextResponse.json(authResult, {
        status: 401,
      });
    }

    const encoder = new TextEncoder();
    const transformStream = new TransformStream();
    const writer = transformStream.writable.getWriter();
    const controller = new AbortController();
    const agentApi = new AgentApi(encoder, transformStream, writer, controller);

    const reqBody: RequestBody = await req.json();
    const authToken = req.headers.get("Authorization") ?? "";
    const token = authToken.trim().replaceAll("Bearer ", "").trim();

    const apiKey = agentApi.getApiKey(token, reqBody.provider);
    const baseUrl = agentApi.getBaseUrl(reqBody.baseUrl, reqBody.provider);

    let model: BaseLanguageModel;
    let embeddings: Embeddings | null;
    model = agentApi.getToolBaseLanguageModel(reqBody, apiKey, baseUrl);
    embeddings = agentApi.getToolEmbeddings(reqBody, apiKey, baseUrl);

    var dalleCallback = async (data: string) => {
      var response = new ResponseBody();
      response.message = data;
      await writer.ready;
      await writer.write(
        encoder.encode(`data: ${JSON.stringify(response)}\n\n`),
      );
      controller.abort({
        reason: "dall-e tool abort",
      });
    };

    var edgeTool = new EdgeTool(
      apiKey,
      baseUrl,
      model,
      embeddings,
      dalleCallback,
    );
    var edgeTools = await edgeTool.getCustomTools();
    var tools = [...edgeTools];
    return await agentApi.getApiHandler(req, reqBody, tools);
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as any).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
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
