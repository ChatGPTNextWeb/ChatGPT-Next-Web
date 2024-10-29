import { MultimodalContent } from "../../client/api";

export interface Message {
  role: string;
  content: string | MultimodalContent[];
}

export interface ImageSource {
  bytes: string; // base64 encoded image bytes
}

export interface DocumentSource {
  bytes: string; // base64 encoded document bytes
}

export interface BedrockImageBlock {
  image: {
    format: "png" | "jpeg" | "gif" | "webp";
    source: ImageSource;
  };
}

export interface BedrockDocumentBlock {
  document: {
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
    source: DocumentSource;
  };
}

export interface BedrockTextBlock {
  text: string;
}

export type BedrockContentBlock =
  | BedrockTextBlock
  | BedrockImageBlock
  | BedrockDocumentBlock;

export interface BedrockResponse {
  content?: any[];
  completion?: string;
  stop_reason?: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
  tool_calls?: any[];
}

// Helper function to get the base model type from modelId
export function getModelType(modelId: string): string {
  if (modelId.includes("inference-profile")) {
    const match = modelId.match(/us\.(meta\.llama.+?)$/);
    if (match) return match[1];
  }
  return modelId;
}

// Helper function to validate model ID
export function validateModelId(modelId: string): string | null {
  // Check if model requires inference profile
  if (
    modelId.startsWith("meta.llama") &&
    !modelId.includes("inference-profile")
  ) {
    return "Llama models require an inference profile. Please use the full inference profile ARN.";
  }
  return null;
}

// Helper function to process document content for Bedrock
export function processDocumentContent(content: any): BedrockContentBlock {
  if (
    !content?.document?.format ||
    !content?.document?.name ||
    !content?.document?.source?.bytes
  ) {
    throw new Error("Invalid document content format");
  }

  const format = content.document.format.toLowerCase();
  if (
    !["pdf", "csv", "doc", "docx", "xls", "xlsx", "html", "txt", "md"].includes(
      format,
    )
  ) {
    throw new Error(`Unsupported document format: ${format}`);
  }

  return {
    document: {
      format: format as BedrockDocumentBlock["document"]["format"],
      name: sanitizeDocumentName(content.document.name),
      source: {
        bytes: content.document.source.bytes,
      },
    },
  };
}

// Helper function to format content for Bedrock
export function formatContent(
  content: string | MultimodalContent[],
): BedrockContentBlock[] {
  if (typeof content === "string") {
    return [{ text: content }];
  }

  const formattedContent: BedrockContentBlock[] = [];

  for (const item of content) {
    if (item.type === "text" && item.text) {
      formattedContent.push({ text: item.text });
    } else if (item.type === "image_url" && item.image_url?.url) {
      // Extract base64 data from data URL
      const base64Match = item.image_url.url.match(
        /^data:image\/([a-zA-Z]*);base64,([^"]*)$/,
      );
      if (base64Match) {
        const format = base64Match[1].toLowerCase();
        if (["png", "jpeg", "gif", "webp"].includes(format)) {
          formattedContent.push({
            image: {
              format: format as "png" | "jpeg" | "gif" | "webp",
              source: {
                bytes: base64Match[2],
              },
            },
          });
        }
      }
    } else if ("document" in item) {
      try {
        formattedContent.push(processDocumentContent(item));
      } catch (error) {
        console.error("Error processing document:", error);
        // Convert document to text as fallback
        formattedContent.push({
          text: `[Document: ${(item as any).document?.name || "Unknown"}]`,
        });
      }
    }
  }

  return formattedContent;
}

// Helper function to ensure messages alternate between user and assistant
export function validateMessageOrder(messages: Message[]): Message[] {
  const validatedMessages: Message[] = [];
  let lastRole = "";

  for (const message of messages) {
    if (message.role === lastRole) {
      // Skip duplicate roles to maintain alternation
      continue;
    }
    validatedMessages.push(message);
    lastRole = message.role;
  }

  return validatedMessages;
}

// Helper function to sanitize document names according to Bedrock requirements
function sanitizeDocumentName(name: string): string {
  // Remove any characters that aren't alphanumeric, whitespace, hyphens, or parentheses
  let sanitized = name.replace(/[^a-zA-Z0-9\s\-\(\)\[\]]/g, "");
  // Replace multiple whitespace characters with a single space
  sanitized = sanitized.replace(/\s+/g, " ");
  // Trim whitespace from start and end
  return sanitized.trim();
}

// Helper function to convert Bedrock response back to MultimodalContent format
export function convertBedrockResponseToMultimodal(
  response: BedrockResponse,
): string | MultimodalContent[] {
  if (response.completion) {
    return response.completion;
  }

  if (!response.content) {
    return "";
  }

  return response.content.map((block) => {
    if ("text" in block) {
      return {
        type: "text",
        text: block.text,
      };
    } else if ("image" in block) {
      return {
        type: "image_url",
        image_url: {
          url: `data:image/${block.image.format};base64,${block.image.source.bytes}`,
        },
      };
    }
    // Document responses are converted to text content
    return {
      type: "text",
      text: block.text || "",
    };
  });
}
