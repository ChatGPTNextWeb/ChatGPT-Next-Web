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
  authHeaderName,
  prettyObject,
  parseResp,
  auth,
  getTimer,
  getHeaders,
} from "./utils";
import {
  modelConfigs,
  settingItems,
  SettingKeys,
  OpenaiMetas,
  ROLES,
  OPENAI_BASE_URL,
  preferredRegion,
} from "./config";
import { NextRequest, NextResponse } from "next/server";
import { ModelList } from "./type";

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

type ProviderTemplate = IProviderTemplate<
  SettingKeys,
  "azure",
  typeof OpenaiMetas
>;

class OpenAIProvider
  implements IProviderTemplate<SettingKeys, "openai", typeof OpenaiMetas>
{
  apiRouteRootName: "/api/provider/openai" = "/api/provider/openai";
  allowedApiMethods: (
    | "POST"
    | "GET"
    | "OPTIONS"
    | "PUT"
    | "PATCH"
    | "DELETE"
  )[] = ["GET", "POST"];
  runtime = "edge" as const;
  preferredRegion = preferredRegion;

  name = "openai" as const;
  metas = OpenaiMetas;

  defaultModels = modelConfigs;

  providerMeta = {
    displayName: "OpenAI",
    settingItems: settingItems(
      `${this.apiRouteRootName}/${OpenaiMetas.ChatPath}`,
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
      providerConfig: { openaiUrl },
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
      headers: getHeaders(payload.providerConfig.openaiApiKey),
      body: JSON.stringify(requestPayload),
      method: "POST",
      url: openaiUrl!,
    };
  }

  private async requestOpenai(req: NextRequest, serverConfig: ServerConfig) {
    const { baseUrl = OPENAI_BASE_URL, openaiOrgId } = serverConfig;
    const controller = new AbortController();
    const authValue = req.headers.get(authHeaderName) ?? "";

    const path = `${req.nextUrl.pathname}${req.nextUrl.search}`.replaceAll(
      this.apiRouteRootName,
      "",
    );

    console.log("[Proxy] ", path);
    console.log("[Base Url]", baseUrl);

    const timeoutId = setTimeout(
      () => {
        controller.abort();
      },
      10 * 60 * 1000,
    );

    const fetchUrl = `${baseUrl}/${path}`;
    const fetchOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        [authHeaderName]: authValue,
        ...(openaiOrgId && {
          "OpenAI-Organization": openaiOrgId,
        }),
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

      // Extract the OpenAI-Organization header from the response
      const openaiOrganizationHeader = res.headers.get("OpenAI-Organization");

      // Check if serverConfig.openaiOrgId is defined and not an empty string
      if (openaiOrgId && openaiOrgId.trim() !== "") {
        // If openaiOrganizationHeader is present, log it; otherwise, log that the header is not present
        console.log("[Org ID]", openaiOrganizationHeader);
      } else {
        console.log("[Org ID] is not set up.");
      }

      // to prevent browser prompt for credentials
      const newHeaders = new Headers(res.headers);
      newHeaders.delete("www-authenticate");
      // to disable nginx buffering
      newHeaders.set("X-Accel-Buffering", "no");

      // Conditionally delete the OpenAI-Organization header from the response if [Org ID] is undefined or empty (not setup in ENV)
      // Also, this is to prevent the header from being sent to the client
      if (!openaiOrgId || openaiOrgId.trim() === "") {
        newHeaders.delete("OpenAI-Organization");
      }

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
    const { openaiApiKey, openaiUrl } = providerConfig;
    const res = await fetch(`${openaiUrl}/v1/models`, {
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

  serverSideRequestHandler: ProviderTemplate["serverSideRequestHandler"] =
    async (req, config) => {
      const { subpath } = req;
      const ALLOWD_PATH = new Set(Object.values(OpenaiMetas));

      if (!ALLOWD_PATH.has(subpath)) {
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
        const response = await this.requestOpenai(req, config);

        return response;
      } catch (e) {
        return NextResponse.json(prettyObject(e));
      }
    };
}

export default OpenAIProvider;
