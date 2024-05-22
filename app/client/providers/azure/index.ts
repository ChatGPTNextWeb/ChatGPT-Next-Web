import {
  settingItems,
  SettingKeys,
  modelConfigs,
  AzureMetas,
  preferredRegion,
} from "./config";
import {
  ChatHandlers,
  InternalChatRequestPayload,
  IProviderTemplate,
  ModelInfo,
  getMessageTextContent,
  ServerConfig,
} from "../../common";
import {
  EventStreamContentType,
  fetchEventSource,
} from "@fortaine/fetch-event-source";
import Locale from "@/app/locales";
import {
  auth,
  authHeaderName,
  getHeaders,
  getTimer,
  makeAzurePath,
  parseResp,
  prettyObject,
} from "./utils";
import { NextRequest, NextResponse } from "next/server";

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

interface OpenAIListModelResponse {
  object: string;
  data: Array<{
    id: string;
    object: string;
    root: string;
  }>;
}

type ProviderTemplate = IProviderTemplate<
  SettingKeys,
  "azure",
  typeof AzureMetas
>;

export default class Azure implements ProviderTemplate {
  apiRouteRootName: "/api/provider/azure" = "/api/provider/azure";
  allowedApiMethods: (
    | "POST"
    | "GET"
    | "OPTIONS"
    | "PUT"
    | "PATCH"
    | "DELETE"
  )[] = ["POST", "GET"];
  runtime = "edge" as const;

  preferredRegion = preferredRegion;

  name = "azure" as const;
  metas = AzureMetas;

  defaultModels = modelConfigs;

  providerMeta = {
    displayName: "Azure",
    settingItems: settingItems(
      `${this.apiRouteRootName}/${AzureMetas.ChatPath}`,
    ),
  };

  private formatChatPayload(payload: InternalChatRequestPayload<SettingKeys>) {
    const {
      messages,
      isVisionModel,
      model,
      stream,
      modelConfig: {
        temperature,
        presence_penalty,
        frequency_penalty,
        top_p,
        max_tokens,
      },
      providerConfig: { azureUrl, azureApiVersion },
    } = payload;

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
      headers: getHeaders(payload.providerConfig.azureApiKey),
      body: JSON.stringify(requestPayload),
      method: "POST",
      url: `${azureUrl}?api-version=${azureApiVersion!}`,
    };
  }

  private async requestAzure(req: NextRequest, serverConfig: ServerConfig) {
    const controller = new AbortController();

    const authValue =
      req.headers
        .get("Authorization")
        ?.trim()
        .replaceAll("Bearer ", "")
        .trim() ?? "";

    const { azureUrl, azureApiVersion } = serverConfig;

    if (!azureUrl) {
      return NextResponse.json({
        error: true,
        message: `missing AZURE_URL in server env vars`,
      });
    }

    if (!azureApiVersion) {
      return NextResponse.json({
        error: true,
        message: `missing AZURE_API_VERSION in server env vars`,
      });
    }

    let path = `${req.nextUrl.pathname}${req.nextUrl.search}`.replaceAll(
      this.apiRouteRootName,
      "",
    );

    path = makeAzurePath(path, azureApiVersion);

    console.log("[Proxy] ", path);
    console.log("[Base Url]", azureUrl);

    const fetchUrl = `${azureUrl}/${path}`;

    const timeoutId = setTimeout(
      () => {
        controller.abort();
      },
      10 * 60 * 1000,
    );

    const fetchOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        [authHeaderName]: authValue,
      },
      method: req.method,
      body: req.body,
      // to fix #2485: https://stackoverflow.com/questions/55920957/cloudflare-worker-typeerror-one-time-use-body
      redirect: "manual",
      // @ts-ignore
      duplex: "half",
      signal: controller.signal,
    };

    try {
      const res = await fetch(fetchUrl, fetchOptions);

      // to prevent browser prompt for credentials
      const newHeaders = new Headers(res.headers);
      newHeaders.delete("www-authenticate");
      // to disable nginx buffering
      newHeaders.set("X-Accel-Buffering", "no");

      // The latest version of the OpenAI API forced the content-encoding to be "br" in json response
      // So if the streaming is disabled, we need to remove the content-encoding header
      // Because Vercel uses gzip to compress the response, if we don't remove the content-encoding header
      // The browser will try to decode the response with brotli and fail
      newHeaders.delete("content-encoding");

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

  async getAvailableModels(
    providerConfig: Record<SettingKeys, string>,
  ): Promise<ModelInfo[]> {
    const { azureApiKey, azureUrl } = providerConfig;
    const res = await fetch(`${azureUrl}/${AzureMetas.ListModelPath}`, {
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

  serverSideRequestHandler: ProviderTemplate["serverSideRequestHandler"] =
    async (req, config) => {
      const { subpath } = req;
      const ALLOWD_PATH = [AzureMetas.ChatPath];

      if (!ALLOWD_PATH.includes(subpath)) {
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
        const response = await this.requestAzure(req, config);

        return response;
      } catch (e) {
        return NextResponse.json(prettyObject(e));
      }
    };
}
