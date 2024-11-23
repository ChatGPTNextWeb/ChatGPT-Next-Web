import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
import { sign } from "../utils/aws";
import { getServerSideConfig } from "../config/server";
import { ModelProvider } from "@/app/constant";
import { prettyObject } from "@/app/utils/format";
const ALLOWED_PATH = new Set(["chat", "models"]);

function parseEventData(chunk: Uint8Array): any {
  const decoder = new TextDecoder();
  const text = decoder.decode(chunk);
  try {
    const parsed = JSON.parse(text);
    // AWS Bedrock wraps the response in a 'body' field
    if (typeof parsed.body === "string") {
      try {
        return JSON.parse(parsed.body);
      } catch (e) {
        return { output: parsed.body };
      }
    }
    return parsed.body || parsed;
  } catch (e) {
    // console.error("Error parsing event data:", e);
    try {
      // Handle base64 encoded responses
      const base64Match = text.match(/:"([A-Za-z0-9+/=]+)"/);
      if (base64Match) {
        const decoded = Buffer.from(base64Match[1], "base64").toString("utf-8");
        try {
          return JSON.parse(decoded);
        } catch (e) {
          return { output: decoded };
        }
      }

      // Handle event-type responses
      const eventMatch = text.match(/:event-type[^\{]+({.*})/);
      if (eventMatch) {
        try {
          return JSON.parse(eventMatch[1]);
        } catch (e) {
          return { output: eventMatch[1] };
        }
      }

      // Handle plain text responses
      if (text.trim()) {
        // Clean up any malformed JSON characters
        const cleanText = text.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
        return { output: cleanText };
      }
    } catch (innerError) {
      console.error("Error in fallback parsing:", innerError);
    }
  }
  return null;
}

async function* transformBedrockStream(
  stream: ReadableStream,
  modelId: string,
) {
  const reader = stream.getReader();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        if (buffer) {
          yield `data: ${JSON.stringify({
            delta: { text: buffer },
          })}\n\n`;
        }
        break;
      }

      const parsed = parseEventData(value);
      if (!parsed) continue;

      // console.log("Parsed response:", JSON.stringify(parsed, null, 2));

      // Handle Titan models
      if (modelId.startsWith("amazon.titan")) {
        const text = parsed.outputText || "";
        if (text) {
          yield `data: ${JSON.stringify({
            delta: { text },
          })}\n\n`;
        }
      }
      // Handle LLaMA3 models
      else if (modelId.startsWith("us.meta.llama3")) {
        let text = "";
        if (parsed.generation) {
          text = parsed.generation;
        } else if (parsed.output) {
          text = parsed.output;
        } else if (typeof parsed === "string") {
          text = parsed;
        }

        if (text) {
          // Clean up any control characters or invalid JSON characters
          text = text.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
          yield `data: ${JSON.stringify({
            delta: { text },
          })}\n\n`;
        }
      }
      // Handle Mistral models
      else if (modelId.startsWith("mistral.mistral")) {
        const text =
          parsed.output || parsed.outputs?.[0]?.text || parsed.completion || "";
        if (text) {
          yield `data: ${JSON.stringify({
            delta: { text },
          })}\n\n`;
        }
      }
      // Handle Claude models
      else if (modelId.startsWith("anthropic.claude")) {
        if (parsed.type === "content_block_delta") {
          if (parsed.delta?.type === "text_delta") {
            yield `data: ${JSON.stringify({
              delta: { text: parsed.delta.text },
            })}\n\n`;
          } else if (parsed.delta?.type === "input_json_delta") {
            yield `data: ${JSON.stringify(parsed)}\n\n`;
          }
        } else if (
          parsed.type === "message_delta" &&
          parsed.delta?.stop_reason
        ) {
          yield `data: ${JSON.stringify({
            delta: { stop_reason: parsed.delta.stop_reason },
          })}\n\n`;
        } else if (
          parsed.type === "content_block_start" &&
          parsed.content_block?.type === "tool_use"
        ) {
          yield `data: ${JSON.stringify(parsed)}\n\n`;
        } else if (parsed.type === "content_block_stop") {
          yield `data: ${JSON.stringify(parsed)}\n\n`;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

function validateRequest(body: any, modelId: string): void {
  if (!modelId) throw new Error("Model ID is required");

  const bodyContent = body.body || body;

  if (modelId.startsWith("anthropic.claude")) {
    if (
      !body.anthropic_version ||
      body.anthropic_version !== "bedrock-2023-05-31"
    ) {
      throw new Error("anthropic_version must be 'bedrock-2023-05-31'");
    }
    if (typeof body.max_tokens !== "number" || body.max_tokens < 0) {
      throw new Error("max_tokens must be a positive number");
    }
    if (modelId.startsWith("anthropic.claude-3")) {
      if (!Array.isArray(body.messages))
        throw new Error("messages array is required for Claude 3");
    } else if (typeof body.prompt !== "string") {
      throw new Error("prompt is required for Claude 2 and earlier");
    }
  } else if (modelId.startsWith("us.meta.llama3")) {
    if (!bodyContent.prompt) {
      throw new Error("prompt is required for LLaMA3 models");
    }
  } else if (modelId.startsWith("mistral.mistral")) {
    if (!bodyContent.prompt) throw new Error("Mistral requires a prompt");
  } else if (modelId.startsWith("amazon.titan")) {
    if (!bodyContent.inputText) throw new Error("Titan requires inputText");
  }
}

async function requestBedrock(req: NextRequest) {
  const controller = new AbortController();

  // Get AWS credentials from server config first
  const config = getServerSideConfig();
  let awsRegion = config.awsRegion;
  let awsAccessKey = config.awsAccessKey;
  let awsSecretKey = config.awsSecretKey;
  let modelId = req.headers.get("ModelID");

  // If server-side credentials are not available, parse from Authorization header
  if (!awsRegion || !awsAccessKey || !awsSecretKey) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Missing or invalid Authorization header");
    }

    const [_, credentials] = authHeader.split("Bearer ");
    const [region, accessKey, secretKey] = credentials.split(":");

    if (!region || !accessKey || !secretKey) {
      throw new Error("Invalid Authorization header format");
    }

    awsRegion = region;
    awsAccessKey = accessKey;
    awsSecretKey = secretKey;
  }

  if (!awsRegion || !awsAccessKey || !awsSecretKey || !modelId) {
    throw new Error("Missing required AWS credentials or model ID");
  }

  // Construct the base endpoint
  const baseEndpoint = `https://bedrock-runtime.${awsRegion}.amazonaws.com`;

  // Set up timeout
  const timeoutId = setTimeout(() => controller.abort(), 10 * 60 * 1000);

  try {
    // Determine the endpoint and request body based on model type
    let endpoint;
    let requestBody;
    let additionalHeaders = {};

    const bodyText = await req.clone().text();
    if (!bodyText) {
      throw new Error("Request body is empty");
    }

    const bodyJson = JSON.parse(bodyText);
    validateRequest(bodyJson, modelId);

    // For all other models, use standard endpoint
    endpoint = `${baseEndpoint}/model/${modelId}/invoke-with-response-stream`;
    requestBody = JSON.stringify(bodyJson.body || bodyJson);

    console.log("Request to AWS Bedrock:", {
      endpoint,
      modelId,
      body: requestBody,
    });

    const headers = await sign({
      method: "POST",
      url: endpoint,
      region: awsRegion,
      accessKeyId: awsAccessKey,
      secretAccessKey: awsSecretKey,
      body: requestBody,
      service: "bedrock",
    });

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        ...headers,
        ...additionalHeaders,
      },
      body: requestBody,
      redirect: "manual",
      // @ts-ignore
      duplex: "half",
      signal: controller.signal,
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("AWS Bedrock error response:", error);
      try {
        const errorJson = JSON.parse(error);
        throw new Error(errorJson.message || error);
      } catch {
        throw new Error(error || "Failed to get response from Bedrock");
      }
    }

    if (!res.body) {
      throw new Error("Empty response from Bedrock");
    }

    const transformedStream = transformBedrockStream(res.body, modelId);
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of transformedStream) {
            controller.enqueue(new TextEncoder().encode(chunk));
          }
          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (e) {
    console.error("Request error:", e);
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }

  const subpath = params.path.join("/");
  if (!ALLOWED_PATH.has(subpath)) {
    return NextResponse.json(
      { error: true, msg: "you are not allowed to request " + subpath },
      { status: 403 },
    );
  }
  const authResult = auth(req, ModelProvider.Bedrock);
  if (authResult.error) {
    return NextResponse.json(authResult, {
      status: 401,
    });
  }
  try {
    return await requestBedrock(req);
  } catch (e) {
    console.error("Handler error:", e);
    return NextResponse.json(prettyObject(e));
  }
}
