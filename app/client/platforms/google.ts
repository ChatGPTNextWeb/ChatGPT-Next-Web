import {
  ApiPath,
  Google,
  REQUEST_TIMEOUT_MS,
  ServiceProvider,
} from "@/app/constant";
import {
  AgentChatOptions,
  ChatOptions,
  getHeaders,
  LLMApi,
  LLMModel,
  LLMUsage,
  SpeechOptions,
} from "../api";
import { useAccessStore, useAppConfig, useChatStore } from "@/app/store";
import axios from "axios";

const getImageBase64Data = async (url: string) => {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const base64 = Buffer.from(response.data, "binary").toString("base64");
  return base64;
};

export class GeminiProApi implements LLMApi {
  speech(options: SpeechOptions): Promise<ArrayBuffer> {
    throw new Error("Method not implemented.");
  }
  toolAgentChat(options: AgentChatOptions): Promise<void> {
    throw new Error("Method not implemented.");
  }
  extractMessage(res: any) {
    console.log("[Response] gemini-pro response: ", res);

    return (
      res?.candidates?.at(0)?.content?.parts.at(0)?.text ||
      res?.error?.message ||
      ""
    );
  }
  async chat(options: ChatOptions): Promise<void> {
    const messages: any[] = [];
    if (options.config.model.includes("vision")) {
      for (const v of options.messages) {
        let message: any = {
          role: v.role.replace("assistant", "model").replace("system", "user"),
          parts: [{ text: v.content }],
        };
        if (v.image_url) {
          var base64Data = await getImageBase64Data(v.image_url);
          message.parts.push({
            inline_data: {
              mime_type: "image/jpeg",
              data: base64Data,
            },
          });
        }
        messages.push(message);
      }
    } else {
      options.messages.map((v) =>
        messages.push({
          role: v.role.replace("assistant", "model").replace("system", "user"),
          parts: [{ text: v.content }],
        }),
      );
    }

    // google requires that role in neighboring messages must not be the same
    for (let i = 0; i < messages.length - 1; ) {
      // Check if current and next item both have the role "model"
      if (messages[i].role === messages[i + 1].role) {
        // Concatenate the 'parts' of the current and next item
        messages[i].parts = messages[i].parts.concat(messages[i + 1].parts);
        // Remove the next item
        messages.splice(i + 1, 1);
      } else {
        // Move to the next item
        i++;
      }
    }

    const modelConfig = {
      ...useAppConfig.getState().modelConfig,
      ...useChatStore.getState().currentSession().mask.modelConfig,
      ...{
        model: options.config.model,
      },
    };
    const requestPayload = {
      contents: messages,
      generationConfig: {
        // stopSequences: [
        //   "Title"
        // ],
        temperature: modelConfig.temperature,
        maxOutputTokens: modelConfig.max_tokens,
        topP: modelConfig.top_p,
        // "topK": modelConfig.top_k,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_ONLY_HIGH",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_ONLY_HIGH",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_ONLY_HIGH",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_ONLY_HIGH",
        },
      ],
    };

    console.log("[Request] google payload: ", requestPayload);

    const shouldStream = !!options.config.stream;
    const controller = new AbortController();
    options.onController?.(controller);
    try {
      const chatPath = this.path(
        Google.ChatPath.replace("{{model}}", options.config.model),
      );
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
      if (shouldStream) {
        let responseText = "";
        let remainText = "";
        let streamChatPath = chatPath.replace(
          "generateContent",
          "streamGenerateContent",
        );
        let finished = false;

        let existingTexts: string[] = [];
        const finish = () => {
          finished = true;
          options.onFinish(existingTexts.join(""));
        };

        // animate response to make it looks smooth
        function animateResponseText() {
          if (finished || controller.signal.aborted) {
            responseText += remainText;
            finish();
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

        // start animaion
        animateResponseText();
        fetch(streamChatPath, chatPayload)
          .then(async (response) => {
            if (!response.ok) {
              throw new Error(await response?.text());
            }
            const reader = response?.body?.getReader();
            const decoder = new TextDecoder();
            let partialData = "";

            return reader?.read().then(function processText({
              done,
              value,
            }): Promise<any> {
              if (done) {
                console.log("Stream complete");
                // options.onFinish(responseText + remainText);
                finished = true;
                return Promise.resolve();
              }

              partialData += decoder.decode(value, { stream: true });

              try {
                let data = JSON.parse(ensureProperEnding(partialData));

                const textArray = data.reduce(
                  (acc: string[], item: { candidates: any[] }) => {
                    const texts = item.candidates.map((candidate) =>
                      candidate.content.parts
                        .map((part: { text: any }) => part.text)
                        .join(""),
                    );
                    return acc.concat(texts);
                  },
                  [],
                );

                if (textArray.length > existingTexts.length) {
                  const deltaArray = textArray.slice(existingTexts.length);
                  existingTexts = textArray;
                  remainText += deltaArray.join("");
                }
              } catch (error) {
                // console.log("[Response Animation] error: ", error,partialData);
                // skip error message when parsing json
              }

              return reader.read().then(processText);
            });
          })
          .catch((error) => {
            console.error("Error:", error);
            options.onError?.(error as Error);
          });
      } else {
        const res = await fetch(chatPath, chatPayload);
        clearTimeout(requestTimeoutId);

        const resJson = await res.json();

        if (resJson?.promptFeedback?.blockReason) {
          // being blocked
          options.onError?.(
            new Error(
              "Message is being blocked for reason: " +
                resJson.promptFeedback.blockReason,
            ),
          );
        }
        const message = this.extractMessage(resJson);
        options.onFinish(message);
      }
    } catch (e) {
      console.log("[Request] failed to make a chat request", e);
      options.onError?.(e as Error);
    }
  }
  usage(): Promise<LLMUsage> {
    throw new Error("Method not implemented.");
  }
  async models(): Promise<LLMModel[]> {
    return [];
  }
  path(path: string): string {
    const accessStore = useAccessStore.getState();
    const isGoogle =
      accessStore.useCustomConfig &&
      accessStore.provider === ServiceProvider.Google;

    if (isGoogle && !accessStore.isValidGoogle()) {
      throw Error(
        "incomplete google config, please check it in your settings page",
      );
    }

    let baseUrl = isGoogle ? accessStore.googleBaseUrl : ApiPath.GoogleAI;

    if (baseUrl.length === 0) {
      baseUrl = ApiPath.GoogleAI;
    }
    if (baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, baseUrl.length - 1);
    }
    if (!baseUrl.startsWith("http") && !baseUrl.startsWith(ApiPath.GoogleAI)) {
      baseUrl = "https://" + baseUrl;
    }

    return [baseUrl, path].join("/");
  }
}

function ensureProperEnding(str: string) {
  if (str.startsWith("[") && !str.endsWith("]")) {
    return str + "]";
  }
  return str;
}
