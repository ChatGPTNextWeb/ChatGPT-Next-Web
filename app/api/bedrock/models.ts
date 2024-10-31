import {
  ConverseStreamCommand,
  type ConverseStreamCommandInput,
  type Message,
  type ContentBlock,
  type SystemContentBlock,
  type Tool,
  type ToolChoice,
  type ToolResultContentBlock,
} from "@aws-sdk/client-bedrock-runtime";

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
    format:
      | "pdf"
      | "csv"
      | "doc"
      | "docx"
      | "xls"
      | "xlsx"
      | "html"
      | "txt"
      | "md";
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
    format:
      | "pdf"
      | "csv"
      | "doc"
      | "docx"
      | "xls"
      | "xlsx"
      | "html"
      | "txt"
      | "md";
    name: string;
    source: {
      bytes: string; // base64
    };
  };
  json?: any;
}

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
      if (
        format === "png" ||
        format === "jpeg" ||
        format === "gif" ||
        format === "webp"
      ) {
        const base64Data = base64Match[2];
        return {
          image: {
            format: format as "png" | "jpeg" | "gif" | "webp",
            source: {
              bytes: Uint8Array.from(Buffer.from(base64Data, "base64")),
            },
          },
        };
      }
    }
  }

  if (item.type === "document" && item.document) {
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

  // Filter out null blocks and ensure each content block is valid
  const blocks = content
    .map(convertContentToAWSBlock)
    .filter((block): block is ContentBlock => block !== null);

  // If no valid blocks, provide a default text block
  if (blocks.length === 0) {
    return [{ text: "" }];
  }

  return blocks;
}

function formatMessages(messages: ConverseRequest["messages"]): {
  messages: Message[];
  systemPrompt?: SystemContentBlock[];
} {
  // Extract system messages
  const systemMessages = messages.filter((msg) => msg.role === "system");
  const nonSystemMessages = messages.filter((msg) => msg.role !== "system");

  // Convert system messages to SystemContentBlock array
  const systemPrompt =
    systemMessages.length > 0
      ? systemMessages.map((msg) => {
          if (typeof msg.content === "string") {
            return { text: msg.content } as SystemContentBlock;
          }
          // For multimodal content, convert each content item
          const blocks = convertContentToAWS(msg.content);
          return blocks[0] as SystemContentBlock; // Take first block as system content
        })
      : undefined;

  // Format remaining messages
  const formattedMessages = nonSystemMessages.reduce(
    (acc: Message[], curr, idx) => {
      // Skip if same role as previous message
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

  // Ensure conversation starts with user
  if (formattedMessages.length === 0 || formattedMessages[0].role !== "user") {
    formattedMessages.unshift({
      role: "user",
      content: [{ text: "Hello" }],
    });
  }

  // Ensure conversation ends with user
  if (formattedMessages[formattedMessages.length - 1].role !== "user") {
    formattedMessages.push({
      role: "user",
      content: [{ text: "Continue" }],
    });
  }

  return { messages: formattedMessages, systemPrompt };
}

export function formatRequestBody(
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

  // Create a clean version of the input for logging
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

export function createConverseStreamCommand(request: ConverseRequest) {
  const input = formatRequestBody(request);
  return new ConverseStreamCommand(input);
}

export interface StreamResponse {
  type:
    | "messageStart"
    | "contentBlockStart"
    | "contentBlockDelta"
    | "contentBlockStop"
    | "messageStop"
    | "metadata"
    | "error";
  role?: string;
  index?: number;
  start?: any;
  delta?: any;
  stopReason?: string;
  additionalModelResponseFields?: any;
  usage?: any;
  metrics?: any;
  trace?: any;
  error?: string;
  message?: string;
  originalStatusCode?: number;
  originalMessage?: string;
}

export function parseStreamResponse(chunk: any): StreamResponse | null {
  if (chunk.messageStart) {
    return { type: "messageStart", role: chunk.messageStart.role };
  }
  if (chunk.contentBlockStart) {
    return {
      type: "contentBlockStart",
      index: chunk.contentBlockStart.contentBlockIndex,
      start: chunk.contentBlockStart.start,
    };
  }
  if (chunk.contentBlockDelta) {
    return {
      type: "contentBlockDelta",
      index: chunk.contentBlockDelta.contentBlockIndex,
      delta: chunk.contentBlockDelta.delta,
    };
  }
  if (chunk.contentBlockStop) {
    return {
      type: "contentBlockStop",
      index: chunk.contentBlockStop.contentBlockIndex,
    };
  }
  if (chunk.messageStop) {
    return {
      type: "messageStop",
      stopReason: chunk.messageStop.stopReason,
      additionalModelResponseFields:
        chunk.messageStop.additionalModelResponseFields,
    };
  }
  if (chunk.metadata) {
    return {
      type: "metadata",
      usage: chunk.metadata.usage,
      metrics: chunk.metadata.metrics,
      trace: chunk.metadata.trace,
    };
  }
  return null;
}
