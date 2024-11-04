import { ModelProvider } from "../constant";
import { prettyObject } from "../utils/format";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
import {
  BedrockRuntimeClient,
  ConverseStreamCommand,
  ConverseStreamCommandInput,
  ConverseStreamOutput,
  ModelStreamErrorException,
  type Message,
  type ContentBlock,
  type SystemContentBlock,
  type Tool,
  type ToolChoice,
  type ToolResultContentBlock,
} from "@aws-sdk/client-bedrock-runtime";

// Constants and Types
const ALLOWED_PATH = new Set(["converse"]);

export interface ConverseRequest {
  modelId: string;
  messages: {
    role: "user" | "assistant" | "system";
    content: string | ContentItem[];
  }[];
  inferenceConfig?: {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    stopSequences?: string[];
  };
  toolConfig?: {
    tools: Tool[];
    toolChoice?: ToolChoice;
  };
}

interface ContentItem {
  type: "text" | "image_url" | "document" | "tool_use" | "tool_result";
  text?: string;
  image_url?: {
    url: string; // base64 data URL
  };
  document?: {
    format: DocumentFormat;
    name: string;
    source: {
      bytes: string; // base64
    };
  };
  tool_use?: {
    tool_use_id: string;
    name: string;
    input: any;
  };
  tool_result?: {
    tool_use_id: string;
    content: ToolResultItem[];
    status: "success" | "error";
  };
}

interface ToolResultItem {
  type: "text" | "image" | "document" | "json";
  text?: string;
  image?: {
    format: "png" | "jpeg" | "gif" | "webp";
    source: {
      bytes: string; // base64
    };
  };
  document?: {
    format: DocumentFormat;
    name: string;
    source: {
      bytes: string; // base64
    };
  };
  json?: any;
}

type DocumentFormat =
  | "pdf"
  | "csv"
  | "doc"
  | "docx"
  | "xls"
  | "xlsx"
  | "html"
  | "txt"
  | "md";

// Validation Functions
function validateModelId(modelId: string): string | null {
  if (
    modelId.startsWith("meta.llama") &&
    !modelId.includes("inference-profile")
  ) {
    return "Llama models require an inference profile. Please use the full inference profile ARN.";
  }
  return null;
}

function validateDocumentSize(base64Data: string): boolean {
  const sizeInBytes = (base64Data.length * 3) / 4;
  const maxSize = 4.5 * 1024 * 1024;
  if (sizeInBytes > maxSize) {
    throw new Error("Document size exceeds 4.5 MB limit");
  }
  return true;
}

function validateImageSize(base64Data: string): boolean {
  const sizeInBytes = (base64Data.length * 3) / 4;
  const maxSize = 3.75 * 1024 * 1024;
  if (sizeInBytes > maxSize) {
    throw new Error("Image size exceeds 3.75 MB limit");
  }
  return true;
}

// Content Processing Functions
function convertContentToAWSBlock(item: ContentItem): ContentBlock | null {
  if (item.type === "text" && item.text) {
    return { text: item.text };
  }

  if (item.type === "image_url" && item.image_url?.url) {
    const base64Match = item.image_url.url.match(
      /^data:image\/([a-zA-Z]*);base64,([^"]*)/,
    );
    if (base64Match) {
      const format = base64Match[1].toLowerCase();
      if (["png", "jpeg", "gif", "webp"].includes(format)) {
        validateImageSize(base64Match[2]);
        return {
          image: {
            format: format as "png" | "jpeg" | "gif" | "webp",
            source: {
              bytes: Uint8Array.from(Buffer.from(base64Match[2], "base64")),
            },
          },
        };
      }
    }
  }

  if (item.type === "document" && item.document) {
    validateDocumentSize(item.document.source.bytes);
    return {
      document: {
        format: item.document.format,
        name: item.document.name,
        source: {
          bytes: Uint8Array.from(
            Buffer.from(item.document.source.bytes, "base64"),
          ),
        },
      },
    };
  }

  if (item.type === "tool_use" && item.tool_use) {
    return {
      toolUse: {
        toolUseId: item.tool_use.tool_use_id,
        name: item.tool_use.name,
        input: item.tool_use.input,
      },
    };
  }

  if (item.type === "tool_result" && item.tool_result) {
    const toolResultContent = item.tool_result.content
      .map((resultItem) => {
        if (resultItem.type === "text" && resultItem.text) {
          return { text: resultItem.text } as ToolResultContentBlock;
        }
        if (resultItem.type === "image" && resultItem.image) {
          return {
            image: {
              format: resultItem.image.format,
              source: {
                bytes: Uint8Array.from(
                  Buffer.from(resultItem.image.source.bytes, "base64"),
                ),
              },
            },
          } as ToolResultContentBlock;
        }
        if (resultItem.type === "document" && resultItem.document) {
          return {
            document: {
              format: resultItem.document.format,
              name: resultItem.document.name,
              source: {
                bytes: Uint8Array.from(
                  Buffer.from(resultItem.document.source.bytes, "base64"),
                ),
              },
            },
          } as ToolResultContentBlock;
        }
        if (resultItem.type === "json" && resultItem.json) {
          return { json: resultItem.json } as ToolResultContentBlock;
        }
        return null;
      })
      .filter((content): content is ToolResultContentBlock => content !== null);

    if (toolResultContent.length === 0) {
      return null;
    }

    return {
      toolResult: {
        toolUseId: item.tool_result.tool_use_id,
        content: toolResultContent,
        status: item.tool_result.status,
      },
    };
  }

  return null;
}

function convertContentToAWS(content: string | ContentItem[]): ContentBlock[] {
  if (typeof content === "string") {
    return [{ text: content }];
  }

  const blocks = content
    .map(convertContentToAWSBlock)
    .filter((block): block is ContentBlock => block !== null);

  return blocks.length > 0 ? blocks : [{ text: "" }];
}

function formatMessages(messages: ConverseRequest["messages"]): {
  messages: Message[];
  systemPrompt?: SystemContentBlock[];
} {
  const systemMessages = messages.filter((msg) => msg.role === "system");
  const nonSystemMessages = messages.filter((msg) => msg.role !== "system");

  const systemPrompt =
    systemMessages.length > 0
      ? systemMessages.map((msg) => {
          if (typeof msg.content === "string") {
            return { text: msg.content } as SystemContentBlock;
          }
          const blocks = convertContentToAWS(msg.content);
          return blocks[0] as SystemContentBlock;
        })
      : undefined;

  const formattedMessages = nonSystemMessages.reduce(
    (acc: Message[], curr, idx) => {
      if (idx > 0 && curr.role === nonSystemMessages[idx - 1].role) {
        return acc;
      }

      const content = convertContentToAWS(curr.content);
      if (content.length > 0) {
        acc.push({
          role: curr.role as "user" | "assistant",
          content,
        });
      }
      return acc;
    },
    [],
  );

  if (formattedMessages.length === 0 || formattedMessages[0].role !== "user") {
    formattedMessages.unshift({
      role: "user",
      content: [{ text: "Hello" }],
    });
  }

  if (formattedMessages[formattedMessages.length - 1].role !== "user") {
    formattedMessages.push({
      role: "user",
      content: [{ text: "Continue" }],
    });
  }

  return { messages: formattedMessages, systemPrompt };
}

function formatRequestBody(
  request: ConverseRequest,
): ConverseStreamCommandInput {
  const { messages, systemPrompt } = formatMessages(request.messages);
  const input: ConverseStreamCommandInput = {
    modelId: request.modelId,
    messages,
    ...(systemPrompt && { system: systemPrompt }),
  };

  if (request.inferenceConfig) {
    input.inferenceConfig = {
      maxTokens: request.inferenceConfig.maxTokens,
      temperature: request.inferenceConfig.temperature,
      topP: request.inferenceConfig.topP,
      stopSequences: request.inferenceConfig.stopSequences,
    };
  }

  if (request.toolConfig) {
    input.toolConfig = {
      tools: request.toolConfig.tools,
      toolChoice: request.toolConfig.toolChoice,
    };
  }

  const logInput = {
    ...input,
    messages: messages.map((msg) => ({
      role: msg.role,
      content: msg.content?.map((content) => {
        if ("image" in content && content.image) {
          return {
            image: {
              format: content.image.format,
              source: { bytes: "[BINARY]" },
            },
          };
        }
        if ("document" in content && content.document) {
          return {
            document: { ...content.document, source: { bytes: "[BINARY]" } },
          };
        }
        return content;
      }),
    })),
  };

  console.log(
    "[Bedrock] Formatted request:",
    JSON.stringify(logInput, null, 2),
  );
  return input;
}

// Main Request Handler
export async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  console.log("[Bedrock Route] params ", params);

  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }

  const subpath = params.path.join("/");

  if (!ALLOWED_PATH.has(subpath)) {
    console.log("[Bedrock Route] forbidden path ", subpath);
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

  const authResult = auth(req, ModelProvider.Bedrock);
  if (authResult.error) {
    return NextResponse.json(authResult, {
      status: 401,
    });
  }

  try {
    const response = await handleConverseRequest(req);
    return response;
  } catch (e) {
    console.error("[Bedrock] ", e);
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

async function handleConverseRequest(req: NextRequest) {
  const region = req.headers.get("X-Region") || "us-west-2";
  const accessKeyId = req.headers.get("X-Access-Key") || "";
  const secretAccessKey = req.headers.get("X-Secret-Key") || "";
  const sessionToken = req.headers.get("X-Session-Token");

  if (!accessKeyId || !secretAccessKey) {
    return NextResponse.json(
      {
        error: true,
        message: "Missing AWS credentials",
      },
      {
        status: 401,
      },
    );
  }

  const client = new BedrockRuntimeClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
      sessionToken: sessionToken || undefined,
    },
  });

  try {
    const body = (await req.json()) as ConverseRequest;
    const { modelId } = body;

    const validationError = validateModelId(modelId);
    if (validationError) {
      throw new Error(validationError);
    }

    console.log("[Bedrock] Invoking model:", modelId);

    const command = new ConverseStreamCommand(formatRequestBody(body));
    const response = await client.send(command);

    if (!response.stream) {
      throw new Error("No stream in response");
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const responseStream = response.stream;
          if (!responseStream) {
            throw new Error("No stream in response");
          }

          for await (const event of responseStream) {
            const output = event as ConverseStreamOutput;

            if ("messageStart" in output && output.messageStart?.role) {
              controller.enqueue(
                `data: ${JSON.stringify({
                  type: "messageStart",
                  role: output.messageStart.role,
                })}\n\n`,
              );
            } else if (
              "contentBlockStart" in output &&
              output.contentBlockStart
            ) {
              controller.enqueue(
                `data: ${JSON.stringify({
                  type: "contentBlockStart",
                  index: output.contentBlockStart.contentBlockIndex,
                  start: output.contentBlockStart.start,
                })}\n\n`,
              );
            } else if (
              "contentBlockDelta" in output &&
              output.contentBlockDelta?.delta
            ) {
              if ("text" in output.contentBlockDelta.delta) {
                controller.enqueue(
                  `data: ${JSON.stringify({
                    type: "text",
                    content: output.contentBlockDelta.delta.text,
                  })}\n\n`,
                );
              } else if ("toolUse" in output.contentBlockDelta.delta) {
                controller.enqueue(
                  `data: ${JSON.stringify({
                    type: "toolUse",
                    input: output.contentBlockDelta.delta.toolUse?.input,
                  })}\n\n`,
                );
              }
            } else if (
              "contentBlockStop" in output &&
              output.contentBlockStop
            ) {
              controller.enqueue(
                `data: ${JSON.stringify({
                  type: "contentBlockStop",
                  index: output.contentBlockStop.contentBlockIndex,
                })}\n\n`,
              );
            } else if ("messageStop" in output && output.messageStop) {
              controller.enqueue(
                `data: ${JSON.stringify({
                  type: "messageStop",
                  stopReason: output.messageStop.stopReason,
                  additionalModelResponseFields:
                    output.messageStop.additionalModelResponseFields,
                })}\n\n`,
              );
            } else if ("metadata" in output && output.metadata) {
              controller.enqueue(
                `data: ${JSON.stringify({
                  type: "metadata",
                  usage: output.metadata.usage,
                  metrics: output.metadata.metrics,
                  trace: output.metadata.trace,
                })}\n\n`,
              );
            }
          }
          controller.close();
        } catch (error) {
          const errorResponse = {
            type: "error",
            error:
              error instanceof Error ? error.constructor.name : "UnknownError",
            message: error instanceof Error ? error.message : "Unknown error",
            ...(error instanceof ModelStreamErrorException && {
              originalStatusCode: error.originalStatusCode,
              originalMessage: error.originalMessage,
            }),
          };
          controller.enqueue(`data: ${JSON.stringify(errorResponse)}\n\n`);
          controller.close();
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
  } catch (error) {
    console.error("[Bedrock] Request error:", error);
    throw error;
  }
}
