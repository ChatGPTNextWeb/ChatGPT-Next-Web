import { getMessageTextContent } from "@/app/utils";
import {
  AnthropicMetas,
  SettingKeys,
  modelConfigs,
  settingItems,
} from "./config";
import {
  InternalChatRequestPayload,
  IProviderTemplate,
} from "../../core/types";
import {
  EventStreamContentType,
  fetchEventSource,
} from "@fortaine/fetch-event-source";
import Locale from "@/app/locales";
import { prettyObject } from "@/app/utils/format";

export type AnthropicProviderSettingKeys = SettingKeys;

const ClaudeMapper = {
  assistant: "assistant",
  user: "user",
  system: "user",
} as const;

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

export default class AnthropicProvider
  implements IProviderTemplate<SettingKeys, "anthropic", typeof AnthropicMetas>
{
  name = "anthropic" as const;

  metas = AnthropicMetas;

  providerMeta = {
    displayName: "Anthropic",
    settingItems,
  };

  models = modelConfigs.map((c) => ({ ...c, providerTemplateName: this.name }));

  readonly REQUEST_TIMEOUT_MS = 60000;

  private path(payload: InternalChatRequestPayload<SettingKeys>) {
    const {
      providerConfig: { anthropicUrl },
      context: { isApp },
    } = payload;

    let baseUrl: string = anthropicUrl;

    // if endpoint is empty, use default endpoint
    if (baseUrl.trim().length === 0) {
      baseUrl = "/api/anthropic";
    }

    if (!baseUrl.startsWith("http") && !baseUrl.startsWith("/api")) {
      baseUrl = "https://" + baseUrl;
    }

    baseUrl = trimEnd(baseUrl, "/");

    return `${baseUrl}/${AnthropicMetas.ChatPath}`;
  }

  private formatChatPayload(payload: InternalChatRequestPayload<SettingKeys>) {
    const {
      messages,
      isVisionModel,
      model,
      stream,
      modelConfig,
      providerConfig,
    } = payload;
    const { anthropicApiKey, anthropicApiVersion, anthropicUrl } =
      providerConfig;
    const { temperature, top_p, max_tokens } = modelConfig;

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

        if (!isVisionModel || typeof content === "string") {
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

    const requestBody: AnthropicChatRequest = {
      messages: prompt,
      stream,
      model,
      max_tokens,
      temperature,
      top_p,
      top_k: 5,
    };

    return {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": anthropicApiKey ?? "",
        "anthropic-version": anthropicApiVersion,
        Authorization: getAuthKey(anthropicApiKey),
      },
      body: JSON.stringify(requestBody),
      method: "POST",
      url: this.path(payload),
    };
  }
  private readWholeMessageResponseBody(res: any) {
    return {
      message: res?.content?.[0]?.text ?? "",
    };
  }

  private getTimer = (onabort: () => void = () => {}) => {
    const controller = new AbortController();

    // make a fetch request
    const requestTimeoutId = setTimeout(
      () => controller.abort(),
      this.REQUEST_TIMEOUT_MS,
    );

    controller.signal.onabort = onabort;

    return {
      ...controller,
      clear: () => {
        clearTimeout(requestTimeoutId);
      },
    };
  };

  async chat(payload: InternalChatRequestPayload<SettingKeys>) {
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

    timer.clear();

    const resJson = await res.json();
    const message = this.readWholeMessageResponseBody(resJson);

    return message;
  }

  streamChat(
    payload: InternalChatRequestPayload<SettingKeys>,
    onProgress: (message: string, chunk: string) => void,
    onFinish: (message: string) => void,
    onError: (err: Error) => void,
  ) {
    const requestPayload = this.formatChatPayload(payload);

    let responseText = "";
    let remainText = "";
    let finished = false;

    const timer = this.getTimer();

    // animate response to make it looks smooth
    const animateResponseText = () => {
      if (finished || timer.signal.aborted) {
        responseText += remainText;
        console.log("[Response Animation] finished");
        if (responseText?.length === 0) {
          onError(new Error("empty response from server"));
        }
        return;
      }

      if (remainText.length > 0) {
        const fetchCount = Math.max(1, Math.round(remainText.length / 60));
        const fetchText = remainText.slice(0, fetchCount);
        responseText += fetchText;
        remainText = remainText.slice(fetchCount);
        onProgress(responseText, fetchText);
      }

      requestAnimationFrame(animateResponseText);
    };

    // start animaion
    animateResponseText();

    const finish = () => {
      if (!finished) {
        finished = true;
        onFinish(responseText + remainText);
      }
    };

    fetchEventSource(requestPayload.url, {
      ...requestPayload,
      async onopen(res) {
        timer.clear();
        const contentType = res.headers.get("content-type");
        console.log("[OpenAI] request response content type: ", contentType);

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
      },
      onmessage(msg) {
        if (msg.data === "[DONE]" || finished) {
          return finish();
        }
        const text = msg.data;
        try {
          const json = JSON.parse(text);
          const choices = json.choices as Array<{
            delta: { content: string };
          }>;
          const delta = choices[0]?.delta?.content;
          const textmoderation = json?.prompt_filter_results;

          if (delta) {
            remainText += delta;
          }
        } catch (e) {
          console.error("[Request] parse error", text, msg);
        }
      },
      onclose() {
        finish();
      },
      onerror(e) {
        onError(e);
        throw e;
      },
      openWhenHidden: true,
    });

    return timer;
  }
}

function trimEnd(s: string, end = " ") {
  if (end.length === 0) return s;

  while (s.endsWith(end)) {
    s = s.slice(0, -end.length);
  }

  return s;
}

function bearer(value: string) {
  return `Bearer ${value.trim()}`;
}

function getAuthKey(apiKey = "") {
  let authKey = "";

  if (apiKey) {
    // use user's api key first
    authKey = bearer(apiKey);
  }

  return authKey;
}
