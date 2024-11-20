import { ChatOptions, LLMApi, SpeechOptions } from "../api";
import {
  useAppConfig,
  usePluginStore,
  useChatStore,
  useAccessStore,
  ChatMessageTool,
} from "../../store";
import { preProcessImageContent, stream } from "../../utils/chat";
import { getMessageTextContent, isVisionModel } from "../../utils";

const ClaudeMapper = {
  assistant: "assistant",
  user: "user",
  system: "user",
} as const;

interface ToolDefinition {
  function?: {
    name: string;
    description?: string;
    parameters?: any;
  };
}

export class BedrockApi implements LLMApi {
  speech(options: SpeechOptions): Promise<ArrayBuffer> {
    throw new Error("Speech not implemented for Bedrock.");
  }

  extractMessage(res: any) {
    if (res?.content?.[0]?.text) return res.content[0].text;
    if (res?.messages?.[0]?.content?.[0]?.text)
      return res.messages[0].content[0].text;
    if (res?.delta?.text) return res.delta.text;
    return "";
  }

  async chat(options: ChatOptions) {
    const visionModel = isVisionModel(options.config.model);
    const isClaude3 = options.config.model.startsWith("anthropic.claude-3");

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

    const formattedMessages = messages
      .filter(
        (v) => v.content && (typeof v.content !== "string" || v.content.trim()),
      )
      .map((v) => {
        const { role, content } = v;
        const insideRole = ClaudeMapper[role] ?? "user";

        if (!visionModel || typeof content === "string") {
          return {
            role: insideRole,
            content: [{ type: "text", text: getMessageTextContent(v) }],
          };
        }

        return {
          role: insideRole,
          content: content
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

    const requestBody = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: modelConfig.max_tokens,
      messages: formattedMessages,
      ...(systemMessage && { system: systemMessage }),
      ...(modelConfig.temperature !== undefined && {
        temperature: modelConfig.temperature,
      }),
      ...(modelConfig.top_p !== undefined && { top_p: modelConfig.top_p }),
      ...(isClaude3 && { top_k: 5 }),
    };

    const controller = new AbortController();
    options.onController?.(controller);

    const accessStore = useAccessStore.getState();
    if (!accessStore.isValidBedrock()) {
      throw new Error(
        "Invalid AWS credentials. Please check your configuration.",
      );
    }

    try {
      const apiEndpoint = "/api/bedrock/chat";
      const headers = {
        "Content-Type": "application/json",
        "X-Region": accessStore.awsRegion,
        "X-Access-Key": accessStore.awsAccessKey,
        "X-Secret-Key": accessStore.awsSecretKey,
        "X-Model-Id": modelConfig.model,
        ...(accessStore.awsSessionToken && {
          "X-Session-Token": accessStore.awsSessionToken,
        }),
      };

      if (options.config.stream) {
        let index = -1;
        let currentToolArgs = "";
        const [tools, funcs] = usePluginStore
          .getState()
          .getAsTools(
            useChatStore.getState().currentSession().mask?.plugin || [],
          );

        return stream(
          apiEndpoint,
          requestBody,
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
              return this.extractMessage(chunkJson);
            } catch (e) {
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
        const res = await fetch(apiEndpoint, {
          method: "POST",
          headers,
          body: JSON.stringify(requestBody),
        });

        const resJson = await res.json();
        const message = this.extractMessage(resJson);
        options.onFinish(message, res);
      }
    } catch (e) {
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
