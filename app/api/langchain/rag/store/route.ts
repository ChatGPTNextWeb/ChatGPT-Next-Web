import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth";
import { ACCESS_CODE_PREFIX, ModelProvider } from "@/app/constant";
import { OpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { DocxLoader } from "langchain/document_loaders/fs/docx";
import { EPubLoader } from "langchain/document_loaders/fs/epub";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { JSONLinesLoader } from "langchain/document_loaders/fs/json";
import { OpenAIWhisperAudio } from "langchain/document_loaders/fs/openai_whisper_audio";
// import { PPTXLoader } from "langchain/document_loaders/fs/pptx";
import { SRTLoader } from "langchain/document_loaders/fs/srt";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { getServerSideConfig } from "@/app/config/server";
import { FileInfo } from "@/app/client/platforms/utils";
import mime from "mime";
import LocalFileStorage from "@/app/utils/local_file_storage";
import S3FileStorage from "@/app/utils/s3_file_storage";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";
import { Embeddings } from "langchain/dist/embeddings/base";

interface RequestBody {
  sessionId: string;
  fileInfos: FileInfo[];
  baseUrl?: string;
}

function getLoader(
  fileName: string,
  fileBlob: Blob,
  openaiApiKey: string,
  openaiBaseUrl: string,
) {
  const extension = fileName.split(".").pop();
  switch (extension) {
    case "txt":
    case "md":
      return new TextLoader(fileBlob);
    case "pdf":
      return new PDFLoader(fileBlob);
    case "docx":
      return new DocxLoader(fileBlob);
    case "csv":
      return new CSVLoader(fileBlob);
    case "json":
      return new JSONLoader(fileBlob);
    // case 'pptx':
    //   return new PPTXLoader(fileBlob);
    case "srt":
      return new SRTLoader(fileBlob);
    case "mp3":
      return new OpenAIWhisperAudio(fileBlob, {
        clientOptions: {
          apiKey: openaiApiKey,
          baseURL: openaiBaseUrl,
        },
      });
    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
}

async function handle(req: NextRequest) {
  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }
  const privateKey = process.env.SUPABASE_PRIVATE_KEY;
  if (!privateKey) throw new Error(`Expected env var SUPABASE_PRIVATE_KEY`);
  const url = process.env.SUPABASE_URL;
  if (!url) throw new Error(`Expected env var SUPABASE_URL`);

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
    const apiKey = getOpenAIApiKey(token);
    const baseUrl = getOpenAIBaseUrl(reqBody.baseUrl);
    const serverConfig = getServerSideConfig();
    let embeddings: Embeddings;
    if (process.env.OLLAMA_BASE_URL) {
      embeddings = new OllamaEmbeddings({
        model: serverConfig.ragEmbeddingModel,
        baseUrl: process.env.OLLAMA_BASE_URL,
      });
    } else {
      embeddings = new OpenAIEmbeddings(
        {
          modelName: serverConfig.ragEmbeddingModel,
          openAIApiKey: apiKey,
        },
        { basePath: baseUrl },
      );
    }
    // https://js.langchain.com/docs/integrations/vectorstores/pinecone
    // https://js.langchain.com/docs/integrations/vectorstores/qdrant
    // process files
    let partial = "";
    for (let i = 0; i < reqBody.fileInfos.length; i++) {
      const fileInfo = reqBody.fileInfos[i];
      const contentType = mime.getType(fileInfo.fileName);
      // get file buffer
      var fileBuffer: Buffer | undefined;
      if (serverConfig.isStoreFileToLocal) {
        fileBuffer = await LocalFileStorage.get(fileInfo.fileName);
      } else {
        var file = await S3FileStorage.get(fileInfo.fileName);
        var fileByteArray = await file?.transformToByteArray();
        if (fileByteArray) fileBuffer = Buffer.from(fileByteArray);
      }
      if (!fileBuffer || !contentType) {
        console.error(`get ${fileInfo.fileName} buffer fail`);
        continue;
      }
      // load file to docs
      const fileBlob = bufferToBlob(fileBuffer, contentType);
      const loader = getLoader(fileInfo.fileName, fileBlob, apiKey, baseUrl);
      const docs = await loader.load();
      // modify doc meta
      docs.forEach((doc) => {
        doc.metadata = {
          ...doc.metadata,
          sessionId: reqBody.sessionId,
          sourceFileName: fileInfo.originalFilename,
          fileName: fileInfo.fileName,
        };
      });
      // split
      const chunkSize = serverConfig.ragChunkSize
        ? parseInt(serverConfig.ragChunkSize, 10)
        : 2000;
      const chunkOverlap = serverConfig.ragChunkOverlap
        ? parseInt(serverConfig.ragChunkOverlap, 10)
        : 200;
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: chunkSize,
        chunkOverlap: chunkOverlap,
      });
      const splits = await textSplitter.splitDocuments(docs);
      const client = createClient(url, privateKey);
      const vectorStore = await SupabaseVectorStore.fromDocuments(
        splits,
        embeddings,
        {
          client,
          tableName: "documents",
          queryName: "match_documents",
        },
      );
      partial = splits
        .slice(0, 2)
        .map((v) => v.pageContent)
        .join("\n");
    }
    return NextResponse.json(
      {
        sessionId: reqBody.sessionId,
        partial: partial,
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
