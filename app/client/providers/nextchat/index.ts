import {
  modelConfigs,
  settingItems,
  SettingKeys,
  NextChatMetas,
} from "./config";
import { ACCESS_CODE_PREFIX } from "@/app/constant";
import {
  ChatHandlers,
  getMessageTextContent,
  InternalChatRequestPayload,
  IProviderTemplate,
  StandChatReponseMessage,
} from "../../common";
import {
  EventStreamContentType,
  fetchEventSource,
} from "@fortaine/fetch-event-source";
import { prettyObject } from "@/app/utils/format";
import Locale from "@/app/locales";
import { makeBearer, validString } from "./utils";

export type NextChatProviderSettingKeys = SettingKeys;

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

export default class NextChatProvider
  implements IProviderTemplate<SettingKeys, "nextchat", typeof NextChatMetas>
{
  name = "nextchat" as const;
  metas = NextChatMetas;

  defaultModels = modelConfigs;

  providerMeta = {
    displayName: "NextChat",
    settingItems,
  };

  readonly REQUEST_TIMEOUT_MS = 60000;

  private path(): string {
    const path = NextChatMetas.ChatPath;

    let baseUrl = "/api/openai";

    console.log("[Proxy Endpoint] ", baseUrl, path);

    return [baseUrl, path].join("/");
  }

  private getHeaders(payload: InternalChatRequestPayload<SettingKeys>) {
    const { accessCode } = payload.providerConfig;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (validString(accessCode)) {
      headers["Authorization"] = makeBearer(ACCESS_CODE_PREFIX + accessCode);
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
      url: this.path(),
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

  async chat(
    payload: InternalChatRequestPayload<"accessCode">,
  ): Promise<StandChatReponseMessage> {
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
}
