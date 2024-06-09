import {
  SettingKeys,
  modelConfigs,
  settingItems,
  GoogleMetas,
  GEMINI_BASE_URL,
  preferredRegion,
} from "./config";
import {
  ChatHandlers,
  InternalChatRequestPayload,
  IProviderTemplate,
  ModelInfo,
  StandChatReponseMessage,
  getMessageTextContent,
  getMessageImages,
} from "../../common";
import {
  auth,
  ensureProperEnding,
  getTimer,
  parseResp,
  urlParamApikeyName,
} from "./utils";
import { NextResponse } from "next/server";

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

type ProviderTemplate = IProviderTemplate<
  SettingKeys,
  "azure",
  typeof GoogleMetas
>;

export default class GoogleProvider
  implements IProviderTemplate<SettingKeys, "google", typeof GoogleMetas>
{
  allowedApiMethods: (
    | "POST"
    | "GET"
    | "OPTIONS"
    | "PUT"
    | "PATCH"
    | "DELETE"
  )[] = ["GET", "POST"];
  runtime = "edge" as const;

  apiRouteRootName: "/api/provider/google" = "/api/provider/google";

  preferredRegion = preferredRegion;

  name = "google" as const;
  metas = GoogleMetas;

  providerMeta = {
    displayName: "Google",
    settingItems: settingItems(this.apiRouteRootName),
  };
  defaultModels = modelConfigs;

  private formatChatPayload(payload: InternalChatRequestPayload<SettingKeys>) {
    const {
      messages,
      isVisionModel,
      model,
      stream,
      modelConfig,
      providerConfig,
    } = payload;
    const { googleUrl, googleApiKey } = providerConfig;
    const { temperature, top_p, max_tokens } = modelConfig;

    const internalMessages = messages.map((v) => {
      let parts: any[] = [{ text: getMessageTextContent(v) }];

      if (isVisionModel) {
        const images = getMessageImages(v);
        if (images.length > 0) {
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

    const baseUrl = `${googleUrl}/${GoogleMetas.ChatPath(
      model,
    )}?${urlParamApikeyName}=${googleApiKey}`;

    return {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestPayload),
      method: "POST",
      url: stream
        ? baseUrl.replace("generateContent", "streamGenerateContent")
        : baseUrl,
    };
  }

  streamChat(
    payload: InternalChatRequestPayload<SettingKeys>,
    handlers: ChatHandlers,
    fetch: typeof window.fetch,
  ) {
    const requestPayload = this.formatChatPayload(payload);

    const timer = getTimer();

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
    fetch: typeof window.fetch,
  ): Promise<StandChatReponseMessage> {
    const requestPayload = this.formatChatPayload(payload);
    const timer = getTimer();

    const res = await fetch(requestPayload.url, {
      headers: {
        ...requestPayload.headers,
      },
      body: requestPayload.body,
      method: requestPayload.method,
      signal: timer.signal,
    });

    timer.clear();

    const resJson = await res.json();
    const message = parseResp(resJson);

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

  serverSideRequestHandler: ProviderTemplate["serverSideRequestHandler"] =
    async (req, serverConfig) => {
      const { googleUrl = GEMINI_BASE_URL } = serverConfig;

      const controller = new AbortController();

      const path = `${req.nextUrl.pathname}`.replaceAll(
        this.apiRouteRootName,
        "",
      );

      console.log("[Proxy] ", path);
      console.log("[Base Url]", googleUrl);

      const authResult = auth(req, serverConfig);
      if (authResult.error) {
        return NextResponse.json(authResult, {
          status: 401,
        });
      }

      const fetchUrl = `${googleUrl}/${path}?key=${authResult.apiKey}`;
      const fetchOptions: RequestInit = {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
        method: req.method,
        body: req.body,
        // to fix #2485: https://stackoverflow.com/questions/55920957/cloudflare-worker-typeerror-one-time-use-body
        redirect: "manual",
        // @ts-ignore
        duplex: "half",
        signal: controller.signal,
      };

      const timeoutId = setTimeout(
        () => {
          controller.abort();
        },
        10 * 60 * 1000,
      );

      try {
        const res = await fetch(fetchUrl, fetchOptions);
        // to prevent browser prompt for credentials
        const newHeaders = new Headers(res.headers);
        newHeaders.delete("www-authenticate");
        // to disable nginx buffering
        newHeaders.set("X-Accel-Buffering", "no");

        return new NextResponse(res.body, {
          status: res.status,
          statusText: res.statusText,
          headers: newHeaders,
        });
      } finally {
        clearTimeout(timeoutId);
      }
    };
}
