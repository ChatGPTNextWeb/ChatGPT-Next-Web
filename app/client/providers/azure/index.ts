import { settingItems, SettingKeys, modelConfigs, AzureMetas } from "./config";
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
import { makeAzurePath, makeBearer, prettyObject, validString } from "./utils";

export type AzureProviderSettingKeys = SettingKeys;

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

interface ModelList {
  object: "list";
  data: Array<{
    capabilities: {
      fine_tune: boolean;
      inference: boolean;
      completion: boolean;
      chat_completion: boolean;
      embeddings: boolean;
    };
    lifecycle_status: "generally-available";
    id: string;
    created_at: number;
    object: "model";
  }>;
}

export default class Azure
  implements IProviderTemplate<SettingKeys, "azure", typeof AzureMetas>
{
  name = "azure" as const;
  metas = AzureMetas;

  defaultModels = modelConfigs;

  providerMeta = {
    displayName: "Azure",
    settingItems,
  };

  readonly REQUEST_TIMEOUT_MS = 60000;

  private path(payload: InternalChatRequestPayload<SettingKeys>): string {
    const {
      providerConfig: { azureUrl, azureApiVersion },
    } = payload;
    const path = makeAzurePath(AzureMetas.ChatPath, azureApiVersion!);

    console.log("[Proxy Endpoint] ", azureUrl, path);

    return [azureUrl!, path].join("/");
  }

  private getHeaders(payload: InternalChatRequestPayload<SettingKeys>) {
    const { azureApiKey } = payload.providerConfig;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (validString(azureApiKey)) {
      headers["Authorization"] = makeBearer(azureApiKey);
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

    clearTimeout(requestTimeoutId);

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
    const { azureApiKey, azureUrl } = providerConfig;
    const res = await fetch(`${azureUrl}/vi/models`, {
      headers: {
        Authorization: `Bearer ${azureApiKey}`,
      },
      method: "GET",
    });
    const data: ModelList = await res.json();

    return data.data.map((o) => ({
      name: o.id,
    }));
  }
}
