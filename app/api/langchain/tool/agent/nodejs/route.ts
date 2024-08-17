import { NextRequest, NextResponse } from "next/server";
import { AgentApi, RequestBody, ResponseBody } from "../agentapi";
import { auth } from "@/app/api/auth";
import { NodeJSTool } from "@/app/api/langchain-tools/nodejs_tools";
import { ModelProvider, ServiceProvider } from "@/app/constant";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { Embeddings } from "@langchain/core/embeddings";
import { BaseLanguageModel } from "@langchain/core/language_models/base";

async function handle(req: NextRequest) {
  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }
  try {
    const reqBody: RequestBody = await req.json();
    const modelProvider =
      reqBody.provider === ServiceProvider.Anthropic
        ? ModelProvider.Claude
        : ModelProvider.GPT;
    const authResult = auth(req, modelProvider);
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

    const authToken =
      (req.headers.get("Authorization") || req.headers.get("x-api-key")) ?? "";
    const token = authToken.trim().replaceAll("Bearer ", "").trim();

    const apiKey = agentApi.getApiKey(token, reqBody.provider);
    const baseUrl = agentApi.getBaseUrl(reqBody.baseUrl, reqBody.provider);
    let model: BaseLanguageModel;
    let embeddings: Embeddings | null;
    model = agentApi.getToolBaseLanguageModel(reqBody, apiKey, baseUrl);
    embeddings = agentApi.getToolEmbeddings(reqBody, apiKey, baseUrl);

    let ragEmbeddings: Embeddings;
    if (process.env.OLLAMA_BASE_URL) {
      ragEmbeddings = new OllamaEmbeddings({
        model: process.env.RAG_EMBEDDING_MODEL,
        baseUrl: process.env.OLLAMA_BASE_URL,
      });
    } else {
      ragEmbeddings = new OpenAIEmbeddings(
        {
          modelName:
            process.env.RAG_EMBEDDING_MODEL ?? "text-embedding-3-large",
          openAIApiKey: apiKey,
        },
        { basePath: baseUrl },
      );
    }

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

    var nodejsTool = new NodeJSTool(
      apiKey,
      baseUrl,
      model,
      embeddings,
      reqBody.chatSessionId,
      ragEmbeddings,
      dalleCallback,
    );
    var nodejsTools = await nodejsTool.getCustomTools();
    var tools = [...nodejsTools];
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

export const maxDuration = 60;
export const runtime = "nodejs";
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
