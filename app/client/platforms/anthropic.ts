import {
  Anthropic,
  ApiPath,
  REQUEST_TIMEOUT_MS,
  ServiceProvider,
} from "@/app/constant";
import {
  AgentChatOptions,
  ChatOptions,
  CreateRAGStoreOptions,
  getHeaders,
  LLMApi,
  SpeechOptions,
  TranscriptionOptions,
} from "../api";
import {
  useAccessStore,
  useAppConfig,
  useChatStore,
  usePluginStore,
  ChatMessageTool,
} from "@/app/store";
import { getClientConfig } from "@/app/config/client";
import { ANTHROPIC_BASE_URL } from "@/app/constant";
import {
  getMessageTextContent,
  getWebReferenceMessageTextContent,
  isClaudeThinkingModel,
  isVisionModel,
} from "@/app/utils";
import { preProcessImageContent, streamWithThink } from "@/app/utils/chat";
import { cloudflareAIGatewayUrl } from "@/app/utils/cloudflare";
import { RequestPayload } from "./openai";
import { fetch } from "@/app/utils/stream";
import {
  EventStreamContentType,
  fetchEventSource,
} from "@fortaine/fetch-event-source";
import Locale from "../../locales";

export type MultiBlockContent = {
  type: "image" | "text";
  source?: {
    type: string;
    media_type: string;
    data: string;
  };
  text?: string;
};

export type AnthropicMessage = {
  role: (typeof ClaudeMapper)[keyof typeof ClaudeMapper];
  content: string | MultiBlockContent[];
};

export interface AnthropicChatRequest {
  model: string; // The model that will complete your prompt.
  messages: AnthropicMessage[]; // The prompt that you want Claude to complete.
  max_tokens: number; // The maximum number of tokens to generate before stopping.
  stop_sequences?: string[]; // Sequences that will cause the model to stop generating completion text.
  temperature?: number; // Amount of randomness injected into the response.
  top_p?: number; // Use nucleus sampling.
  top_k?: number; // Only sample from the top K options for each subsequent token.
  metadata?: object; // An object describing metadata about the request.
  stream?: boolean; // Whether to incrementally stream the response using server-sent events.
  thinking?: {
    type: "enabled";
    budget_tokens: number;
  };
}

export interface ChatRequest {
  model: string; // The model that will complete your prompt.
  prompt: string; // The prompt that you want Claude to complete.
  max_tokens_to_sample: number; // The maximum number of tokens to generate before stopping.
  stop_sequences?: string[]; // Sequences that will cause the model to stop generating completion text.
  temperature?: number; // Amount of randomness injected into the response.
  top_p?: number; // Use nucleus sampling.
  top_k?: number; // Only sample from the top K options for each subsequent token.
  metadata?: object; // An object describing metadata about the request.
  stream?: boolean; // Whether to incrementally stream the response using server-sent events.
}

export interface ChatResponse {
  completion: string;
  stop_reason: "stop_sequence" | "max_tokens";
  model: string;
}

export type ChatStreamResponse = ChatResponse & {
  stop?: string;
  log_id: string;
};

const ClaudeMapper = {
  assistant: "assistant",
  user: "user",
  system: "user",
} as const;

const keys = ["claude-2, claude-instant-1"];

export class ClaudeApi implements LLMApi {
  transcription(options: TranscriptionOptions): Promise<string> {
    throw new Error("Method not implemented.");
  }
  async toolAgentChat(options: AgentChatOptions) {
    const visionModel = isVisionModel(options.config.model);
    const messages: AgentChatOptions["messages"] = [];
    for (const v of options.messages) {
      const content = visionModel
        ? await preProcessImageContent(v.content)
        : getMessageTextContent(v);
      messages.push({ role: v.role, content });
    }

    const modelConfig = {
      ...useAppConfig.getState().modelConfig,
      ...useChatStore.getState().currentSession().mask.modelConfig,
      ...{
        model: options.config.model,
      },
    };
    const accessStore = useAccessStore.getState();
    let baseUrl = accessStore.anthropicUrl;
    const requestPayload = {
      chatSessionId: options.chatSessionId,
      messages,
      isAzure: false,
      azureApiVersion: accessStore.azureApiVersion,
      stream: options.config.stream,
      model: modelConfig.model,
      temperature: modelConfig.temperature,
      presence_penalty: modelConfig.presence_penalty,
      frequency_penalty: modelConfig.frequency_penalty,
      top_p: modelConfig.top_p,
      baseUrl: baseUrl,
      maxIterations: options.agentConfig.maxIterations,
      returnIntermediateSteps: options.agentConfig.returnIntermediateSteps,
      useTools: options.agentConfig.useTools,
      provider: ServiceProvider.Anthropic,
    };

    console.log("[Request] anthropic payload: ", requestPayload);

    const shouldStream = true;
    const controller = new AbortController();
    options.onController?.(controller);

    try {
      let path = "/api/langchain/tool/agent/";
      const enableNodeJSPlugin = !!process.env.NEXT_PUBLIC_ENABLE_NODEJS_PLUGIN;
      path = enableNodeJSPlugin ? path + "nodejs" : path + "edge";
      const chatPayload = {
        method: "POST",
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
        headers: getHeaders(),
      };

      // make a fetch request
      const requestTimeoutId = setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT_MS,
      );
      // console.log("shouldStream", shouldStream);

      if (shouldStream) {
        let responseText = "";
        let finished = false;

        const finish = () => {
          if (!finished) {
            options.onFinish(responseText);
            finished = true;
          }
        };

        controller.signal.onabort = finish;

        fetchEventSource(path, {
          ...chatPayload,
          async onopen(res) {
            clearTimeout(requestTimeoutId);
            const contentType = res.headers.get("content-type");
            console.log(
              "[OpenAI] request response content type: ",
              contentType,
            );

            if (contentType?.startsWith("text/plain")) {
              responseText = await res.clone().text();
              return finish();
            }

            if (
              !res.ok ||
              !res.headers
                .get("content-type")
                ?.startsWith(EventStreamContentType) ||
              res.status !== 200
            ) {
              const responseTexts = [responseText];
              let extraInfo = await res.clone().text();
              console.warn(`extraInfo: ${extraInfo}`);

              if (res.status === 401) {
                responseTexts.push(Locale.Error.Unauthorized);
              }

              if (extraInfo) {
                responseTexts.push(extraInfo);
              }

              responseText = responseTexts.join("\n\n");

              return finish();
            }
          },
          onmessage(msg) {
            let response = JSON.parse(msg.data);
            if (!response.isSuccess) {
              console.error("[Request]", msg.data);
              responseText = msg.data;
              throw Error(response.message);
            }
            if (msg.data === "[DONE]" || finished) {
              return finish();
            }
            try {
              if (response && !response.isToolMessage) {
                responseText += response.message;
                options.onUpdate?.(responseText, response.message);
              } else {
                options.onToolUpdate?.(response.toolName!, response.message);
              }
            } catch (e) {
              console.error("[Request] parse error", response, msg);
            }
          },
          onclose() {
            finish();
          },
          onerror(e) {
            options.onError?.(e);
            throw e;
          },
          openWhenHidden: true,
        });
      } else {
        const res = await fetch(path, chatPayload);
        clearTimeout(requestTimeoutId);

        const resJson = await res.json();
        const message = this.extractMessage(resJson);
        options.onFinish(message);
      }
    } catch (e) {
      console.log("[Request] failed to make a chat reqeust", e);
      options.onError?.(e as Error);
    }
  }

  createRAGStore(options: CreateRAGStoreOptions): Promise<string> {
    throw new Error("Method not implemented.");
  }
  speech(options: SpeechOptions): Promise<ArrayBuffer> {
    throw new Error("Method not implemented.");
  }

  extractMessage(res: any) {
    console.log("[Response] claude response: ", res);

    return res?.content?.[0]?.text;
  }
  async chat(options: ChatOptions): Promise<void> {
    const thinkingModel = isClaudeThinkingModel(options.config.model);
    const visionModel = isVisionModel(options.config.model);
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
            content: getWebReferenceMessageTextContent(v),
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

    const requestBody: AnthropicChatRequest = {
      messages: prompt,
      stream: shouldStream,

      model: modelConfig.model,
      max_tokens: modelConfig.max_tokens,
      temperature: modelConfig.temperature,
      top_p: modelConfig.top_p,
      // top_k: modelConfig.top_k,
      top_k: 5,
    };

    // extended-thinking
    // https://docs.anthropic.com/zh-CN/docs/build-with-claude/extended-thinking
    if (
      thinkingModel &&
      useChatStore.getState().currentSession().mask.claudeThinking
    ) {
      requestBody.thinking = {
        type: "enabled",
        budget_tokens: modelConfig.budget_tokens,
      };
      requestBody.temperature = undefined;
      requestBody.top_p = undefined;
      requestBody.top_k = undefined;
    }

    const path = this.path(Anthropic.ChatPath);

    const controller = new AbortController();
    options.onController?.(controller);

    if (shouldStream) {
      let index = -1;
      const tools = [] as any;
      const funcs = {};
      // const [tools, funcs] = usePluginStore
      //   .getState()
      //   .getAsTools(
      //     useChatStore.getState().currentSession().mask?.plugin || [],
      //   );
      return streamWithThink(
        path,
        requestBody,
        {
          ...getHeaders(),
          "anthropic-version": accessStore.anthropicApiVersion,
        },
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
                  type: "text_delta" | "input_json_delta" | "thinking_delta";
                  text?: string;
                  thinking?: string;
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

          console.log("chunkJson", chunkJson);

          const isThinking = chunkJson?.delta?.type === "thinking_delta";
          const content = isThinking
            ? chunkJson?.delta?.thinking
            : chunkJson?.delta?.text;

          if (!content || content.trim().length === 0) {
            return {
              isThinking: false,
              content: "",
            };
          }
          return {
            isThinking,
            content,
          };
        },
        // processToolMessage, include tool_calls message and tool call results
        (
          requestPayload: RequestPayload,
          toolCallMessage: any,
          toolCallResult: any[],
        ) => {
          // reset index value
          index = -1;
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
        },
        options,
      );
    } else {
      const payload = {
        method: "POST",
        body: JSON.stringify(requestBody),
        signal: controller.signal,
        headers: {
          ...getHeaders(), // get common headers
          "anthropic-version": accessStore.anthropicApiVersion,
          // do not send `anthropicApiKey` in browser!!!
          // Authorization: getAuthKey(accessStore.anthropicApiKey),
        },
      };

      try {
        controller.signal.onabort = () =>
          options.onFinish("", new Response(null, { status: 400 }));

        const res = await fetch(path, payload);
        const resJson = await res.json();

        const message = this.extractMessage(resJson);
        options.onFinish(message, res);
      } catch (e) {
        console.error("failed to chat", e);
        options.onError?.(e as Error);
      }
    }
  }
  async usage() {
    return {
      used: 0,
      total: 0,
    };
  }
  async models() {
    // const provider = {
    //   id: "anthropic",
    //   providerName: "Anthropic",
    //   providerType: "anthropic",
    // };

    return [
      // {
      //   name: "claude-instant-1.2",
      //   available: true,
      //   provider,
      // },
      // {
      //   name: "claude-2.0",
      //   available: true,
      //   provider,
      // },
      // {
      //   name: "claude-2.1",
      //   available: true,
      //   provider,
      // },
      // {
      //   name: "claude-3-opus-20240229",
      //   available: true,
      //   provider,
      // },
      // {
      //   name: "claude-3-sonnet-20240229",
      //   available: true,
      //   provider,
      // },
      // {
      //   name: "claude-3-haiku-20240307",
      //   available: true,
      //   provider,
      // },
    ];
  }
  path(path: string): string {
    const accessStore = useAccessStore.getState();

    let baseUrl: string = "";

    if (accessStore.useCustomConfig) {
      baseUrl = accessStore.anthropicUrl;
    }

    // if endpoint is empty, use default endpoint
    if (baseUrl.trim().length === 0) {
      const isApp = !!getClientConfig()?.isApp;

      baseUrl = isApp ? ANTHROPIC_BASE_URL : ApiPath.Anthropic;
    }

    if (!baseUrl.startsWith("http") && !baseUrl.startsWith("/api")) {
      baseUrl = "https://" + baseUrl;
    }

    baseUrl = trimEnd(baseUrl, "/");

    // try rebuild url, when using cloudflare ai gateway in client
    return cloudflareAIGatewayUrl(`${baseUrl}/${path}`);
  }
}

function trimEnd(s: string, end = " ") {
  if (end.length === 0) return s;

  while (s.endsWith(end)) {
    s = s.slice(0, -end.length);
  }

  return s;
}
