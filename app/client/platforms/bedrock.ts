"use client";
import {
  ChatOptions,
  getHeaders,
  LLMApi,
  SpeechOptions,
  RequestMessage,
  MultimodalContent,
  MessageRole,
} from "../api";
import {
  useAppConfig,
  usePluginStore,
  useChatStore,
  useAccessStore,
  ChatMessageTool,
} from "../../store";
import { preProcessImageContent, stream } from "../../utils/chat";
import { getMessageTextContent, isVisionModel } from "../../utils";
import { ApiPath, BEDROCK_BASE_URL } from "../../constant";
import { getClientConfig } from "../../config/client";

const ClaudeMapper = {
  assistant: "assistant",
  user: "user",
  system: "user",
} as const;

type ClaudeRole = keyof typeof ClaudeMapper;

interface ToolDefinition {
  function?: {
    name: string;
    description?: string;
    parameters?: any;
  };
}

export class BedrockApi implements LLMApi {
  private disableListModels = true;

  path(path: string): string {
    const accessStore = useAccessStore.getState();

    let baseUrl = "";

    if (accessStore.useCustomConfig) {
      baseUrl = accessStore.bedrockUrl;
    }

    if (baseUrl.length === 0) {
      const isApp = !!getClientConfig()?.isApp;
      const apiPath = ApiPath.Bedrock;
      baseUrl = isApp ? BEDROCK_BASE_URL : apiPath;
    }

    if (baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, baseUrl.length - 1);
    }
    if (!baseUrl.startsWith("http") && !baseUrl.startsWith(ApiPath.Bedrock)) {
      baseUrl = "https://" + baseUrl;
    }

    console.log("[Proxy Endpoint] ", baseUrl, path);

    return [baseUrl, path].join("/");
  }

  speech(options: SpeechOptions): Promise<ArrayBuffer> {
    throw new Error("Speech not implemented for Bedrock.");
  }

  extractMessage(res: any, modelId: string = "") {
    try {
      // Handle Titan models
      if (modelId.startsWith("amazon.titan")) {
        let text = "";
        if (res?.delta?.text) {
          text = res.delta.text;
        } else {
          text = res?.outputText || "";
        }
        // Clean up Titan response by removing leading question mark and whitespace
        return text.replace(/^[\s?]+/, "");
      }

      // Handle LLaMA models
      if (modelId.startsWith("us.meta.llama")) {
        if (res?.delta?.text) {
          return res.delta.text;
        }
        if (res?.generation) {
          return res.generation;
        }
        if (res?.outputs?.[0]?.text) {
          return res.outputs[0].text;
        }
        if (res?.output) {
          return res.output;
        }
        if (typeof res === "string") {
          return res;
        }
        return "";
      }

      // Handle Mistral models
      if (modelId.startsWith("mistral.mistral")) {
        if (res?.delta?.text) {
          return res.delta.text;
        }
        if (res?.outputs?.[0]?.text) {
          return res.outputs[0].text;
        }
        if (res?.content?.[0]?.text) {
          return res.content[0].text;
        }
        if (res?.output) {
          return res.output;
        }
        if (res?.completion) {
          return res.completion;
        }
        if (typeof res === "string") {
          return res;
        }
        return "";
      }

      // Handle Claude models
      if (res?.content?.[0]?.text) return res.content[0].text;
      if (res?.messages?.[0]?.content?.[0]?.text)
        return res.messages[0].content[0].text;
      if (res?.delta?.text) return res.delta.text;
      if (res?.completion) return res.completion;
      if (res?.generation) return res.generation;
      if (res?.outputText) return res.outputText;
      if (res?.output) return res.output;

      if (typeof res === "string") return res;

      return "";
    } catch (e) {
      console.error("Error extracting message:", e);
      return "";
    }
  }

  formatRequestBody(
    messages: RequestMessage[],
    systemMessage: string,
    modelConfig: any,
  ) {
    const model = modelConfig.model;

    // Handle Titan models
    if (model.startsWith("amazon.titan")) {
      const allMessages = systemMessage
        ? [
            { role: "system" as MessageRole, content: systemMessage },
            ...messages,
          ]
        : messages;

      const inputText = allMessages
        .map((m) => {
          if (m.role === "system") {
            return getMessageTextContent(m);
          }
          return getMessageTextContent(m);
        })
        .join("\n\n");

      return {
        body: {
          inputText,
          textGenerationConfig: {
            maxTokenCount: modelConfig.max_tokens,
            temperature: modelConfig.temperature,
            stopSequences: [],
          },
        },
      };
    }

    // Handle LLaMA models
    if (model.startsWith("us.meta.llama")) {
      const allMessages = systemMessage
        ? [
            { role: "system" as MessageRole, content: systemMessage },
            ...messages,
          ]
        : messages;

      const prompt = allMessages
        .map((m) => {
          const content = getMessageTextContent(m);
          if (m.role === "system") {
            return `System: ${content}`;
          } else if (m.role === "user") {
            return `User: ${content}`;
          } else if (m.role === "assistant") {
            return `Assistant: ${content}`;
          }
          return content;
        })
        .join("\n\n");

      return {
        prompt,
        max_gen_len: modelConfig.max_tokens || 512,
        temperature: modelConfig.temperature || 0.6,
        top_p: modelConfig.top_p || 0.9,
        stop: ["User:", "System:", "Assistant:", "\n\n"],
      };
    }

    // Handle Mistral models
    if (model.startsWith("mistral.mistral")) {
      const allMessages = systemMessage
        ? [
            { role: "system" as MessageRole, content: systemMessage },
            ...messages,
          ]
        : messages;

      const formattedConversation = allMessages
        .map((m) => {
          const content = getMessageTextContent(m);
          if (m.role === "system") {
            return content;
          } else if (m.role === "user") {
            return content;
          } else if (m.role === "assistant") {
            return content;
          }
          return content;
        })
        .join("\n");

      // Format according to Mistral's requirements
      return {
        prompt: formattedConversation,
        max_tokens: modelConfig.max_tokens || 4096,
        temperature: modelConfig.temperature || 0.7,
      };
    }

    // Handle Claude models
    const isClaude3 = model.startsWith("anthropic.claude-3");
    const formattedMessages = messages
      .filter(
        (v) => v.content && (typeof v.content !== "string" || v.content.trim()),
      )
      .map((v) => {
        const { role, content } = v;
        const insideRole = ClaudeMapper[role as ClaudeRole] ?? "user";

        if (!isVisionModel(model) || typeof content === "string") {
          return {
            role: insideRole,
            content: [{ type: "text", text: getMessageTextContent(v) }],
          };
        }

        return {
          role: insideRole,
          content: (content as MultimodalContent[])
            .filter((v) => v.image_url || v.text)
            .map(({ type, text, image_url }) => {
              if (type === "text") return { type, text: text! };

              const { url = "" } = image_url || {};
              const colonIndex = url.indexOf(":");
              const semicolonIndex = url.indexOf(";");
              const comma = url.indexOf(",");

              return {
                type: "image",
                source: {
                  type: url.slice(semicolonIndex + 1, comma),
                  media_type: url.slice(colonIndex + 1, semicolonIndex),
                  data: url.slice(comma + 1),
                },
              };
            }),
        };
      });

    return {
      body: {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: modelConfig.max_tokens,
        messages: formattedMessages,
        ...(systemMessage && { system: systemMessage }),
        temperature: modelConfig.temperature,
        ...(isClaude3 && { top_k: modelConfig.top_k || 50 }),
      },
    };
  }

  async chat(options: ChatOptions) {
    const modelConfig = {
      ...useAppConfig.getState().modelConfig,
      ...useChatStore.getState().currentSession().mask.modelConfig,
      model: options.config.model,
    };

    let systemMessage = "";
    const messages = [];
    for (const msg of options.messages) {
      const content = await preProcessImageContent(msg.content);
      if (msg.role === "system") {
        systemMessage = getMessageTextContent(msg);
      } else {
        messages.push({ role: msg.role, content });
      }
    }

    const requestBody = this.formatRequestBody(
      messages,
      systemMessage,
      modelConfig,
    );

    const controller = new AbortController();
    options.onController?.(controller);

    const accessStore = useAccessStore.getState();
    if (!accessStore.isValidBedrock()) {
      throw new Error(
        "Invalid AWS credentials. Please check your configuration and ensure ENCRYPTION_KEY is set.",
      );
    }

    try {
      const chatPath = this.path("chat");
      const headers = getHeaders();
      headers.ModelID = modelConfig.model;

      // For LLaMA and Mistral models, send the request body directly without the 'body' wrapper
      const finalRequestBody =
        modelConfig.model.startsWith("us.meta.llama") ||
        modelConfig.model.startsWith("mistral.mistral")
          ? requestBody
          : requestBody.body;

      if (options.config.stream) {
        let index = -1;
        let currentToolArgs = "";
        const [tools, funcs] = usePluginStore
          .getState()
          .getAsTools(
            useChatStore.getState().currentSession().mask?.plugin || [],
          );

        return stream(
          chatPath,
          finalRequestBody,
          headers,
          (tools as ToolDefinition[]).map((tool) => ({
            name: tool?.function?.name,
            description: tool?.function?.description,
            input_schema: tool?.function?.parameters,
          })),
          funcs,
          controller,
          (text: string, runTools: ChatMessageTool[]) => {
            try {
              const chunkJson = JSON.parse(text);
              if (chunkJson?.content_block?.type === "tool_use") {
                index += 1;
                currentToolArgs = "";
                const id = chunkJson.content_block?.id;
                const name = chunkJson.content_block?.name;
                if (id && name) {
                  runTools.push({
                    id,
                    type: "function",
                    function: { name, arguments: "" },
                  });
                }
              } else if (
                chunkJson?.delta?.type === "input_json_delta" &&
                chunkJson.delta?.partial_json
              ) {
                currentToolArgs += chunkJson.delta.partial_json;
                try {
                  JSON.parse(currentToolArgs);
                  if (index >= 0 && index < runTools.length) {
                    runTools[index].function!.arguments = currentToolArgs;
                  }
                } catch (e) {}
              } else if (
                chunkJson?.type === "content_block_stop" &&
                currentToolArgs &&
                index >= 0 &&
                index < runTools.length
              ) {
                try {
                  if (currentToolArgs.trim().endsWith(",")) {
                    currentToolArgs = currentToolArgs.slice(0, -1) + "}";
                  } else if (!currentToolArgs.endsWith("}")) {
                    currentToolArgs += "}";
                  }
                  JSON.parse(currentToolArgs);
                  runTools[index].function!.arguments = currentToolArgs;
                } catch (e) {}
              }
              const message = this.extractMessage(chunkJson, modelConfig.model);
              return message;
            } catch (e) {
              console.error("Error parsing chunk:", e);
              return "";
            }
          },
          (
            requestPayload: any,
            toolCallMessage: any,
            toolCallResult: any[],
          ) => {
            index = -1;
            currentToolArgs = "";
            if (requestPayload?.messages) {
              requestPayload.messages.splice(
                requestPayload.messages.length,
                0,
                {
                  role: "assistant",
                  content: [
                    {
                      type: "text",
                      text: JSON.stringify(
                        toolCallMessage.tool_calls.map(
                          (tool: ChatMessageTool) => ({
                            type: "tool_use",
                            id: tool.id,
                            name: tool?.function?.name,
                            input: tool?.function?.arguments
                              ? JSON.parse(tool?.function?.arguments)
                              : {},
                          }),
                        ),
                      ),
                    },
                  ],
                },
                ...toolCallResult.map((result) => ({
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: `Tool '${result.tool_call_id}' returned: ${result.content}`,
                    },
                  ],
                })),
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

        const resJson = await res.json();
        const message = this.extractMessage(resJson, modelConfig.model);
        options.onFinish(message, res);
      }
    } catch (e) {
      console.error("Chat error:", e);
      options.onError?.(e as Error);
    }
  }

  async usage() {
    return { used: 0, total: 0 };
  }

  async models() {
    return [];
  }
}
