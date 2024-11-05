import { getServerSideConfig } from "../config/server";
import { prettyObject } from "../utils/format";
import { NextRequest, NextResponse } from "next/server";
import {
  BedrockRuntimeClient,
  ConverseStreamCommand,
  ConverseStreamCommandInput,
  Message,
  ContentBlock,
  ConverseStreamOutput,
} from "@aws-sdk/client-bedrock-runtime";

const ALLOWED_PATH = new Set(["converse"]);

function decrypt(str: string): string {
  try {
    return Buffer.from(str, "base64").toString().split("").reverse().join("");
  } catch {
    return "";
  }
}

export interface ConverseRequest {
  modelId: string;
  messages: {
    role: "user" | "assistant" | "system";
    content: string | any[];
  }[];
  inferenceConfig?: {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    stopSequences?: string[];
  };
}

function formatRequestBody(
  request: ConverseRequest,
): ConverseStreamCommandInput {
  const messages: Message[] = request.messages.map((msg) => ({
    role: msg.role === "system" ? "user" : msg.role,
    content: Array.isArray(msg.content)
      ? msg.content.map((item) => {
          if (item.type === "tool_use") {
            return {
              toolUse: {
                toolUseId: item.id,
                name: item.name,
                input: item.input || "{}",
              },
            } as ContentBlock;
          }
          if (item.type === "tool_result") {
            return {
              toolResult: {
                toolUseId: item.tool_use_id,
                content: [{ text: item.content || ";" }],
                status: "success",
              },
            } as ContentBlock;
          }
          if (item.type === "text") {
            return { text: item.text || ";" } as ContentBlock;
          }
          if (item.type === "image") {
            return {
              image: {
                format: item.source.media_type.split("/")[1] as
                  | "png"
                  | "jpeg"
                  | "gif"
                  | "webp",
                source: {
                  bytes: Uint8Array.from(
                    Buffer.from(item.source.data, "base64"),
                  ),
                },
              },
            } as ContentBlock;
          }
          return { text: ";" } as ContentBlock;
        })
      : [{ text: msg.content || ";" } as ContentBlock],
  }));

  return {
    modelId: request.modelId,
    messages,
    ...(request.inferenceConfig && {
      inferenceConfig: request.inferenceConfig,
    }),
  };
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
      { error: true, msg: "Path not allowed: " + subpath },
      { status: 403 },
    );
  }

  const serverConfig = getServerSideConfig();
  let region = serverConfig.awsRegion;
  let accessKeyId = serverConfig.awsAccessKey;
  let secretAccessKey = serverConfig.awsSecretKey;
  let sessionToken = undefined;

  if (!region || !accessKeyId || !secretAccessKey) {
    region = decrypt(req.headers.get("X-Region") ?? "");
    accessKeyId = decrypt(req.headers.get("X-Access-Key") ?? "");
    secretAccessKey = decrypt(req.headers.get("X-Secret-Key") ?? "");
    sessionToken = req.headers.get("X-Session-Token")
      ? decrypt(req.headers.get("X-Session-Token") ?? "")
      : undefined;
  }

  if (!region || !accessKeyId || !secretAccessKey) {
    return NextResponse.json(
      { error: true, msg: "Missing AWS credentials" },
      { status: 401 },
    );
  }

  try {
    const client = new BedrockRuntimeClient({
      region,
      credentials: { accessKeyId, secretAccessKey, sessionToken },
    });

    const body = (await req.json()) as ConverseRequest;
    console.log("[Bedrock] Request:", body.modelId);

    const command = new ConverseStreamCommand(formatRequestBody(body));
    const response = await client.send(command);

    if (!response.stream) {
      throw new Error("No stream in response");
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const responseStream =
            response.stream as AsyncIterable<ConverseStreamOutput>;
          for await (const event of responseStream) {
            if (
              "contentBlockStart" in event &&
              event.contentBlockStart?.start?.toolUse &&
              event.contentBlockStart.contentBlockIndex !== undefined
            ) {
              controller.enqueue(
                `data: ${JSON.stringify({
                  type: "content_block",
                  content_block: {
                    type: "tool_use",
                    id: event.contentBlockStart.start.toolUse.toolUseId,
                    name: event.contentBlockStart.start.toolUse.name,
                  },
                  index: event.contentBlockStart.contentBlockIndex,
                })}\n\n`,
              );
            } else if (
              "contentBlockDelta" in event &&
              event.contentBlockDelta?.delta &&
              event.contentBlockDelta.contentBlockIndex !== undefined
            ) {
              const delta = event.contentBlockDelta.delta;

              if ("text" in delta && delta.text) {
                controller.enqueue(
                  `data: ${JSON.stringify({
                    type: "content_block_delta",
                    delta: {
                      type: "text_delta",
                      text: delta.text,
                    },
                    index: event.contentBlockDelta.contentBlockIndex,
                  })}\n\n`,
                );
              } else if ("toolUse" in delta && delta.toolUse?.input) {
                controller.enqueue(
                  `data: ${JSON.stringify({
                    type: "content_block_delta",
                    delta: {
                      type: "input_json_delta",
                      partial_json: delta.toolUse.input,
                    },
                    index: event.contentBlockDelta.contentBlockIndex,
                  })}\n\n`,
                );
              }
            } else if (
              "contentBlockStop" in event &&
              event.contentBlockStop?.contentBlockIndex !== undefined
            ) {
              controller.enqueue(
                `data: ${JSON.stringify({
                  type: "content_block_stop",
                  index: event.contentBlockStop.contentBlockIndex,
                })}\n\n`,
              );
            }
          }
          controller.close();
        } catch (error) {
          console.error("[Bedrock] Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    console.error("[Bedrock] Error:", e);
    return NextResponse.json(
      {
        error: true,
        message: e instanceof Error ? e.message : "Unknown error",
        details: prettyObject(e),
      },
      { status: 500 },
    );
  }
}
