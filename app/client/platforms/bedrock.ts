import { ApiPath } from "../../constant";
import {
  ChatOptions,
  getHeaders,
  LLMApi,
  LLMModel,
  LLMUsage,
  SpeechOptions,
} from "../api";
import {
  useAppConfig,
  usePluginStore,
  useChatStore,
  ChatMessageTool,
} from "../../store";
import { getMessageTextContent, isVisionModel } from "../../utils";
import { fetch } from "../../utils/stream";
import { preProcessImageContent, stream } from "../../utils/chat";

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

const ClaudeMapper = {
  assistant: "assistant",
  user: "user",
  system: "user",
} as const;

export class BedrockApi implements LLMApi {
  usage(): Promise<LLMUsage> {
    throw new Error("Method not implemented.");
  }
  models(): Promise<LLMModel[]> {
    throw new Error("Method not implemented.");
  }
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

  async chat(options: ChatOptions): Promise<void> {
    const visionModel = isVisionModel(options.config.model);
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

    const [tools, funcs] = usePluginStore
      .getState()
      .getAsTools(useChatStore.getState().currentSession().mask?.plugin || []);

    const requestBody = {
      modelId: options.config.model,
      messages: messages.filter((msg) => msg.content.length > 0),
      inferenceConfig: {
        maxTokens: modelConfig.max_tokens,
        temperature: modelConfig.temperature,
        topP: modelConfig.top_p,
        stopSequences: [],
      },
      toolConfig:
        Array.isArray(tools) && tools.length > 0
          ? {
              tools: tools.map((tool: any) => ({
                toolSpec: {
                  name: tool?.function?.name,
                  description: tool?.function?.description,
                  inputSchema: {
                    json: tool?.function?.parameters,
                  },
                },
              })),
              toolChoice: { auto: {} },
            }
          : undefined,
    };

    const conversePath = `${ApiPath.Bedrock}/converse`;
    const controller = new AbortController();
    options.onController?.(controller);

    if (shouldStream) {
      let currentToolUse: ChatMessageTool | null = null;
      return stream(
        conversePath,
        requestBody,
        getHeaders(),
        Array.isArray(tools)
          ? tools.map((tool: any) => ({
              name: tool?.function?.name,
              description: tool?.function?.description,
              input_schema: tool?.function?.parameters,
            }))
          : [],
        funcs,
        controller,
        // parseSSE
        (text: string, runTools: ChatMessageTool[]) => {
          const parsed = JSON.parse(text);
          const event = parsed.stream;

          if (!event) {
            console.warn("[Bedrock] Unexpected event format:", parsed);
            return "";
          }

          if (event.messageStart) {
            return "";
          }

          if (event.contentBlockStart?.start?.toolUse) {
            const { toolUseId, name } = event.contentBlockStart.start.toolUse;
            currentToolUse = {
              id: toolUseId,
              type: "function",
              function: {
                name,
                arguments: "",
              },
            };
            runTools.push(currentToolUse);
            return "";
          }

          if (event.contentBlockDelta?.delta?.text) {
            return event.contentBlockDelta.delta.text;
          }

          if (
            event.contentBlockDelta?.delta?.toolUse?.input &&
            currentToolUse?.function
          ) {
            currentToolUse.function.arguments +=
              event.contentBlockDelta.delta.toolUse.input;
            return "";
          }

          if (
            event.internalServerException ||
            event.modelStreamErrorException ||
            event.validationException ||
            event.throttlingException ||
            event.serviceUnavailableException
          ) {
            const errorMessage =
              event.internalServerException?.message ||
              event.modelStreamErrorException?.message ||
              event.validationException?.message ||
              event.throttlingException?.message ||
              event.serviceUnavailableException?.message ||
              "Unknown error";
            throw new Error(errorMessage);
          }

          return "";
        },
        // processToolMessage
        (requestPayload: any, toolCallMessage: any, toolCallResult: any[]) => {
          currentToolUse = null;
          requestPayload?.messages?.splice(
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
      try {
        const response = await fetch(conversePath, {
          method: "POST",
          headers: getHeaders(),
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
      } catch (e: any) {
        console.error("[Bedrock] Chat error:", e);
        throw e;
      }
    }
  }
}
