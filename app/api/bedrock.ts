import { NextRequest, NextResponse } from "next/server";
import { sign, decrypt } from "../utils/aws";

const ALLOWED_PATH = new Set(["chat", "models"]);

function parseEventData(chunk: Uint8Array): any {
  const decoder = new TextDecoder();
  const text = decoder.decode(chunk);
  try {
    return JSON.parse(text);
  } catch (e) {
    try {
      const base64Match = text.match(/:"([A-Za-z0-9+/=]+)"/);
      if (base64Match) {
        const decoded = Buffer.from(base64Match[1], "base64").toString("utf-8");
        return JSON.parse(decoded);
      }
      const eventMatch = text.match(/:event-type[^\{]+({.*})/);
      if (eventMatch) {
        return JSON.parse(eventMatch[1]);
      }
    } catch (innerError) {}
  }
  return null;
}

async function* transformBedrockStream(stream: ReadableStream) {
  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const parsed = parseEventData(value);
      if (parsed) {
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
  } else if (modelId.startsWith("meta.llama")) {
    if (!body.prompt) throw new Error("Llama requires a prompt");
  } else if (modelId.startsWith("mistral.mistral")) {
    if (!Array.isArray(body.messages))
      throw new Error("Mistral requires a messages array");
  } else if (modelId.startsWith("amazon.titan")) {
    if (!body.inputText) throw new Error("Titan requires inputText");
  }
}

async function requestBedrock(req: NextRequest) {
  const controller = new AbortController();
  const awsRegion = req.headers.get("X-Region") ?? "";
  const awsAccessKey = req.headers.get("X-Access-Key") ?? "";
  const awsSecretKey = req.headers.get("X-Secret-Key") ?? "";
  const awsSessionToken = req.headers.get("X-Session-Token");
  const modelId = req.headers.get("X-Model-Id") ?? "";

  if (!awsRegion || !awsAccessKey || !awsSecretKey || !modelId) {
    throw new Error("Missing required AWS credentials or model ID");
  }

  const decryptedAccessKey = decrypt(awsAccessKey);
  const decryptedSecretKey = decrypt(awsSecretKey);
  const decryptedSessionToken = awsSessionToken
    ? decrypt(awsSessionToken)
    : undefined;

  if (!decryptedAccessKey || !decryptedSecretKey) {
    throw new Error("Failed to decrypt AWS credentials");
  }

  const endpoint = `https://bedrock-runtime.${awsRegion}.amazonaws.com/model/${modelId}/invoke-with-response-stream`;
  const timeoutId = setTimeout(() => controller.abort(), 10 * 60 * 1000);

  try {
    const bodyText = await req.clone().text();
    const bodyJson = JSON.parse(bodyText);
    validateRequest(bodyJson, modelId);
    const canonicalBody = JSON.stringify(bodyJson);

    const headers = await sign({
      method: "POST",
      url: endpoint,
      region: awsRegion,
      accessKeyId: decryptedAccessKey,
      secretAccessKey: decryptedSecretKey,
      sessionToken: decryptedSessionToken,
      body: canonicalBody,
      service: "bedrock",
    });

    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: canonicalBody,
      redirect: "manual",
      // @ts-ignore
      duplex: "half",
      signal: controller.signal,
    });

    if (!res.ok) {
      const error = await res.text();
      try {
        const errorJson = JSON.parse(error);
        throw new Error(errorJson.message || error);
      } catch {
        throw new Error(error);
      }
    }

    const transformedStream = transformBedrockStream(res.body!);
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of transformedStream) {
            controller.enqueue(new TextEncoder().encode(chunk));
          }
          controller.close();
        } catch (err) {
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

  try {
    return await requestBedrock(req);
  } catch (e) {
    return NextResponse.json(
      { error: true, msg: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}
