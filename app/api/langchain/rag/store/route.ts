import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth";
import { NodeJSTool } from "@/app/api/langchain-tools/nodejs_tools";
import { ACCESS_CODE_PREFIX, ModelProvider } from "@/app/constant";
import { OpenAI, OpenAIEmbeddings } from "@langchain/openai";
import path from "path";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Pinecone } from "@pinecone-database/pinecone";
import { Document } from "@langchain/core/documents";
import { PineconeStore } from "@langchain/pinecone";
import { getServerSideConfig } from "@/app/config/server";
import { RequestBody } from "../../tool/agent/agentapi";

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

    //https://js.langchain.com/docs/integrations/vectorstores/pinecone
    // const formData = await req.formData();
    // const file = formData.get("file") as File;
    // const originalFileName = file?.name;

    // const fileReader = file.stream().getReader();
    // const fileData: number[] = [];

    // while (true) {
    //   const { done, value } = await fileReader.read();
    //   if (done) break;
    //   fileData.push(...value);
    // }

    // const buffer = Buffer.from(fileData);
    // const fileType = path.extname(originalFileName).slice(1);
    // const fileBlob = bufferToBlob(buffer, "application/pdf")

    // const loader = new PDFLoader(fileBlob);
    // const docs = await loader.load();
    // const textSplitter = new RecursiveCharacterTextSplitter({
    //   chunkSize: 1000,
    //   chunkOverlap: 200,
    // });
    // const splits = await textSplitter.splitDocuments(docs);
    const pinecone = new Pinecone();
    // await pinecone.createIndex({
    //   name: 'example-index',
    //   dimension: 1536,
    //   metric: 'cosine',
    //   spec: {
    //     pod: {
    //       environment: 'gcp-starter',
    //       podType: 'p1.x1',
    //       pods: 1
    //     }
    //   }
    // });
    const pineconeIndex = pinecone.Index("example-index");
    const docs = [
      new Document({
        metadata: { foo: "bar" },
        pageContent: "pinecone is a vector db",
      }),
      new Document({
        metadata: { foo: "bar" },
        pageContent: "the quick brown fox jumped over the lazy dog",
      }),
      new Document({
        metadata: { baz: "qux" },
        pageContent: "lorem ipsum dolor sit amet",
      }),
      new Document({
        metadata: { baz: "qux" },
        pageContent: "pinecones are the woody fruiting body and of a pine tree",
      }),
    ];
    const apiKey = getOpenAIApiKey(token);
    const baseUrl = getOpenAIBaseUrl(reqBody.baseUrl);
    console.log(baseUrl);
    const embeddings = new OpenAIEmbeddings(
      {
        modelName: "text-embedding-ada-002",
        openAIApiKey: apiKey,
      },
      { basePath: baseUrl },
    );
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex,
      maxConcurrency: 5,
    });
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
    });
    const results = await vectorStore.similaritySearch("pinecone", 1, {
      foo: "bar",
    });
    console.log(results);
    return NextResponse.json(
      {
        storeId: "",
      },
      {
        status: 200,
      },
    );
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as any).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function bufferToBlob(buffer: Buffer, mimeType?: string): Blob {
  const arrayBuffer: ArrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  );
  return new Blob([arrayBuffer], { type: mimeType || "" });
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

export const GET = handle;
export const POST = handle;

export const runtime = "nodejs";
