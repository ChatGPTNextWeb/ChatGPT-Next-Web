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
  media_type?: string; // MIME type of the document
}

export type DocumentFormat =
  | "pdf"
  | "csv"
  | "doc"
  | "docx"
  | "xls"
  | "xlsx"
  | "html"
  | "txt"
  | "md";
export type ImageFormat = "png" | "jpeg" | "gif" | "webp";

export interface BedrockImageBlock {
  type: "image";
  image: {
    format: ImageFormat;
    source: {
      bytes: string;
    };
  };
}

export interface BedrockDocumentBlock {
  type: "document";
  document: {
    format: string;
    name: string;
    source: {
      bytes: string;
      media_type?: string;
    };
  };
}

export interface BedrockTextBlock {
  type: "text";
  text: string;
}

export interface BedrockToolCallBlock {
  type: "tool_calls";
  tool_calls: BedrockToolCall[];
}

export interface BedrockToolResultBlock {
  type: "tool_result";
  tool_result: BedrockToolResult;
}

export type BedrockContent =
  | BedrockTextBlock
  | BedrockImageBlock
  | BedrockDocumentBlock
  | BedrockToolCallBlock
  | BedrockToolResultBlock;

export interface BedrockToolSpec {
  type: string;
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
}

export interface BedrockToolCall {
  type: string;
  function: {
    name: string;
    arguments: string;
  };
}

export interface BedrockToolResult {
  type: string;
  output: string;
}

export interface ContentItem {
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
      media_type?: string;
    };
  };
  tool_calls?: BedrockToolCall[];
  tool_result?: BedrockToolResult;
}

export interface StreamEvent {
  messageStart?: { role: string };
  contentBlockStart?: { index: number };
  contentBlockDelta?: {
    delta: {
      type?: string;
      text?: string;
      tool_calls?: BedrockToolCall[];
      tool_result?: BedrockToolResult;
    };
    contentBlockIndex: number;
  };
  contentBlockStop?: { index: number };
  messageStop?: { stopReason: string };
  metadata?: {
    usage: {
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
    };
    metrics: {
      latencyMs: number;
    };
  };
}

export interface ConverseRequest {
  modelId: string;
  messages: Message[];
  inferenceConfig?: {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    stopSequences?: string[];
    stream?: boolean;
  };
  system?: { text: string }[];
  tools?: BedrockToolSpec[];
  additionalModelRequestFields?: Record<string, any>;
  additionalModelResponseFieldPaths?: string[];
}

export interface BedrockResponse {
  content: BedrockContent[];
  completion?: string;
  stop_reason?: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
  tool_calls?: BedrockToolCall[];
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

// Helper function to validate document name
export function validateDocumentName(name: string): boolean {
  const validPattern = /^[a-zA-Z0-9\s\-\(\)\[\]]+$/;
  const noMultipleSpaces = !/\s{2,}/.test(name);
  return validPattern.test(name) && noMultipleSpaces;
}

// Helper function to validate document format
export function validateDocumentFormat(
  format: string,
): format is DocumentFormat {
  const validFormats: DocumentFormat[] = [
    "pdf",
    "csv",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "html",
    "txt",
    "md",
  ];
  return validFormats.includes(format as DocumentFormat);
}

// Helper function to validate image size and dimensions
export function validateImageSize(base64Data: string): boolean {
  // Check size (3.75 MB limit)
  const sizeInBytes = (base64Data.length * 3) / 4; // Approximate size of decoded base64
  const maxSize = 3.75 * 1024 * 1024; // 3.75 MB in bytes

  if (sizeInBytes > maxSize) {
    throw new Error("Image size exceeds 3.75 MB limit");
  }

  return true;
}

// Helper function to validate document size
export function validateDocumentSize(base64Data: string): boolean {
  // Check size (4.5 MB limit)
  const sizeInBytes = (base64Data.length * 3) / 4; // Approximate size of decoded base64
  const maxSize = 4.5 * 1024 * 1024; // 4.5 MB in bytes

  if (sizeInBytes > maxSize) {
    throw new Error("Document size exceeds 4.5 MB limit");
  }

  return true;
}

// Helper function to process document content for Bedrock
export function processDocumentContent(content: any): BedrockDocumentBlock {
  if (
    !content?.document?.format ||
    !content?.document?.name ||
    !content?.document?.source?.bytes
  ) {
    throw new Error("Invalid document content format");
  }

  const format = content.document.format.toLowerCase();
  if (!validateDocumentFormat(format)) {
    throw new Error(`Unsupported document format: ${format}`);
  }

  if (!validateDocumentName(content.document.name)) {
    throw new Error(
      `Invalid document name: ${content.document.name}. Only alphanumeric characters, single spaces, hyphens, parentheses, and square brackets are allowed.`,
    );
  }

  // Validate document size
  if (!validateDocumentSize(content.document.source.bytes)) {
    throw new Error("Document size validation failed");
  }

  return {
    type: "document",
    document: {
      format: format,
      name: content.document.name,
      source: {
        bytes: content.document.source.bytes,
        media_type: content.document.source.media_type,
      },
    },
  };
}

// Helper function to process image content for Bedrock
export function processImageContent(content: any): BedrockImageBlock {
  if (content.type === "image_url" && content.image_url?.url) {
    const base64Match = content.image_url.url.match(
      /^data:image\/([a-zA-Z]*);base64,([^"]*)$/,
    );
    if (base64Match) {
      const format = base64Match[1].toLowerCase();
      if (["png", "jpeg", "gif", "webp"].includes(format)) {
        // Validate image size
        if (!validateImageSize(base64Match[2])) {
          throw new Error("Image size validation failed");
        }

        return {
          type: "image",
          image: {
            format: format as ImageFormat,
            source: {
              bytes: base64Match[2],
            },
          },
        };
      }
    }
  }
  throw new Error("Invalid image content format");
}

// Helper function to validate message content restrictions
export function validateMessageContent(message: Message): void {
  if (Array.isArray(message.content)) {
    // Count images and documents in user messages
    if (message.role === "user") {
      const imageCount = message.content.filter(
        (item) => item.type === "image_url",
      ).length;
      const documentCount = message.content.filter(
        (item) => item.type === "document",
      ).length;

      if (imageCount > 20) {
        throw new Error("User messages can include up to 20 images");
      }

      if (documentCount > 5) {
        throw new Error("User messages can include up to 5 documents");
      }
    } else if (
      message.role === "assistant" &&
      (message.content.some((item) => item.type === "image_url") ||
        message.content.some((item) => item.type === "document"))
    ) {
      throw new Error("Assistant messages cannot include images or documents");
    }
  }
}

// Helper function to ensure messages alternate between user and assistant
export function validateMessageOrder(messages: Message[]): Message[] {
  const validatedMessages: Message[] = [];
  let lastRole = "";

  for (const message of messages) {
    // Validate content restrictions for each message
    validateMessageContent(message);

    if (message.role === lastRole) {
      // Skip duplicate roles to maintain alternation
      continue;
    }
    validatedMessages.push(message);
    lastRole = message.role;
  }

  return validatedMessages;
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
    if (block.type === "text") {
      return {
        type: "text",
        text: block.text,
      };
    } else if (block.type === "image") {
      return {
        type: "image_url",
        image_url: {
          url: `data:image/${block.image.format};base64,${block.image.source.bytes}`,
        },
      };
    } else if (block.type === "document") {
      return {
        type: "document",
        document: {
          format: block.document.format,
          name: block.document.name,
          source: {
            bytes: block.document.source.bytes,
            media_type: block.document.source.media_type,
          },
        },
      };
    }
    // Fallback to text content
    return {
      type: "text",
      text: "",
    };
  });
}
