import {
  ChatHandlers,
  InternalChatRequestPayload,
  IProviderTemplate,
  ModelInfo,
  getMessageTextContent,
} from "../../common";
import {
  EventStreamContentType,
  fetchEventSource,
} from "@fortaine/fetch-event-source";
import Locale from "@/app/locales";
import { makeBearer, validString, prettyObject } from "./utils";
import {
  modelConfigs,
  settingItems,
  SettingKeys,
  OpenaiMetas,
  ROLES,
} from "./config";

export type OpenAIProviderSettingKeys = SettingKeys;

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

interface ModelList {
  object: "list";
  data: Array<{
    id: string;
    object: "model";
    created: number;
    owned_by: "system" | "openai-internal";
  }>;
}

class OpenAIProvider
  implements IProviderTemplate<SettingKeys, "openai", typeof OpenaiMetas>
{
  name = "openai" as const;
  metas = OpenaiMetas;

  readonly REQUEST_TIMEOUT_MS = 60000;

  defaultModels = modelConfigs;

  providerMeta = {
    displayName: "OpenAI",
    settingItems,
  };

  private path(payload: InternalChatRequestPayload<SettingKeys>): string {
    const {
      providerConfig: { openaiUrl },
    } = payload;
    const path = OpenaiMetas.ChatPath;

    console.log("[Proxy Endpoint] ", openaiUrl, path);

    return [openaiUrl, path].join("/");
  }

  private getHeaders(payload: InternalChatRequestPayload<SettingKeys>) {
    const { openaiApiKey } = payload.providerConfig;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (validString(openaiApiKey)) {
      headers["Authorization"] = makeBearer(openaiApiKey);
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

  private readWholeMessageResponseBody(res: {
    choices: { message: { content: any } }[];
  }) {
    return {
      message: res.choices?.[0]?.message?.content ?? "",
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
    handlers: ChatHandlers,
  ) {
    const requestPayload = this.formatChatPayload(payload);

    const timer = this.getTimer();

    fetchEventSource(requestPayload.url, {
      ...requestPayload,
      async onopen(res) {
        timer.clear();
        const contentType = res.headers.get("content-type");
        console.log("[OpenAI] request response content type: ", contentType);

        if (contentType?.startsWith("text/plain")) {
          const responseText = await res.clone().text();
          return handlers.onFlash(responseText);
        }

        if (
          !res.ok ||
          !res.headers
            .get("content-type")
            ?.startsWith(EventStreamContentType) ||
          res.status !== 200
        ) {
          const responseTexts = [];
          if (res.status === 401) {
            responseTexts.push(Locale.Error.Unauthorized);
          }

          let extraInfo = await res.clone().text();
          try {
            const resJson = await res.clone().json();
            extraInfo = prettyObject(resJson);
          } catch {}

          if (extraInfo) {
            responseTexts.push(extraInfo);
          }

          const responseText = responseTexts.join("\n\n");

          return handlers.onFlash(responseText);
        }
      },
      onmessage(msg) {
        if (msg.data === "[DONE]") {
          return;
        }
        const text = msg.data;
        try {
          const json = JSON.parse(text);
          const choices = json.choices as Array<{
            delta: { content: string };
          }>;
          const delta = choices[0]?.delta?.content;

          if (delta) {
            handlers.onProgress(delta);
          }
        } catch (e) {
          console.error("[Request] parse error", text, msg);
        }
      },
      onclose() {
        handlers.onFinish();
      },
      onerror(e) {
        handlers.onError(e);
        throw e;
      },
      openWhenHidden: true,
    });

    return timer;
  }

  async getAvailableModels(
    providerConfig: Record<SettingKeys, string>,
  ): Promise<ModelInfo[]> {
    const { openaiApiKey, openaiUrl } = providerConfig;
    const res = await fetch(`${openaiUrl}/vi/models`, {
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
      },
      method: "GET",
    });
    const data: ModelList = await res.json();

    return data.data.map((o) => ({
      name: o.id,
    }));
  }
}

export default OpenAIProvider;
