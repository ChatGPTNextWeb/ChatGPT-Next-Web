import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
import {
  sign,
  decrypt,
  getBedrockEndpoint,
  transformBedrockStream,
  parseEventData,
  BedrockCredentials,
} from "../utils/aws";
import { getServerSideConfig } from "../config/server";
import { ModelProvider } from "../constant";
import { prettyObject } from "../utils/format";

const ALLOWED_PATH = new Set(["chat", "models"]);

async function getBedrockCredentials(
  req: NextRequest,
): Promise<BedrockCredentials> {
  // Get AWS credentials from server config first
  const config = getServerSideConfig();
  let awsRegion = config.awsRegion;
  let awsAccessKey = config.awsAccessKey;
  let awsSecretKey = config.awsSecretKey;

  // If server-side credentials are not available, parse from Authorization header
  if (!awsRegion || !awsAccessKey || !awsSecretKey) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Missing or invalid Authorization header");
    }

    const [_, credentials] = authHeader.split("Bearer ");
    const [encryptedRegion, encryptedAccessKey, encryptedSecretKey] =
      credentials.split(":");

    if (!encryptedRegion || !encryptedAccessKey || !encryptedSecretKey) {
      throw new Error("Invalid Authorization header format");
    }
    const encryptionKey = req.headers.get("XEncryptionKey") || "";
    // Decrypt the credentials
    awsRegion = decrypt(encryptedRegion, encryptionKey);
    awsAccessKey = decrypt(encryptedAccessKey, encryptionKey);
    awsSecretKey = decrypt(encryptedSecretKey, encryptionKey);

    if (!awsRegion || !awsAccessKey || !awsSecretKey) {
      throw new Error(
        "Failed to decrypt AWS credentials. Please ensure ENCRYPTION_KEY is set correctly.",
      );
    }
  }

  return {
    region: awsRegion,
    accessKeyId: awsAccessKey,
    secretAccessKey: awsSecretKey,
  };
}

async function requestBedrock(req: NextRequest) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10 * 60 * 1000);

  try {
    // Get credentials and model info
    const credentials = await getBedrockCredentials(req);
    const modelId = req.headers.get("XModelID");
    const shouldStream = req.headers.get("ShouldStream") !== "false";

    if (!modelId) {
      throw new Error("Missing model ID");
    }

    // Parse and validate request body
    const bodyText = await req.clone().text();
    if (!bodyText) {
      throw new Error("Request body is empty");
    }
    let bodyJson;
    try {
      bodyJson = JSON.parse(bodyText);
    } catch (e) {
      throw new Error(`Invalid JSON in request body: ${e}`);
    }
    // console.log(
    //   "[Bedrock Request] original Body:",
    //   JSON.stringify(bodyJson, null, 2),
    // );

    // Extract tool configuration if present
    let tools: any[] | undefined;
    if (bodyJson.tools) {
      tools = bodyJson.tools;
      delete bodyJson.tools; // Remove from main request body
    }

    // Get endpoint and prepare request
    const endpoint = getBedrockEndpoint(
      credentials.region,
      modelId,
      shouldStream,
    );

    console.log("[Bedrock Request] Endpoint:", endpoint);
    console.log("[Bedrock Request] Model ID:", modelId);

    // Handle tools for different models
    const isMistralModel = modelId.toLowerCase().includes("mistral");
    const isClaudeModel = modelId.toLowerCase().includes("claude");

    const requestBody = {
      ...bodyJson,
    };

    if (tools && tools.length > 0) {
      if (isClaudeModel) {
        // Claude models already have correct tool format
        requestBody.tools = tools;
      } else if (isMistralModel) {
        // Format messages for Mistral
        if (typeof requestBody.prompt === "string") {
          requestBody.messages = [
            { role: "user", content: requestBody.prompt },
          ];
          delete requestBody.prompt;
        }

        // Add tools in Mistral's format
        requestBody.tool_choice = "auto";
        requestBody.tools = tools.map((tool) => ({
          type: "function",
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.input_schema,
          },
        }));
      }
    }

    // Sign request
    const headers = await sign({
      method: "POST",
      url: endpoint,
      region: credentials.region,
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      body: JSON.stringify(requestBody),
      service: "bedrock",
      isStreaming: shouldStream,
    });

    // Make request to AWS Bedrock
    // console.log(
    //   "[Bedrock Request] Final Body:",
    //   JSON.stringify(requestBody, null, 2),
    // );
    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
      redirect: "manual",
      // @ts-ignore
      duplex: "half",
      signal: controller.signal,
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("[Bedrock Error] Status:", res.status);
      console.error("[Bedrock Error] Response:", error);
      try {
        const errorJson = JSON.parse(error);
        throw new Error(errorJson.message || error);
      } catch {
        throw new Error(
          `Bedrock request failed with status ${res.status}: ${
            error || "No error message"
          }`,
        );
      }
    }

    if (!res.body) {
      console.error("[Bedrock Error] Empty response body");
      throw new Error(
        "Empty response from Bedrock. Please check AWS credentials and permissions.",
      );
    }

    // Handle non-streaming response
    if (!shouldStream) {
      const responseText = await res.text();
      console.log("[Bedrock Response] Non-streaming:", responseText);
      const parsed = parseEventData(new TextEncoder().encode(responseText));
      if (!parsed) {
        throw new Error("Failed to parse Bedrock response");
      }
      return NextResponse.json(parsed);
    }

    // Handle streaming response
    const transformedStream = transformBedrockStream(res.body, modelId);
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of transformedStream) {
            // Ensure we're sending non-empty chunks
            if (chunk && chunk.trim()) {
              controller.enqueue(encoder.encode(chunk));
            }
          }
          controller.close();
        } catch (err) {
          console.error("[Bedrock Stream Error]:", err);
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
    console.error("[Bedrock Request Error]:", e);
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
