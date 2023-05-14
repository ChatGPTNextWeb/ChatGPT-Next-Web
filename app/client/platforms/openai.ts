import { REQUEST_TIMEOUT_MS } from "@/app/constant";
import { useAccessStore, useAppConfig, useChatStore } from "@/app/store";
import {
  EventStreamContentType,
  fetchEventSource,
} from "@microsoft/fetch-event-source";
import { ChatOptions, LLMApi, LLMUsage } from "../api";

export class ChatGPTApi implements LLMApi {
  public ChatPath = "v1/chat/completions";

  path(path: string): string {
    const openaiUrl = useAccessStore.getState().openaiUrl;
    if (openaiUrl.endsWith("/")) openaiUrl.slice(0, openaiUrl.length - 1);
    return [openaiUrl, path].join("/");
  }

  extractMessage(res: any) {
    return res.choices?.at(0)?.message?.content ?? "";
  }

  async chat(options: ChatOptions) {
    const messages = options.messages.map((v) => ({
      role: v.role,
      content: v.content,
    }));

    const modelConfig = {
      ...useAppConfig.getState().modelConfig,
      ...useChatStore.getState().currentSession().mask.modelConfig,
      ...{
        model: options.model,
      },
    };

    const requestPayload = {
      messages,
      stream: options.config.stream,
      model: modelConfig.model,
      temperature: modelConfig.temperature,
      presence_penalty: modelConfig.presence_penalty,
    };

    console.log("[Request] openai payload: ", requestPayload);

    const shouldStream = !!options.config.stream;
    const controller = new AbortController();

    try {
      const chatPath = this.path(this.ChatPath);
      const chatPayload = {
        method: "POST",
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
      };

      // make a fetch request
      const reqestTimeoutId = setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT_MS,
      );
      if (shouldStream) {
        let responseText = "";

        fetchEventSource(chatPath, {
          ...chatPayload,
          async onopen(res) {
            if (
              res.ok &&
              res.headers.get("Content-Type") === EventStreamContentType
            ) {
              return;
            }

            if (res.status === 401) {
              // TODO: Unauthorized 401
              responseText += "\n\n";
            } else if (res.status !== 200) {
              console.error("[Request] response", res);
              throw new Error("[Request] server error");
            }
          },
          onmessage: (ev) => {
            if (ev.data === "[DONE]") {
              return options.onFinish(responseText);
            }
            try {
              const resJson = JSON.parse(ev.data);
              const message = this.extractMessage(resJson);
              responseText += message;
              options.onUpdate(responseText, message);
            } catch (e) {
              console.error("[Request] stream error", e);
              options.onError(e as Error);
            }
          },
          onclose() {
            options.onError(new Error("stream closed unexpected"));
          },
          onerror(err) {
            options.onError(err);
          },
        });
      } else {
        const res = await fetch(chatPath, chatPayload);

        const resJson = await res.json();
        const message = this.extractMessage(resJson);
        options.onFinish(message);
      }

      clearTimeout(reqestTimeoutId);
    } catch (e) {
      console.log("[Request] failed to make a chat reqeust", e);
      options.onError(e as Error);
    }
  }
  async usage() {
    return {
      used: 0,
      total: 0,
    } as LLMUsage;
  }
}
