import {
  ChatOptions,
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
  speech(options: SpeechOptions): Promise<ArrayBuffer> {
    throw new Error("Speech not implemented for Bedrock.");
  }

  extractMessage(res: any, modelId: string = "") {
    try {
      // Handle Titan models
      if (modelId.startsWith("amazon.titan")) {
        if (res?.delta?.text) return res.delta.text;
        return res?.outputText || "";
      }

      // Handle LLaMA models
      if (modelId.startsWith("us.meta.llama3")) {
        if (res?.delta?.text) return res.delta.text;
        if (res?.generation) return res.generation;
        if (typeof res?.output === "string") return res.output;
        if (typeof res === "string") return res;
        return "";
      }

      // Handle Mistral models
      if (modelId.startsWith("mistral.mistral")) {
        if (res?.delta?.text) return res.delta.text;
        return res?.outputs?.[0]?.text || res?.output || res?.completion || "";
      }

      // Handle Claude models and fallback cases
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
        .map((m) => `${m.role}: ${getMessageTextContent(m)}`)
        .join("\n");
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

    // Handle LLaMA3 models - simplified format
    if (model.startsWith("us.meta.llama3")) {
      const allMessages = systemMessage
        ? [
            { role: "system" as MessageRole, content: systemMessage },
            ...messages,
          ]
        : messages;

      const prompt = allMessages
        .map((m) => `${m.role}: ${getMessageTextContent(m)}`)
        .join("\n");

      return {
        contentType: "application/json",
        accept: "application/json",
        body: {
          prompt,
        },
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
      const prompt = allMessages
        .map((m) => `${m.role}: ${getMessageTextContent(m)}`)
        .join("\n");
      return {
        body: {
          prompt,
          temperature: modelConfig.temperature || 0.7,
          max_tokens: modelConfig.max_tokens || 4096,
        },
      };
    }

    // Handle Claude models (existing implementation)
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
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: modelConfig.max_tokens,
      messages: formattedMessages,
      ...(systemMessage && { system: systemMessage }),
      temperature: modelConfig.temperature,
      ...(isClaude3 && { top_k: 5 }),
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
    // console.log("Request body:", JSON.stringify(requestBody, null, 2));

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
        "Content-Type": requestBody.contentType || "application/json",
        Accept: requestBody.accept || "application/json",
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
              // console.log("Received chunk:", JSON.stringify(chunkJson, null, 2));
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
              // console.log("Extracted message:", message);
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
        const res = await fetch(apiEndpoint, {
          method: "POST",
          headers,
          body: JSON.stringify(requestBody),
        });

        const resJson = await res.json();
        // console.log("Response:", JSON.stringify(resJson, null, 2));
        const message = this.extractMessage(resJson, modelConfig.model);
        // console.log("Extracted message:", message);
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
