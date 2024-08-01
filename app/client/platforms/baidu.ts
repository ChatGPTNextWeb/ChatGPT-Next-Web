"use client";
import { ApiPath, Baidu, BAIDU_BASE_URL } from "@/app/constant";
import { useAccessStore, useAppConfig, useChatStore } from "@/app/store";
import { getAccessToken } from "@/app/utils/baidu";
import { ChatCompletion } from "@baiducloud/qianfan";

import { ChatOptions, LLMApi, LLMModel, MultimodalContent } from "../api";
import { getClientConfig } from "@/app/config/client";
import { getMessageTextContent } from "@/app/utils";

export interface OpenAIListModelResponse {
  object: string;
  data: Array<{
    id: string;
    object: string;
    root: string;
  }>;
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

export class ErnieApi implements LLMApi {
  path(path: string): string {
    const accessStore = useAccessStore.getState();

    let baseUrl = "";

    if (accessStore.useCustomConfig) {
      baseUrl = accessStore.baiduUrl;
    }

    if (baseUrl.length === 0) {
      const isApp = !!getClientConfig()?.isApp;
      // do not use proxy for baidubce api
      baseUrl = isApp ? BAIDU_BASE_URL : ApiPath.Baidu;
    }

    if (baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, baseUrl.length - 1);
    }
    if (!baseUrl.startsWith("http") && !baseUrl.startsWith(ApiPath.Baidu)) {
      baseUrl = "https://" + baseUrl;
    }

    console.log("[Proxy Endpoint] ", baseUrl, path);

    return [baseUrl, path].join("/");
  }

  async chat(options: ChatOptions) {
    const messages = options.messages.map((v) => ({
      role: v.role,
      content: getMessageTextContent(v),
    }));

    // "error_code": 336006, "error_msg": "the length of messages must be an odd number",
    if (messages.length % 2 === 0) {
      messages.unshift({
        role: "user",
        content: " ",
      });
    }

    const modelConfig = {
      ...useAppConfig.getState().modelConfig,
      ...useChatStore.getState().currentSession().mask.modelConfig,
      ...{
        model: options.config.model,
      },
    };

    const shouldStream = !!options.config.stream;
    const requestPayload: RequestPayload = {
      messages,
      stream: shouldStream,
      model: modelConfig.model,
      temperature: modelConfig.temperature,
      presence_penalty: modelConfig.presence_penalty,
      frequency_penalty: modelConfig.frequency_penalty,
      top_p: modelConfig.top_p,
    };

    console.log("[Request] Baidu payload: ", requestPayload);

    const controller = new AbortController();
    options.onController?.(controller);

    try {
      let chatPath = this.path(Baidu.ChatPath(modelConfig.model));

      // getAccessToken can not run in browser, because cors error
      if (!!getClientConfig()?.isApp) {
        const accessStore = useAccessStore.getState();
        if (accessStore.useCustomConfig) {
          if (accessStore.isValidBaidu()) {
            const { access_token } = await getAccessToken(
              accessStore.baiduApiKey,
              accessStore.baiduSecretKey,
            );
            chatPath = `${chatPath}${
              chatPath.includes("?") ? "&" : "?"
            }access_token=${access_token}`;
          }
        }
      }

      // SDK替换
      const accessStore = useAccessStore.getState();
      const client = new ChatCompletion({
        QIANFAN_AK: accessStore.baiduApiKey,
        QIANFAN_SK: accessStore.baiduSecretKey,
        QIANFAN_BASE_URL: `${window.location.origin}${
          accessStore.baiduUrl || "/api/baidu"
        }`,
      });

      const stream = await client.chat(
        {
          ...requestPayload,
        },
        modelConfig.model.toUpperCase(),
      );

      let result = "";
      if (shouldStream) {
        for await (const chunk of stream) {
          result = result + chunk?.result || "";
        }
      } else {
        result = stream?.result || "";
      }

      options.onFinish(result);
    } catch (e) {
      console.log("[Request] failed to make a chat request", e);
      options.onError?.(e as Error);
    }
  }
  async usage() {
    return {
      used: 0,
      total: 0,
    };
  }

  async models(): Promise<LLMModel[]> {
    return [];
  }
}
export { Baidu };
