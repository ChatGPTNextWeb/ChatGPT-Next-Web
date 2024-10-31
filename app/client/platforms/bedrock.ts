import { ApiPath } from "../../constant";
import {
  ChatOptions,
  getHeaders,
  LLMApi,
  LLMUsage,
  MultimodalContent,
  SpeechOptions,
} from "../api";
import { useAccessStore, useAppConfig } from "../../store";
import Locale from "../../locales";
import {
  getMessageImages,
  getMessageTextContent,
  isVisionModel,
} from "../../utils";
import { fetch } from "../../utils/stream";

const MAX_IMAGE_SIZE = 1024 * 1024 * 4; // 4MB limit

export class BedrockApi implements LLMApi {
  speech(options: SpeechOptions): Promise<ArrayBuffer> {
    throw new Error("Speech not implemented for Bedrock.");
  }

  extractMessage(res: any) {
    console.log("[Response] bedrock response: ", res);
    if (Array.isArray(res?.content)) {
      return res.content;
    }
    return res;
  }

  async processDocument(
    file: File,
  ): Promise<{ display: string; content: MultimodalContent }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          const format = file.name.split(".").pop()?.toLowerCase();

          if (!format) {
            throw new Error("Could not determine file format");
          }

          // Format file size
          const size = file.size;
          let sizeStr = "";
          if (size < 1024) {
            sizeStr = size + " B";
          } else if (size < 1024 * 1024) {
            sizeStr = (size / 1024).toFixed(2) + " KB";
          } else {
            sizeStr = (size / (1024 * 1024)).toFixed(2) + " MB";
          }

          // Create display text
          const displayText = `Document: ${file.name} (${sizeStr})`;

          // Create actual content
          const content: MultimodalContent = {
            type: "document",
            document: {
              format: format as
                | "pdf"
                | "csv"
                | "doc"
                | "docx"
                | "xls"
                | "xlsx"
                | "html"
                | "txt"
                | "md",
              name: file.name,
              source: {
                bytes: Buffer.from(arrayBuffer).toString("base64"),
              },
            },
          };

          resolve({
            display: displayText,
            content: content,
          });
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  async processImage(url: string): Promise<MultimodalContent> {
    if (url.startsWith("data:")) {
      const base64Match = url.match(/^data:image\/([a-zA-Z]*);base64,([^"]*)/);
      if (base64Match) {
        const format = base64Match[1].toLowerCase();
        const base64Data = base64Match[2];

        // Check base64 size
        const binarySize = atob(base64Data).length;
        if (binarySize > MAX_IMAGE_SIZE) {
          throw new Error(
            `Image size (${(binarySize / (1024 * 1024)).toFixed(
              2,
            )}MB) exceeds maximum allowed size of 4MB`,
          );
        }

        return {
          type: "image_url",
          image_url: {
            url: url,
          },
        };
      }
      throw new Error("Invalid data URL format");
    }

    // For non-data URLs, fetch and convert to base64
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const blob = await response.blob();
      if (blob.size > MAX_IMAGE_SIZE) {
        throw new Error(
          `Image size (${(blob.size / (1024 * 1024)).toFixed(
            2,
          )}MB) exceeds maximum allowed size of 4MB`,
        );
      }

      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read image data"));
        reader.readAsDataURL(blob);
      });

      return {
        type: "image_url",
        image_url: {
          url: base64,
        },
      };
    } catch (error) {
      console.error("[Bedrock] Image processing error:", error);
      throw error;
    }
  }

  async chat(options: ChatOptions): Promise<void> {
    const accessStore = useAccessStore.getState();
    const modelConfig = {
      ...useAppConfig.getState().modelConfig,
      ...options.config,
    };

    if (
      !accessStore.awsRegion ||
      !accessStore.awsAccessKeyId ||
      !accessStore.awsSecretAccessKey
    ) {
      console.log("AWS credentials are not set");
      let responseText = "";
      const responseTexts = [responseText];
      responseTexts.push(Locale.Error.Unauthorized);
      responseText = responseTexts.join("\n\n");
      options.onFinish(responseText);
      return;
    }

    const controller = new AbortController();
    options.onController?.(controller);

    const headers: Record<string, string> = {
      ...getHeaders(),
      "X-Region": accessStore.awsRegion,
      "X-Access-Key": accessStore.awsAccessKeyId,
      "X-Secret-Key": accessStore.awsSecretAccessKey,
    };

    if (accessStore.awsSessionToken) {
      headers["X-Session-Token"] = accessStore.awsSessionToken;
    }

    try {
      // Process messages to handle multimodal content
      const messages = await Promise.all(
        options.messages.map(async (msg) => {
          if (Array.isArray(msg.content)) {
            // For vision models, include both text and images
            if (isVisionModel(options.config.model)) {
              const images = getMessageImages(msg);
              const content: MultimodalContent[] = [];

              // Process documents first
              for (const item of msg.content) {
                // Check for document content
                if (item && typeof item === "object") {
                  if ("file" in item && item.file instanceof File) {
                    try {
                      console.log(
                        "[Bedrock] Processing document:",
                        item.file.name,
                      );
                      const { content: docContent } =
                        await this.processDocument(item.file);
                      content.push(docContent);
                    } catch (e) {
                      console.error("[Bedrock] Failed to process document:", e);
                    }
                  } else if ("document" in item && item.document) {
                    // If document content is already processed, include it directly
                    content.push(item as MultimodalContent);
                  }
                }
              }

              // Add text content if it's not a document display text
              const text = getMessageTextContent(msg);
              if (text && !text.startsWith("Document: ")) {
                content.push({ type: "text", text });
              }

              // Process images with size check and error handling
              for (const url of images) {
                try {
                  const imageContent = await this.processImage(url);
                  content.push(imageContent);
                } catch (e) {
                  console.error("[Bedrock] Failed to process image:", e);
                  // Add error message as text content
                  content.push({
                    type: "text",
                    text: `Error processing image: ${e.message}`,
                  });
                }
              }

              // Only return content if there is any
              if (content.length > 0) {
                return { ...msg, content };
              }
            }
            // For non-vision models, only include text
            return { ...msg, content: getMessageTextContent(msg) };
          }
          return msg;
        }),
      );

      // Filter out empty messages
      const filteredMessages = messages.filter((msg) => {
        if (Array.isArray(msg.content)) {
          return msg.content.length > 0;
        }
        return msg.content !== "";
      });

      const requestBody = {
        messages: filteredMessages,
        modelId: options.config.model,
        inferenceConfig: {
          maxTokens: modelConfig.max_tokens,
          temperature: modelConfig.temperature,
          topP: modelConfig.top_p,
          stopSequences: [],
        },
      };

      console.log(
        "[Bedrock] Request body:",
        JSON.stringify(
          {
            ...requestBody,
            messages: requestBody.messages.map((msg) => ({
              ...msg,
              content: Array.isArray(msg.content)
                ? msg.content.map((c) => ({
                    type: c.type,
                    ...(c.document
                      ? {
                          document: {
                            format: c.document.format,
                            name: c.document.name,
                          },
                        }
                      : {}),
                    ...(c.image_url ? { image_url: { url: "[BINARY]" } } : {}),
                    ...(c.text ? { text: c.text } : {}),
                  }))
                : msg.content,
            })),
          },
          null,
          2,
        ),
      );

      const shouldStream = !!options.config.stream;
      const conversePath = `${ApiPath.Bedrock}/converse`;

      if (shouldStream) {
        let response = await fetch(conversePath, {
          method: "POST",
          headers: {
            ...headers,
            "X-Stream": "true",
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Bedrock API error: ${error}`);
        }

        let buffer = "";
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body reader available");
        }

        let currentContent = "";
        let isFirstMessage = true;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Convert the chunk to text and add to buffer
          const chunk = new TextDecoder().decode(value);
          buffer += chunk;

          // Process complete messages from buffer
          let newlineIndex;
          while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
            const line = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);

            if (line.startsWith("data: ")) {
              try {
                const event = JSON.parse(line.slice(6));

                if (event.type === "messageStart") {
                  if (isFirstMessage) {
                    isFirstMessage = false;
                  }
                  continue;
                }

                if (event.type === "text" && event.content) {
                  currentContent += event.content;
                  options.onUpdate?.(currentContent, event.content);
                }

                if (event.type === "messageStop") {
                  options.onFinish(currentContent);
                  return;
                }

                if (event.type === "error") {
                  throw new Error(event.message || "Unknown error");
                }
              } catch (e) {
                console.error("[Bedrock] Failed to parse stream event:", e);
              }
            }
          }
        }

        // If we reach here without a messageStop event, finish with current content
        options.onFinish(currentContent);
      } else {
        const response = await fetch(conversePath, {
          method: "POST",
          headers,
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Bedrock API error: ${error}`);
        }

        const responseBody = await response.json();
        const content = this.extractMessage(responseBody);
        options.onFinish(content);
      }
    } catch (e) {
      console.error("[Bedrock] Chat error:", e);
      options.onError?.(e as Error);
    }
  }

  async usage(): Promise<LLMUsage> {
    // Bedrock usage is tracked through AWS billing
    return {
      used: 0,
      total: 0,
    };
  }

  async models() {
    // Return empty array as models are configured through AWS console
    return [];
  }
}
