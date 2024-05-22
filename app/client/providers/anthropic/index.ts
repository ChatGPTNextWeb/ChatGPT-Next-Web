import {
  ANTHROPIC_BASE_URL,
  AnthropicMetas,
  ClaudeMapper,
  SettingKeys,
  modelConfigs,
  preferredRegion,
  settingItems,
} from "./config";
import {
  ChatHandlers,
  InternalChatRequestPayload,
  IProviderTemplate,
  ServerConfig,
} from "../../common";
import {
  EventStreamContentType,
  fetchEventSource,
} from "@fortaine/fetch-event-source";
import Locale from "@/app/locales";
import {
  prettyObject,
  getTimer,
  authHeaderName,
  auth,
  parseResp,
  formatMessage,
} from "./utils";
import { cloneDeep } from "lodash-es";
import { NextRequest, NextResponse } from "next/server";

export type AnthropicProviderSettingKeys = SettingKeys;

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

type ProviderTemplate = IProviderTemplate<
  SettingKeys,
  "anthropic",
  typeof AnthropicMetas
>;

export default class AnthropicProvider implements ProviderTemplate {
  apiRouteRootName = "/api/provider/anthropic" as const;
  allowedApiMethods: ["GET", "POST"] = ["GET", "POST"];

  runtime = "edge" as const;
  preferredRegion = preferredRegion;

  name = "anthropic" as const;

  metas = AnthropicMetas;

  providerMeta = {
    displayName: "Anthropic",
    settingItems: settingItems(
      `${this.apiRouteRootName}//${AnthropicMetas.ChatPath}`,
    ),
  };

  defaultModels = modelConfigs;

  private formatChatPayload(payload: InternalChatRequestPayload<SettingKeys>) {
    const {
      messages: outsideMessages,
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
    const messages = cloneDeep(outsideMessages);

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

    const prompt = formatMessage(messages, payload.isVisionModel);

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
        [authHeaderName]: anthropicApiKey ?? "",
        "anthropic-version": anthropicApiVersion ?? "",
      },
      body: JSON.stringify(requestBody),
      method: "POST",
      url: anthropicUrl!,
    };
  }

  private async request(req: NextRequest, serverConfig: ServerConfig) {
    const controller = new AbortController();

    const authValue = req.headers.get(authHeaderName) ?? "";

    const path = `${req.nextUrl.pathname}`.replaceAll(
      this.apiRouteRootName,
      "",
    );

    const baseUrl = serverConfig.anthropicUrl || ANTHROPIC_BASE_URL;

    console.log("[Proxy] ", path);
    console.log("[Base Url]", baseUrl);

    const timeoutId = setTimeout(
      () => {
        controller.abort();
      },
      10 * 60 * 1000,
    );

    const fetchUrl = `${baseUrl}${path}`;

    const fetchOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        [authHeaderName]: authValue,
        "anthropic-version":
          req.headers.get("anthropic-version") ||
          serverConfig.anthropicApiVersion ||
          AnthropicMetas.Vision,
      },
      method: req.method,
      body: req.body,
      redirect: "manual",
      // @ts-ignore
      duplex: "half",
      signal: controller.signal,
    };

    console.log("[Anthropic request]", fetchOptions.headers, req.method);
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
  }

  async chat(
    payload: InternalChatRequestPayload<SettingKeys>,
    fetch: typeof window.fetch,
  ) {
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

  streamChat(
    payload: InternalChatRequestPayload<SettingKeys>,
    handlers: ChatHandlers,
    fetch: typeof window.fetch,
  ) {
    const requestPayload = this.formatChatPayload(payload);
    const timer = getTimer();

    fetchEventSource(requestPayload.url, {
      ...requestPayload,
      fetch,
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

  serverSideRequestHandler: ProviderTemplate["serverSideRequestHandler"] =
    async (req, config) => {
      const { subpath } = req;
      const ALLOWD_PATH = [AnthropicMetas.ChatPath];

      if (!ALLOWD_PATH.includes(subpath)) {
        console.log("[Anthropic Route] forbidden path ", subpath);
        return NextResponse.json(
          {
            error: true,
            message: "you are not allowed to request " + subpath,
          },
          {
            status: 403,
          },
        );
      }

      const authResult = auth(req, config);

      if (authResult.error) {
        return NextResponse.json(authResult, {
          status: 401,
        });
      }

      try {
        const response = await this.request(req, config);
        return response;
      } catch (e) {
        console.error("[Anthropic] ", e);
        return NextResponse.json(prettyObject(e));
      }
    };
}
