import {
  Message,
  validateMessageOrder,
  processDocumentContent,
  BedrockTextBlock,
  BedrockImageBlock,
  BedrockDocumentBlock,
} from "./utils";

export interface ConverseRequest {
  modelId: string;
  messages: Message[];
  inferenceConfig?: {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
  };
  system?: string;
  tools?: Array<{
    type: "function";
    function: {
      name: string;
      description: string;
      parameters: {
        type: string;
        properties: Record<string, any>;
        required: string[];
      };
    };
  }>;
}

interface ContentItem {
  type: string;
  text?: string;
  image_url?: {
    url: string;
  };
  document?: {
    format: string;
    name: string;
    source: {
      bytes: string;
    };
  };
}

type ProcessedContent =
  | ContentItem
  | BedrockTextBlock
  | BedrockImageBlock
  | BedrockDocumentBlock
  | {
      type: string;
      source: { type: string; media_type: string; data: string };
    };

// Helper function to format request body based on model type
export function formatRequestBody(request: ConverseRequest) {
  const baseModel = request.modelId;
  const messages = validateMessageOrder(request.messages).map((msg) => ({
    role: msg.role,
    content: Array.isArray(msg.content)
      ? msg.content.map((item: ContentItem) => {
          if (item.type === "image_url" && item.image_url?.url) {
            // If it's a base64 image URL
            const base64Match = item.image_url.url.match(
              /^data:image\/([a-zA-Z]*);base64,([^"]*)$/,
            );
            if (base64Match) {
              return {
                type: "image",
                source: {
                  type: "base64",
                  media_type: `image/${base64Match[1]}`,
                  data: base64Match[2],
                },
              };
            }
            // If it's not a base64 URL, return as is
            return item;
          }
          if ("document" in item) {
            try {
              return processDocumentContent(item);
            } catch (error) {
              console.error("Error processing document:", error);
              return {
                type: "text",
                text: `[Document: ${item.document?.name || "Unknown"}]`,
              };
            }
          }
          return { type: "text", text: item.text };
        })
      : [{ type: "text", text: msg.content }],
  }));

  const systemPrompt = request.system
    ? [{ type: "text", text: request.system }]
    : undefined;

  const baseConfig = {
    max_tokens: request.inferenceConfig?.maxTokens || 2048,
    temperature: request.inferenceConfig?.temperature || 0.7,
    top_p: request.inferenceConfig?.topP || 0.9,
  };

  if (baseModel.startsWith("anthropic.claude")) {
    return {
      messages,
      system: systemPrompt,
      anthropic_version: "bedrock-2023-05-31",
      ...baseConfig,
      ...(request.tools && { tools: request.tools }),
    };
  } else if (
    baseModel.startsWith("meta.llama") ||
    baseModel.startsWith("mistral.")
  ) {
    return {
      messages: messages.map((m) => ({
        role: m.role,
        content: Array.isArray(m.content)
          ? m.content.map((c: ProcessedContent) => {
              if ("text" in c) return { type: "text", text: c.text || "" };
              if ("image_url" in c)
                return {
                  type: "text",
                  text: `[Image: ${c.image_url?.url || "URL not provided"}]`,
                };
              if ("document" in c)
                return {
                  type: "text",
                  text: `[Document: ${c.document?.name || "Unknown"}]`,
                };
              return { type: "text", text: "" };
            })
          : [{ type: "text", text: m.content }],
      })),
      ...baseConfig,
      stop_sequences: ["\n\nHuman:", "\n\nAssistant:"],
    };
  } else if (baseModel.startsWith("amazon.titan")) {
    const formattedText = messages.map((m) => ({
      role: m.role,
      content: [
        {
          type: "text",
          text: `${m.role === "user" ? "Human" : "Assistant"}: ${
            Array.isArray(m.content)
              ? m.content
                  .map((c: ProcessedContent) => {
                    if ("text" in c) return c.text || "";
                    if ("image_url" in c)
                      return `[Image: ${
                        c.image_url?.url || "URL not provided"
                      }]`;
                    if ("document" in c)
                      return `[Document: ${c.document?.name || "Unknown"}]`;
                    return "";
                  })
                  .join("")
              : m.content
          }`,
        },
      ],
    }));

    return {
      messages: formattedText,
      textGenerationConfig: {
        maxTokenCount: baseConfig.max_tokens,
        temperature: baseConfig.temperature,
        topP: baseConfig.top_p,
        stopSequences: ["Human:", "Assistant:"],
      },
    };
  }

  throw new Error(`Unsupported model: ${baseModel}`);
}

// Helper function to parse and format response based on model type
export function parseModelResponse(responseBody: string, modelId: string): any {
  const baseModel = modelId;

  try {
    const response = JSON.parse(responseBody);

    // Common response format for all models
    const formatResponse = (content: string | any[]) => ({
      role: "assistant",
      content: Array.isArray(content)
        ? content.map((item) => {
            if (typeof item === "string") {
              return { type: "text", text: item };
            }
            // Handle different content types
            if ("text" in item) {
              return { type: "text", text: item.text || "" };
            }
            if ("image" in item) {
              return {
                type: "image_url",
                image_url: {
                  url: `data:image/${
                    item.source?.media_type || "image/png"
                  };base64,${item.source?.data || ""}`,
                },
              };
            }
            // Document responses are converted to text
            if ("document" in item) {
              return {
                type: "text",
                text: `[Document Content]\n${item.text || ""}`,
              };
            }
            return { type: "text", text: item.text || "" };
          })
        : [{ type: "text", text: content }],
      stop_reason: response.stop_reason || response.stopReason || "end_turn",
      usage: response.usage || {
        input_tokens: 0,
        output_tokens: 0,
        total_tokens: 0,
      },
    });

    if (baseModel.startsWith("anthropic.claude")) {
      // Handle the new Converse API response format
      if (response.output?.message) {
        return {
          role: response.output.message.role,
          content: response.output.message.content.map((item: any) => {
            if ("text" in item) return { type: "text", text: item.text || "" };
            if ("image" in item) {
              return {
                type: "image_url",
                image_url: {
                  url: `data:${item.source?.media_type || "image/png"};base64,${
                    item.source?.data || ""
                  }`,
                },
              };
            }
            return { type: "text", text: item.text || "" };
          }),
          stop_reason: response.stopReason,
          usage: response.usage,
        };
      }
      // Fallback for older format
      return formatResponse(
        response.content ||
          (response.completion
            ? [{ type: "text", text: response.completion }]
            : []),
      );
    } else if (baseModel.startsWith("meta.llama")) {
      return formatResponse(response.generation || response.completion || "");
    } else if (baseModel.startsWith("amazon.titan")) {
      return formatResponse(response.results?.[0]?.outputText || "");
    } else if (baseModel.startsWith("mistral.")) {
      return formatResponse(
        response.outputs?.[0]?.text || response.response || "",
      );
    }

    throw new Error(`Unsupported model: ${baseModel}`);
  } catch (e) {
    console.error("[Bedrock] Failed to parse response:", e);
    // Return raw text as fallback
    return {
      role: "assistant",
      content: [{ type: "text", text: responseBody }],
    };
  }
}
