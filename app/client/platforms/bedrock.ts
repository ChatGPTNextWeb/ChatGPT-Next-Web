"use client";
import { ChatOptions, getHeaders, LLMApi, SpeechOptions } from "../api";
import {
  useAppConfig,
  usePluginStore,
  useChatStore,
  useAccessStore,
  ChatMessageTool,
} from "@/app/store";
import { preProcessImageContent, stream } from "@/app/utils/chat";
import { getMessageTextContent, isVisionModel } from "@/app/utils";
import { ApiPath, BEDROCK_BASE_URL } from "@/app/constant";
import { getClientConfig } from "@/app/config/client";
import { extractMessage } from "@/app/utils/aws";
import { RequestPayload } from "./openai";
import { fetch } from "@/app/utils/stream";

const ClaudeMapper = {
  assistant: "assistant",
  user: "user",
  system: "user",
} as const;

const MistralMapper = {
  system: "system",
  user: "user",
  assistant: "assistant",
} as const;

type ClaudeRole = keyof typeof ClaudeMapper;
type MistralRole = keyof typeof MistralMapper;

interface Tool {
  function?: {
    name?: string;
    description?: string;
    parameters?: any;
  };
}

export class BedrockApi implements LLMApi {
  speech(options: SpeechOptions): Promise<ArrayBuffer> {
    throw new Error("Speech not implemented for Bedrock.");
  }

  formatRequestBody(messages: ChatOptions["messages"], modelConfig: any) {
    const model = modelConfig.model;
    const visionModel = isVisionModel(modelConfig.model);

    // Handle Titan models
    if (model.startsWith("amazon.titan")) {
      const inputText = messages
        .map((message) => {
          return `${message.role}: ${getMessageTextContent(message)}`;
        })
        .join("\n\n");

      return {
        inputText,
        textGenerationConfig: {
          maxTokenCount: modelConfig.max_tokens,
          temperature: modelConfig.temperature,
          stopSequences: [],
        },
      };
    }

    // Handle LLaMA models
    if (model.includes("meta.llama")) {
      let prompt = "<|begin_of_text|>";

      // Extract system message if present
      const systemMessage = messages.find((m) => m.role === "system");
      if (systemMessage) {
        prompt += `<|start_header_id|>system<|end_header_id|>\n${getMessageTextContent(
          systemMessage,
        )}<|eot_id|>`;
      }

      // Format the conversation
      const conversationMessages = messages.filter((m) => m.role !== "system");
      for (const message of conversationMessages) {
        const role = message.role === "assistant" ? "assistant" : "user";
        const content = getMessageTextContent(message);
        prompt += `<|start_header_id|>${role}<|end_header_id|>\n${content}<|eot_id|>`;
      }

      // Add the final assistant header to prompt completion
      prompt += "<|start_header_id|>assistant<|end_header_id|>";

      return {
        prompt,
        max_gen_len: modelConfig.max_tokens || 512,
        temperature: modelConfig.temperature || 0.7,
        top_p: modelConfig.top_p || 0.9,
      };
    }

    // Handle Mistral models
    if (model.startsWith("mistral.mistral")) {
      const formattedMessages = messages.map((message) => ({
        role: MistralMapper[message.role as MistralRole] || "user",
        content: getMessageTextContent(message),
      }));

      return {
        messages: formattedMessages,
        max_tokens: modelConfig.max_tokens || 4096,
        temperature: modelConfig.temperature || 0.7,
        top_p: modelConfig.top_p || 0.9,
      };
    }

    // Handle Claude models
    const keys = ["system", "user"];
    // roles must alternate between "user" and "assistant" in claude, so add a fake assistant message between two user messages
    for (let i = 0; i < messages.length - 1; i++) {
      const message = messages[i];
      const nextMessage = messages[i + 1];

      if (keys.includes(message.role) && keys.includes(nextMessage.role)) {
        messages[i] = [
          message,
          {
            role: "assistant",
            content: ";",
          },
        ] as any;
      }
    }
    const prompt = messages
      .flat()
      .filter((v) => {
        if (!v.content) return false;
        if (typeof v.content === "string" && !v.content.trim()) return false;
        return true;
      })
      .map((v) => {
        const { role, content } = v;
        const insideRole = ClaudeMapper[role] ?? "user";

        if (!visionModel || typeof content === "string") {
          return {
            role: insideRole,
            content: getMessageTextContent(v),
          };
        }
        return {
          role: insideRole,
          content: content
            .filter((v) => v.image_url || v.text)
            .map(({ type, text, image_url }) => {
              if (type === "text") {
                return {
                  type,
                  text: text!,
                };
              }
              const { url = "" } = image_url || {};
              const colonIndex = url.indexOf(":");
              const semicolonIndex = url.indexOf(";");
              const comma = url.indexOf(",");

              const mimeType = url.slice(colonIndex + 1, semicolonIndex);
              const encodeType = url.slice(semicolonIndex + 1, comma);
              const data = url.slice(comma + 1);

              return {
                type: "image" as const,
                source: {
                  type: encodeType,
                  media_type: mimeType,
                  data,
                },
              };
            }),
        };
      });

    if (prompt[0]?.role === "assistant") {
      prompt.unshift({
        role: "user",
        content: ";",
      });
    }
    const requestBody: any = {
      anthropic_version: useAccessStore.getState().bedrockAnthropicVersion,
      max_tokens: modelConfig.max_tokens,
      messages: prompt,
      temperature: modelConfig.temperature,
      top_p: modelConfig.top_p || 0.9,
      top_k: modelConfig.top_k || 5,
    };
    return requestBody;
  }

  async chat(options: ChatOptions) {
    const accessStore = useAccessStore.getState();

    const shouldStream = !!options.config.stream;

    const modelConfig = {
      ...useAppConfig.getState().modelConfig,
      ...useChatStore.getState().currentSession().mask.modelConfig,
      ...{
        model: options.config.model,
      },
    };

    // try get base64image from local cache image_url
    const messages: ChatOptions["messages"] = [];
    for (const v of options.messages) {
      const content = await preProcessImageContent(v.content);
      messages.push({ role: v.role, content });
    }

    const controller = new AbortController();
    options.onController?.(controller);

    if (!accessStore.isValidBedrock()) {
      throw new Error(
        "Invalid AWS credentials. Please check your configuration and ensure ENCRYPTION_KEY is set.",
      );
    }

    try {
      const chatPath = this.path("chat");
      const headers = getHeaders();
      headers.XModelID = modelConfig.model;
      headers.XEncryptionKey = accessStore.encryptionKey;
      if (process.env.NODE_ENV !== "production") {
        console.debug("[Bedrock Client] Request:", {
          path: chatPath,
          model: modelConfig.model,
          messages: messages.length,
          stream: shouldStream,
        });
      }
      const finalRequestBody = this.formatRequestBody(messages, modelConfig);
      console.log(
        "[Bedrock Client] Request Body:",
        JSON.stringify(finalRequestBody, null, 2),
      );

      if (shouldStream) {
        let index = -1;
        const [tools, funcs] = usePluginStore
          .getState()
          .getAsTools(
            useChatStore.getState().currentSession().mask?.plugin || [],
          );
        return stream(
          chatPath,
          finalRequestBody,
          headers,
          // @ts-ignore
          tools.map((tool) => ({
            name: tool?.function?.name,
            description: tool?.function?.description,
            input_schema: tool?.function?.parameters,
          })),
          funcs,
          controller,
          // parseSSE
          (text: string, runTools: ChatMessageTool[]) => {
            // console.log("parseSSE", text, runTools);
            let chunkJson:
              | undefined
              | {
                  type: "content_block_delta" | "content_block_stop";
                  content_block?: {
                    type: "tool_use";
                    id: string;
                    name: string;
                  };
                  delta?: {
                    type: "text_delta" | "input_json_delta";
                    text?: string;
                    partial_json?: string;
                  };
                  index: number;
                };
            chunkJson = JSON.parse(text);

            if (chunkJson?.content_block?.type == "tool_use") {
              index += 1;
              const id = chunkJson?.content_block.id;
              const name = chunkJson?.content_block.name;
              runTools.push({
                id,
                type: "function",
                function: {
                  name,
                  arguments: "",
                },
              });
            }
            if (
              chunkJson?.delta?.type == "input_json_delta" &&
              chunkJson?.delta?.partial_json
            ) {
              // @ts-ignore
              runTools[index]["function"]["arguments"] +=
                chunkJson?.delta?.partial_json;
            }
            return chunkJson?.delta?.text;
          },
          // processToolMessage, include tool_calls message and tool call results
          (
            requestPayload: RequestPayload,
            toolCallMessage: any,
            toolCallResult: any[],
          ) => {
            // reset index value
            index = -1;

            const modelId = modelConfig.model;
            const isMistral = modelId.startsWith("mistral.mistral");
            const isClaude = modelId.includes("anthropic.claude");

            if (isClaude) {
              // Format for Claude
              // @ts-ignore
              requestPayload?.messages?.splice(
                // @ts-ignore
                requestPayload?.messages?.length,
                0,
                {
                  role: "assistant",
                  content: toolCallMessage.tool_calls.map(
                    (tool: ChatMessageTool) => ({
                      type: "tool_use",
                      id: tool.id,
                      name: tool?.function?.name,
                      input: tool?.function?.arguments
                        ? JSON.parse(tool?.function?.arguments)
                        : {},
                    }),
                  ),
                },
                // @ts-ignore
                ...toolCallResult.map((result) => ({
                  role: "user",
                  content: [
                    {
                      type: "tool_result",
                      tool_use_id: result.tool_call_id,
                      content: result.content,
                    },
                  ],
                })),
              );
            } else if (isMistral) {
              // Format for Mistral
              requestPayload?.messages?.splice(
                requestPayload?.messages?.length,
                0,
                {
                  role: "assistant",
                  content: "",
                  // @ts-ignore
                  tool_calls: toolCallMessage.tool_calls.map(
                    (tool: ChatMessageTool) => ({
                      id: tool.id,
                      function: {
                        name: tool?.function?.name,
                        arguments: tool?.function?.arguments || "{}",
                      },
                    }),
                  ),
                },
                ...toolCallResult.map((result) => ({
                  role: "tool",
                  tool_call_id: result.tool_call_id,
                  content: result.content,
                })),
              );
            } else {
              console.warn(
                `[Bedrock Client] Unhandled model type for tool calls: ${modelId}`,
              );
            }
          },
          options,
        );
      } else {
        headers.ShouldStream = "false";
        const res = await fetch(chatPath, {
          method: "POST",
          headers,
          body: JSON.stringify(finalRequestBody),
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("[Bedrock Client] Error response:", errorText);
          throw new Error(`Request failed: ${errorText}`);
        }

        const resJson = await res.json();
        if (!resJson) {
          throw new Error("Empty response from server");
        }

        const message = extractMessage(resJson, modelConfig.model);
        if (!message) {
          throw new Error("Failed to extract message from response");
        }

        options.onFinish(message, res);
      }
    } catch (e) {
      console.error("[Bedrock Client] Chat error:", e);
      options.onError?.(e as Error);
    }
  }

  path(path: string): string {
    const accessStore = useAccessStore.getState();
    let baseUrl = accessStore.useCustomConfig ? accessStore.bedrockUrl : "";

    if (baseUrl.length === 0) {
      const isApp = !!getClientConfig()?.isApp;
      const apiPath = ApiPath.Bedrock;
      baseUrl = isApp ? BEDROCK_BASE_URL : apiPath;
    }

    baseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    if (!baseUrl.startsWith("http") && !baseUrl.startsWith(ApiPath.Bedrock)) {
      baseUrl = "https://" + baseUrl;
    }

    console.log("[Bedrock Client] API Endpoint:", baseUrl, path);

    return [baseUrl, path].join("/");
  }

  async usage() {
    return { used: 0, total: 0 };
  }

  async models() {
    return [];
  }
}
