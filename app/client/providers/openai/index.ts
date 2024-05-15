import { modelConfigs, settingItems, SettingKeys, OpenaiMetas } from "./config";
import { getMessageTextContent } from "@/app/utils";
import {
  InternalChatRequestPayload,
  IProviderTemplate,
} from "../../core/types";
import {
  EventStreamContentType,
  fetchEventSource,
} from "@fortaine/fetch-event-source";
import { prettyObject } from "@/app/utils/format";
import Locale from "@/app/locales";

export type OpenAIProviderSettingKeys = SettingKeys;

export const ROLES = ["system", "user", "assistant"] as const;
export type MessageRole = (typeof ROLES)[number];

export interface MultimodalContent {
  type: "text" | "image_url";
  text?: string;
  image_url?: {
    url: string;
  };
}

export interface RequestMessage {
  role: MessageRole;
  content: string | MultimodalContent[];
}

interface RequestPayload {
  messages: {
    role: "system" | "user" | "assistant";
    content: string | MultimodalContent[];
  }[];
  stream?: boolean;
  model: string;
  temperature: number;
  presence_penalty: number;
  frequency_penalty: number;
  top_p: number;
  max_tokens?: number;
}

class OpenAIProvider
  implements IProviderTemplate<SettingKeys, "openai", typeof OpenaiMetas>
{
  name = "openai" as const;
  metas = OpenaiMetas;

  readonly REQUEST_TIMEOUT_MS = 60000;

  models = modelConfigs.map((c) => ({ ...c, providerTemplateName: this.name }));

  providerMeta = {
    displayName: "OpenAI",
    settingItems,
  };

  private path(payload: InternalChatRequestPayload<SettingKeys>): string {
    const {
      providerConfig: { openaiUrl },
    } = payload;

    const path = OpenaiMetas.ChatPath;

    let baseUrl = openaiUrl;

    if (!baseUrl) {
      baseUrl = "/api/openai";
    }

    if (baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, baseUrl.length - 1);
    }
    if (!baseUrl.startsWith("http") && !baseUrl.startsWith("/api/openai")) {
      baseUrl = "https://" + baseUrl;
    }

    console.log("[Proxy Endpoint] ", baseUrl, path);

    return [baseUrl, path].join("/");
  }

  private getHeaders(payload: InternalChatRequestPayload<SettingKeys>) {
    const { openaiApiKey } = payload.providerConfig;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    const authHeader = "Authorization";

    const makeBearer = (s: string) => `Bearer ${s.trim()}`;
    const validString = (x?: string): x is string => Boolean(x && x.length > 0);

    // when using google api in app, not set auth header
    if (validString(openaiApiKey)) {
      headers[authHeader] = makeBearer(openaiApiKey);
    }

    return headers;
  }

  private formatChatPayload(payload: InternalChatRequestPayload<SettingKeys>) {
    const { messages, isVisionModel, model, stream, modelConfig } = payload;
    const {
      temperature,
      presence_penalty,
      frequency_penalty,
      top_p,
      max_tokens,
    } = modelConfig;

    const openAiMessages = messages.map((v) => ({
      role: v.role,
      content: isVisionModel ? v.content : getMessageTextContent(v),
    }));

    const requestPayload: RequestPayload = {
      messages: openAiMessages,
      stream,
      model,
      temperature,
      presence_penalty,
      frequency_penalty,
      top_p,
    };

    // add max_tokens to vision model
    if (isVisionModel) {
      requestPayload["max_tokens"] = Math.max(max_tokens, 4000);
    }

    console.log("[Request] openai payload: ", requestPayload);

    return {
      headers: this.getHeaders(payload),
      body: JSON.stringify(requestPayload),
      method: "POST",
      url: this.path(payload),
    };
  }

  private readWholeMessageResponseBody(res: any) {
    return {
      message: res.choices?.at(0)?.message?.content ?? "",
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

  async chat(payload: InternalChatRequestPayload<SettingKeys>) {
    const requestPayload = this.formatChatPayload(payload);

    const timer = this.getTimer();

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

    const timer = this.getTimer();

    let responseText = "";
    let remainText = "";
    let finished = false;

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

    timer.signal.onabort = finish;

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

export default OpenAIProvider;
