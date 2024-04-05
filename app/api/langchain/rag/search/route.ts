import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth";
import { ACCESS_CODE_PREFIX, ModelProvider } from "@/app/constant";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { getServerSideConfig } from "@/app/config/server";

interface RequestBody {
  sessionId: string;
  query: string;
  baseUrl?: string;
}

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

    const reqBody: RequestBody = await req.json();
    const authToken = req.headers.get("Authorization") ?? "";
    const token = authToken.trim().replaceAll("Bearer ", "").trim();

    const pinecone = new Pinecone();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);
    const apiKey = getOpenAIApiKey(token);
    const baseUrl = getOpenAIBaseUrl(reqBody.baseUrl);
    const embeddings = new OpenAIEmbeddings(
      {
        modelName: process.env.RAG_EMBEDDING_MODEL ?? "text-embedding-3-large",
        openAIApiKey: apiKey,
      },
      { basePath: baseUrl },
    );
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
    });
    const results = await vectorStore.similaritySearch(reqBody.query, 1, {
      sessionId: reqBody.sessionId,
    });
    console.log(results);
    return NextResponse.json(results, {
      status: 200,
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as any).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function getOpenAIApiKey(token: string) {
  const serverConfig = getServerSideConfig();
  const isApiKey = !token.startsWith(ACCESS_CODE_PREFIX);

  let apiKey = serverConfig.apiKey;
  if (isApiKey && token) {
    apiKey = token;
  }
  return apiKey;
}

function getOpenAIBaseUrl(reqBaseUrl: string | undefined) {
  const serverConfig = getServerSideConfig();
  let baseUrl = "https://api.openai.com/v1";
  if (serverConfig.baseUrl) baseUrl = serverConfig.baseUrl;
  if (reqBaseUrl?.startsWith("http://") || reqBaseUrl?.startsWith("https://"))
    baseUrl = reqBaseUrl;
  if (!baseUrl.endsWith("/v1"))
    baseUrl = baseUrl.endsWith("/") ? `${baseUrl}v1` : `${baseUrl}/v1`;
  console.log("[baseUrl]", baseUrl);
  return baseUrl;
}

export const POST = handle;

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
