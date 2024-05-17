import { SettingKeys, modelConfigs, settingItems, GoogleMetas } from "./config";
import {
  ChatHandlers,
  InternalChatRequestPayload,
  IProviderTemplate,
  ModelInfo,
  StandChatReponseMessage,
  getMessageTextContent,
  getMessageImages,
} from "../../common";
import { ensureProperEnding, makeBearer, validString } from "./utils";

export type GoogleProviderSettingKeys = SettingKeys;

interface ModelList {
  models: Array<{
    name: string;
    baseModelId: string;
    version: string;
    displayName: string;
    description: string;
    inputTokenLimit: number; // Integer
    outputTokenLimit: number; // Integer
    supportedGenerationMethods: [string];
    temperature: number;
    topP: number;
    topK: number; // Integer
  }>;
  nextPageToken: string;
}

export default class GoogleProvider
  implements IProviderTemplate<SettingKeys, "google", typeof GoogleMetas>
{
  name = "google" as const;
  metas = GoogleMetas;

  providerMeta = {
    displayName: "Google",
    settingItems,
  };
  defaultModels = modelConfigs;

  readonly REQUEST_TIMEOUT_MS = 60000;

  private getHeaders(payload: InternalChatRequestPayload<SettingKeys>) {
    const {
      providerConfig: { googleApiKey },
      context: { isApp },
    } = payload;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (!isApp && validString(googleApiKey)) {
      headers["Authorization"] = makeBearer(googleApiKey);
    }

    return headers;
  }

  private formatChatPayload(payload: InternalChatRequestPayload<SettingKeys>) {
    const {
      messages,
      isVisionModel,
      model,
      stream,
      modelConfig,
      providerConfig,
      context: { isApp },
    } = payload;
    const { googleUrl, googleApiKey } = providerConfig;
    const { temperature, top_p, max_tokens } = modelConfig;

    let multimodal = false;
    const internalMessages = messages.map((v) => {
      let parts: any[] = [{ text: getMessageTextContent(v) }];

      if (isVisionModel) {
        const images = getMessageImages(v);
        if (images.length > 0) {
          multimodal = true;
          parts = parts.concat(
            images.map((image) => {
              const imageType = image.split(";")[0].split(":")[1];
              const imageData = image.split(",")[1];
              return {
                inline_data: {
                  mime_type: imageType,
                  data: imageData,
                },
              };
            }),
          );
        }
      }
      return {
        role: v.role.replace("assistant", "model").replace("system", "user"),
        parts: parts,
      };
    });

    // google requires that role in neighboring messages must not be the same
    for (let i = 0; i < internalMessages.length - 1; ) {
      // Check if current and next item both have the role "model"
      if (internalMessages[i].role === internalMessages[i + 1].role) {
        // Concatenate the 'parts' of the current and next item
        internalMessages[i].parts = internalMessages[i].parts.concat(
          internalMessages[i + 1].parts,
        );
        // Remove the next item
        internalMessages.splice(i + 1, 1);
      } else {
        // Move to the next item
        i++;
      }
    }

    const requestPayload = {
      contents: internalMessages,
      generationConfig: {
        temperature,
        maxOutputTokens: max_tokens,
        topP: top_p,
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

    let googleChatPath = GoogleMetas.ChatPath(model);

    let baseUrl = googleUrl ?? "/api/google/" + googleChatPath;

    if (isApp) {
      baseUrl += `?key=${googleApiKey}`;
    }

    return {
      headers: this.getHeaders(payload),
      body: JSON.stringify(requestPayload),
      method: "POST",
      url: stream
        ? baseUrl.replace("generateContent", "streamGenerateContent")
        : baseUrl,
    };
  }
  private readWholeMessageResponseBody(res: any) {
    if (res?.promptFeedback?.blockReason) {
      // being blocked
      throw new Error(
        "Message is being blocked for reason: " +
          res.promptFeedback.blockReason,
      );
    }
    return {
      message:
        res.candidates?.at(0)?.content?.parts?.at(0)?.text ||
        res.error?.message ||
        "",
    };
  }

  private getTimer = () => {
    const controller = new AbortController();

    // make a fetch request
    const requestTimeoutId = setTimeout(
      () => controller.abort(),
      this.REQUEST_TIMEOUT_MS,
    );

    return {
      ...controller,
      clear: () => {
        clearTimeout(requestTimeoutId);
      },
    };
  };

  streamChat(
    payload: InternalChatRequestPayload<SettingKeys>,
    handlers: ChatHandlers,
  ) {
    const requestPayload = this.formatChatPayload(payload);

    const timer = this.getTimer();

    let existingTexts: string[] = [];

    fetch(requestPayload.url, {
      ...requestPayload,
      signal: timer.signal,
    })
      .then((response) => {
        const reader = response?.body?.getReader();
        const decoder = new TextDecoder();
        let partialData = "";

        return reader?.read().then(function processText({
          done,
          value,
        }): Promise<any> {
          if (done) {
            if (response.status !== 200) {
              try {
                let data = JSON.parse(ensureProperEnding(partialData));
                if (data && data[0].error) {
                  handlers.onError(new Error(data[0].error.message));
                } else {
                  handlers.onError(new Error("Request failed"));
                }
              } catch (_) {
                handlers.onError(new Error("Request failed"));
              }
            }

            console.log("Stream complete");
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
              handlers.onProgress(deltaArray.join(""));
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
      });
    return timer;
  }

  async chat(
    payload: InternalChatRequestPayload<SettingKeys>,
  ): Promise<StandChatReponseMessage> {
    const requestPayload = this.formatChatPayload(payload);
    const timer = this.getTimer();

    // make a fetch request
    const requestTimeoutId = setTimeout(
      () => timer.abort(),
      this.REQUEST_TIMEOUT_MS,
    );

    const res = await fetch(requestPayload.url, {
      headers: {
        ...requestPayload.headers,
      },
      body: requestPayload.body,
      method: requestPayload.method,
      signal: timer.signal,
    });

    clearTimeout(requestTimeoutId);

    const resJson = await res.json();
    const message = this.readWholeMessageResponseBody(resJson);

    return message;
  }

  async getAvailableModels(
    providerConfig: Record<SettingKeys, string>,
  ): Promise<ModelInfo[]> {
    const { googleApiKey, googleUrl } = providerConfig;
    const res = await fetch(`${googleUrl}/v1beta/models?key=${googleApiKey}`, {
      headers: {
        Authorization: `Bearer ${googleApiKey}`,
      },
      method: "GET",
    });
    const data: ModelList = await res.json();

    return data.models;
  }
}
