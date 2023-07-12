import { REQUEST_TIMEOUT_MS } from "@/app/constant";
import { useAccessStore, useAppConfig, useChatStore } from "@/app/store";

import { ChatOptions, getHeaders, LLMApi, LLMUsage } from "../api";
import Locale from "../../locales";
import {
  EventStreamContentType,
  fetchEventSource,
} from "@fortaine/fetch-event-source";
import { prettyObject } from "@/app/utils/format";
import { sendMessage } from "next/dist/client/dev/error-overlay/websocket";

export class ChatGPTApi implements LLMApi {
  public ChatPath =
    "/openai/deployments/chatGPT/chat/completions\\?api-version\\=2023-05-15";
  public UsagePath = "dashboard/billing/usage";
  public SubsPath = "dashboard/billing/subscription";

  getHistory(messages: any[]): any[] {
    const history: any[] = [];
    let systemContent: any = null;

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const { role, content } = message;

      if (role === "system") {
        if (systemContent !== null) {
          history.push([systemContent, ""]);
          systemContent = null;
        }
      } else if (role === "user") {
        const nextMessage = messages[i + 1];
        if (nextMessage && nextMessage.role === "user") {
          history.push([content, nextMessage.content]);
          i++; // 跳过下一个消息，因为已经处理了
        } else {
          history.push([content, ""]);
        }
      } else {
        // 其他角色的消息处理逻辑
        // 如果有需要，请根据需求进行修改或添加
      }
    }

    return history;
  }

  path(path: string): string {
    let openaiUrl = useAccessStore.getState().openaiUrl;
    if (openaiUrl.endsWith("/")) {
      openaiUrl = openaiUrl.slice(0, openaiUrl.length - 1);
    }
    return [openaiUrl, path].join("/");
  }

  extractMessage(res: any) {
    return res.choices?.at(0)?.message?.content ?? "";
    //  const text = res.text ?? ""; // 获取res对象中的text字段值，如果不存在则使用空字符串作为默认值
    //  return text;
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
        model: options.config.model,
      },
    };

    const requestPayload = {
      messages,
      stream: options.config.stream,
      model: modelConfig.model,
      temperature: modelConfig.temperature,
      //max_tokens: 50,
      //presence_penalty: modelConfig.presence_penalty,
    };

    console.log("[Request] openai payload: ", requestPayload);
    const shouldStream = !!options.config.stream;
    const controller = new AbortController();
    options.onController?.(controller);

    try {
      //alert("options.config.stream"+ options.config.stream +"  "+shouldStream)
      const chatPath = this.path(this.ChatPath);
      const chatPayload = {
        method: "POST",
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
        headers: getHeaders(),
      };
      // make a fetch request
      const requestTimeoutId = setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT_MS,
      );
      const question = messages[messages.length - 1].content;
      if (shouldStream) {
        let responseText = "";
        let finished = false;

        const finish = () => {
          if (!finished) {
            options.onFinish(responseText);
            finished = true;
          }
        };

        controller.signal.onabort = finish;
        fetchEventSource(chatPath, {
          ...chatPayload,
          async onopen(res) {
            clearTimeout(requestTimeoutId);
            const contentType = res.headers.get("content-type");
            // console.log(
            //   "[OpenAI] request response content type: ",
            //   contentType,
            // );

            //alert(question)
            if (contentType?.startsWith("text/plain")) {
              responseText = await res.clone().text();
              return finish();
            }
            //alert("Streaming");
            //alert(sendMessage);
            if (
              !res.ok ||
              !res.headers
                .get("content-type")
                ?.startsWith(EventStreamContentType) ||
              res.status !== 200
            ) {
              //alert("The here");

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
              const delta = json.choices[0].delta.content;
              //const delta = json.text;

              if (delta) {
                responseText += delta;
                options.onUpdate?.(responseText, delta);
              }
            } catch (e) {
              console.error("[Request] parse error", text, msg);
            }
          },
          onclose() {
            finish();
          },
          onerror(e) {
            options.onError?.(e);
            throw e;
          },
          openWhenHidden: true,
        });
      } else {
        //alert("No straming!!!");
        if (modelConfig.model !== "lang chain") {
          //console.log(JSON.stringify(testBody))

          try {
            const res = await fetch(chatPath, chatPayload);
            //const res = await fetch(testPath, testPayload);
            clearTimeout(requestTimeoutId);

            if (!res.ok) {
              throw new Error(`HTTP error! Status: ${res.status}`);
            }
            const resJson = await res.json();
            const message = this.extractMessage(resJson);
            //const message = resJson.text;
            //alert(message)
            options.onFinish(message);
          } catch (error) {
            console.error("Request error:", error);
          }
        } else {
          //console.log(JSON.stringify(testBody))
          //alert("hhhh");
          const history = this.getHistory(messages);
          //const chatstore = useChatStore();
          const uuid = options.uuid;
          //alert("hhhhhhh"+uuid);
          const testPath = "http://localhost:3001/api/chat/";
          const testBody = {
            uuid: uuid,
            question: question,
            history: history,
          };
          console.log(testBody);
          const testPayload = {
            method: "POST",
            body: JSON.stringify(testBody),
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
            },
          };

          try {
            //alert("hhhhhh");
            const res = await fetch(testPath, testPayload);
            clearTimeout(requestTimeoutId);

            if (!res.ok) {
              throw new Error(`HTTP error! Status: ${res.status}`);
            }
            const resJson = await res.json();
            const message = resJson.text;
            //alert(message)
            options.onFinish(message);
          } catch (error) {
            console.error("Request error:", error);
          }
        }
      }
    } catch (e) {
      console.log("[Request] failed to make a chat reqeust", e);
      options.onError?.(e as Error);
    }
  }
  async usage() {
    const formatDate = (d: Date) =>
      `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
        .getDate()
        .toString()
        .padStart(2, "0")}`;
    const ONE_DAY = 1 * 24 * 60 * 60 * 1000;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startDate = formatDate(startOfMonth);
    const endDate = formatDate(new Date(Date.now() + ONE_DAY));

    const [used, subs] = await Promise.all([
      fetch(
        this.path(
          `${this.UsagePath}?start_date=${startDate}&end_date=${endDate}`,
        ),
        {
          method: "GET",
          headers: getHeaders(),
        },
      ),
      fetch(this.path(this.SubsPath), {
        method: "GET",
        headers: getHeaders(),
      }),
    ]);

    if (used.status === 401) {
      throw new Error(Locale.Error.Unauthorized);
    }

    if (!used.ok || !subs.ok) {
      throw new Error("Failed to query usage from openai");
    }

    const response = (await used.json()) as {
      total_usage?: number;
      error?: {
        type: string;
        message: string;
      };
    };

    const total = (await subs.json()) as {
      hard_limit_usd?: number;
    };

    if (response.error && response.error.type) {
      throw Error(response.error.message);
    }

    if (response.total_usage) {
      response.total_usage = Math.round(response.total_usage) / 100;
    }

    if (total.hard_limit_usd) {
      total.hard_limit_usd = Math.round(total.hard_limit_usd * 100) / 100;
    }

    return {
      used: response.total_usage,
      total: total.hard_limit_usd,
    } as LLMUsage;
  }
}
