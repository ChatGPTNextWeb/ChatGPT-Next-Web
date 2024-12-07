"use client";
import { ChatOptions, getHeaders, LLMApi, SpeechOptions } from "../api";
import {
  useAppConfig,
  usePluginStore,
  useChatStore,
  useAccessStore,
  ChatMessageTool,
} from "@/app/store";
import { preProcessImageContent } from "@/app/utils/chat";
import { getMessageTextContent, isVisionModel } from "@/app/utils";
import { ApiPath, BEDROCK_BASE_URL } from "@/app/constant";
import { getClientConfig } from "@/app/config/client";
import {
  extractMessage,
  processMessage,
  processChunks,
  parseEventData,
  sign,
} from "@/app/utils/aws";
import { RequestPayload } from "./openai";
import { REQUEST_TIMEOUT_MS } from "@/app/constant";
import { prettyObject } from "@/app/utils/format";
import Locale from "@/app/locales";

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
type MistralRole = keyof typeof MistralMapper;
export class BedrockApi implements LLMApi {
  speech(options: SpeechOptions): Promise<ArrayBuffer> {
    throw new Error("Speech not implemented for Bedrock.");
  }

  formatRequestBody(messages: ChatOptions["messages"], modelConfig: any) {
    const model = modelConfig.model;
    const visionModel = isVisionModel(modelConfig.model);

    // Handle Nova models
    if (model.startsWith("us.amazon.nova")) {
      return {
        inferenceConfig: {
          max_tokens: modelConfig.max_tokens || 1000,
        },
        messages: messages.map((message) => ({
          role: message.role,
          content: [
            {
              type: "text",
              text: getMessageTextContent(message),
            },
          ],
        })),
      };
    }

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

    let finalRequestBody = this.formatRequestBody(messages, modelConfig);

    try {
      const isApp = !!getClientConfig()?.isApp;
      const bedrockAPIPath = `${BEDROCK_BASE_URL}/model/${
        modelConfig.model
      }/invoke${shouldStream ? "-with-response-stream" : ""}`;
      const chatPath = isApp ? bedrockAPIPath : ApiPath.Bedrock + "/chat";

      const headers = isApp
        ? await sign({
            method: "POST",
            url: chatPath,
            region: accessStore.awsRegion,
            accessKeyId: accessStore.awsAccessKey,
            secretAccessKey: accessStore.awsSecretKey,
            body: finalRequestBody,
            service: "bedrock",
            isStreaming: shouldStream,
          })
        : getHeaders();

      if (!isApp) {
        headers.XModelID = modelConfig.model;
        headers.XEncryptionKey = accessStore.encryptionKey;
        headers.ShouldStream = shouldStream + "";
      }

      if (process.env.NODE_ENV !== "production") {
        console.debug("[Bedrock Client] Request:", {
          path: chatPath,
          model: modelConfig.model,
          messages: messages.length,
          stream: shouldStream,
        });
      }

      if (shouldStream) {
        const [tools, funcs] = usePluginStore
          .getState()
          .getAsTools(
            useChatStore.getState().currentSession().mask?.plugin || [],
          );
        return bedrockStream(
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
          // processToolMessage, include tool_calls message and tool call results
          (
            requestPayload: RequestPayload,
            toolCallMessage: any,
            toolCallResult: any[],
          ) => {
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
        try {
          controller.signal.onabort = () =>
            options.onFinish("", new Response(null, { status: 400 }));
          const res = await fetch(chatPath, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(finalRequestBody),
          });
          const contentType = res.headers.get("content-type");
          console.log(
            "[Bedrock  Not Stream Request] response content type: ",
            contentType,
          );
          const resJson = await res.json();
          const message = extractMessage(resJson);
          options.onFinish(message, res);
        } catch (e) {
          console.error("failed to chat", e);
          options.onError?.(e as Error);
        }
      }
    } catch (e) {
      console.error("[Bedrock Client] Chat error:", e);
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

function bedrockStream(
  chatPath: string,
  requestPayload: any,
  headers: any,
  tools: any[],
  funcs: Record<string, Function>,
  controller: AbortController,
  processToolMessage: (
    requestPayload: any,
    toolCallMessage: any,
    toolCallResult: any[],
  ) => void,
  options: any,
) {
  let responseText = "";
  let remainText = "";
  let finished = false;
  let running = false;
  let runTools: any[] = [];
  let responseRes: Response;
  let index = -1;
  let chunks: Uint8Array[] = []; // 使用数组存储二进制数据块
  let pendingChunk: Uint8Array | null = null; // 存储不完整的数据块

  // Animate response to make it looks smooth
  function animateResponseText() {
    if (finished || controller.signal.aborted) {
      responseText += remainText;
      console.log("[Response Animation] finished");
      if (responseText?.length === 0) {
        options.onError?.(new Error("empty response from server"));
      }
      return;
    }

    if (remainText.length > 0) {
      const fetchCount = Math.max(1, Math.round(remainText.length / 60));
      const fetchText = remainText.slice(0, fetchCount);
      responseText += fetchText;
      remainText = remainText.slice(fetchCount);
      options.onUpdate?.(responseText, fetchText);
    }

    requestAnimationFrame(animateResponseText);
  }

  // Start animation
  animateResponseText();

  const finish = () => {
    if (!finished) {
      if (!running && runTools.length > 0) {
        const toolCallMessage = {
          role: "assistant",
          tool_calls: [...runTools],
        };
        running = true;
        runTools.splice(0, runTools.length); // empty runTools
        return Promise.all(
          toolCallMessage.tool_calls.map((tool) => {
            options?.onBeforeTool?.(tool);
            return Promise.resolve(
              funcs[tool.function.name](
                tool?.function?.arguments
                  ? JSON.parse(tool?.function?.arguments)
                  : {},
              ),
            )
              .then((res) => {
                let content = res.data || res?.statusText;
                content =
                  typeof content === "string"
                    ? content
                    : JSON.stringify(content);
                if (res.status >= 300) {
                  return Promise.reject(content);
                }
                return content;
              })
              .then((content) => {
                options?.onAfterTool?.({
                  ...tool,
                  content,
                  isError: false,
                });
                return content;
              })
              .catch((e) => {
                options?.onAfterTool?.({
                  ...tool,
                  isError: true,
                  errorMsg: e.toString(),
                });
                return e.toString();
              })
              .then((content) => ({
                name: tool.function.name,
                role: "tool",
                content,
                tool_call_id: tool.id,
              }));
          }),
        ).then((toolCallResult) => {
          processToolMessage(requestPayload, toolCallMessage, toolCallResult);
          setTimeout(() => {
            // call again
            console.debug("[BedrockAPI for toolCallResult] restart");
            running = false;
            bedrockChatApi(chatPath, headers, requestPayload, tools);
          }, 60);
        });
      }
      if (running) {
        return;
      }
      console.debug("[BedrockAPI] end");
      finished = true;
      options.onFinish(responseText + remainText, responseRes);
    }
  };

  controller.signal.onabort = finish;

  async function bedrockChatApi(
    chatPath: string,
    headers: any,
    requestPayload: any,
    tools: any,
  ) {
    const requestTimeoutId = setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS,
    );

    try {
      const res = await fetch(chatPath, {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...requestPayload,
          tools: tools && tools.length ? tools : undefined,
        }),
        redirect: "manual",
        // @ts-ignore
        duplex: "half",
        signal: controller.signal,
      });

      clearTimeout(requestTimeoutId);
      responseRes = res;

      const contentType = res.headers.get("content-type");
      console.log(
        "[Bedrock Stream Request] response content type: ",
        contentType,
      );

      // Handle non-stream responses
      if (contentType?.startsWith("text/plain")) {
        responseText = await res.text();
        return finish();
      }

      // Handle error responses
      if (
        !res.ok ||
        res.status !== 200 ||
        !contentType?.startsWith("application/vnd.amazon.eventstream")
      ) {
        const responseTexts = [responseText];
        let extraInfo = await res.text();
        try {
          const resJson = await res.clone().json();
          extraInfo = prettyObject(resJson);
        } catch {}

        if (res.status === 401) {
          responseTexts.push(Locale.Error.Unauthorized);
        }

        if (extraInfo) {
          responseTexts.push(extraInfo);
        }

        responseText = responseTexts.join("\n\n");
        return finish();
      }

      // Process the stream using chunks
      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error("No response body reader available");
      }

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            // Process final pending chunk
            if (pendingChunk) {
              try {
                const parsed = parseEventData(pendingChunk);
                if (parsed) {
                  const result = processMessage(
                    parsed,
                    remainText,
                    runTools,
                    index,
                  );
                  remainText = result.remainText;
                  index = result.index;
                }
              } catch (e) {
                console.error("[Final Chunk Process Error]:", e);
              }
            }
            break;
          }

          // Add new chunk to queue
          chunks.push(value);

          // Process chunk queue
          const result = processChunks(
            chunks,
            pendingChunk,
            remainText,
            runTools,
            index,
          );
          chunks = result.chunks;
          pendingChunk = result.pendingChunk;
          remainText = result.remainText;
          index = result.index;
        }
      } catch (err) {
        console.error("[Bedrock Stream Error]:", err);
        throw err;
      } finally {
        reader.releaseLock();
        finish();
      }
    } catch (e) {
      console.error("[Bedrock Request] error", e);
      options.onError?.(e);
      throw e;
    }
  }

  console.debug("[BedrockAPI] start");
  bedrockChatApi(chatPath, headers, requestPayload, tools);
}
