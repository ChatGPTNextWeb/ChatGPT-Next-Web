import { ModelConfig, ProviderConfig } from "@/app/store";
import { createLogger } from "@/app/utils/log";
import { getAuthKey } from "../common/auth";
import { API_PREFIX, AnthropicPath, ApiPath } from "@/app/constant";
import { getApiPath } from "@/app/utils/path";
import { trimEnd } from "@/app/utils/string";
import { Anthropic } from "./types";
import { ChatOptions, LLMModel, LLMUsage, RequestMessage } from "../types";
import { omit } from "@/app/utils/object";
import {
  EventStreamContentType,
  fetchEventSource,
} from "@fortaine/fetch-event-source";
import { prettyObject } from "@/app/utils/format";
import Locale from "@/app/locales";
import { AnthropicConfig } from "./config";

export function createAnthropicClient(
  providerConfigs: ProviderConfig,
  modelConfig: ModelConfig,
) {
  const anthropicConfig = { ...providerConfigs.anthropic };
  const logger = createLogger("[Anthropic]");
  const anthropicModelConfig = { ...modelConfig.anthropic };

  return {
    headers() {
      return {
        "Content-Type": "application/json",
        "x-api-key": getAuthKey(anthropicConfig.apiKey),
        "anthropic-version": anthropicConfig.version,
      };
    },

    path(path: AnthropicPath): string {
      let baseUrl: string = anthropicConfig.endpoint;

      // if endpoint is empty, use default endpoint
      if (baseUrl.trim().length === 0) {
        baseUrl = getApiPath(ApiPath.Anthropic);
      }

      if (!baseUrl.startsWith("http") && !baseUrl.startsWith(API_PREFIX)) {
        baseUrl = "https://" + baseUrl;
      }

      baseUrl = trimEnd(baseUrl, "/");

      return `${baseUrl}/${path}`;
    },

    extractMessage(res: Anthropic.ChatResponse) {
      return res.completion;
    },

    beforeRequest(options: ChatOptions, stream = false) {
      const ClaudeMapper: Record<RequestMessage["role"], string> = {
        assistant: "Assistant",
        user: "Human",
        system: "Human",
      };

      const prompt = options.messages
        .map((v) => ({
          role: ClaudeMapper[v.role] ?? "Human",
          content: v.content,
        }))
        .map((v) => `\n\n${v.role}: ${v.content}`)
        .join("");

      if (options.shouldSummarize) {
        anthropicModelConfig.model = anthropicModelConfig.summarizeModel;
      }

      const requestBody: Anthropic.ChatRequest = {
        prompt,
        stream,
        ...omit(anthropicModelConfig, "summarizeModel"),
      };

      const path = this.path(AnthropicPath.Chat);

      logger.log("path = ", path, requestBody);

      const controller = new AbortController();
      options.onController?.(controller);

      const payload = {
        method: "POST",
        body: JSON.stringify(requestBody),
        signal: controller.signal,
        headers: this.headers(),
        mode: "no-cors" as RequestMode,
      };

      return {
        path,
        payload,
        controller,
      };
    },

    async chat(options: ChatOptions) {
      try {
        const { path, payload, controller } = this.beforeRequest(
          options,
          false,
        );

        controller.signal.onabort = () => options.onFinish("");

        const res = await fetch(path, payload);
        const resJson = await res.json();

        const message = this.extractMessage(resJson);
        options.onFinish(message);
      } catch (e) {
        logger.error("failed to chat", e);
        options.onError?.(e as Error);
      }
    },

    async chatStream(options: ChatOptions) {
      try {
        const { path, payload, controller } = this.beforeRequest(options, true);

        const context = {
          text: "",
          finished: false,
        };

        const finish = () => {
          if (!context.finished) {
            options.onFinish(context.text);
            context.finished = true;
          }
        };

        controller.signal.onabort = finish;

        logger.log(payload);

        fetchEventSource(path, {
          ...payload,
          async onopen(res) {
            const contentType = res.headers.get("content-type");
            logger.log("response content type: ", contentType);

            if (contentType?.startsWith("text/plain")) {
              context.text = await res.clone().text();
              return finish();
            }

            if (
              !res.ok ||
              !res.headers
                .get("content-type")
                ?.startsWith(EventStreamContentType) ||
              res.status !== 200
            ) {
              const responseTexts = [context.text];
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

              context.text = responseTexts.join("\n\n");

              return finish();
            }
          },
          onmessage(msg) {
            if (msg.data === "[DONE]" || context.finished) {
              return finish();
            }
            const chunk = msg.data;
            try {
              const chunkJson = JSON.parse(
                chunk,
              ) as Anthropic.ChatStreamResponse;
              const delta = chunkJson.completion;
              if (delta) {
                context.text += delta;
                options.onUpdate?.(context.text, delta);
              }
            } catch (e) {
              logger.error("[Request] parse error", chunk, msg);
            }
          },
          onclose() {
            finish();
          },
          onerror(e) {
            options.onError?.(e);
          },
          openWhenHidden: true,
        });
      } catch (e) {
        logger.error("failed to chat", e);
        options.onError?.(e as Error);
      }
    },

    async usage() {
      return {
        used: 0,
        total: 0,
      } as LLMUsage;
    },

    async models(): Promise<LLMModel[]> {
      const customModels = anthropicConfig.customModels
        .split(",")
        .map((v) => v.trim())
        .filter((v) => !!v)
        .map((v) => ({
          name: v,
          available: true,
        }));

      return [...AnthropicConfig.provider.models.slice(), ...customModels];
    },
  };
}
