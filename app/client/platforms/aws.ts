"use client";
import {
  ApiPath,
  DEFAULT_API_HOST,
  DEFAULT_MODELS,
  OpenaiPath,
  REQUEST_TIMEOUT_MS,
  ServiceProvider,
} from "@/app/constant";
import { useAccessStore, useAppConfig, useChatStore } from "@/app/store";

import { BedrockClient, AWSConfig } from "@/app/client/platforms/aws_utils";

import {
  ChatOptions,
  getHeaders,
  LLMApi,
  LLMModel,
  LLMUsage,
  MultimodalContent,
} from "../api";
import Locale from "../../locales";
import {
  EventStreamContentType,
  fetchEventSource,
} from "@fortaine/fetch-event-source";
import { prettyObject } from "@/app/utils/format";
import { getClientConfig } from "@/app/config/client";
import { makeAzurePath } from "@/app/azure";
import {
  getMessageTextContent,
  getMessageImages,
  isVisionModel,
} from "@/app/utils";
import vi from "@/app/locales/vi";

export interface AWSListModelResponse {
  object: string;
  data: Array<{
    id: string;
    object: string;
    root: string;
  }>;
}

export class ClaudeApi implements LLMApi {
  private disableListModels = true;

  path(path: string): string {
    const accessStore = useAccessStore.getState();

    return "https://facked-url.bedrock.com";
  }

  extractMessage(res: any) {
    return res.choices?.at(0)?.message?.content ?? "";
  }

  convertMessagePayload(messages: any, modelConfig: any): any {
    // converting the message payload, as the format of the original message playload is different from the format of the payload format of Bedrock API
    // define a new variable to store the new message payload,
    // scan all the messages in the original message payload,
    //      if the message is a system prompt, then need to remove it from the message payload, and store the system prompt content in "system parameter" as Bedrock API required.
    //      if the message is from user, then scan the content of the message
    //          if the content type is image_url, then get the image data and store it in the new message payload
    //          if the content type is not image_url, then store the content in the new message payload

    console.log("original messages", messages);

    var new_messages: any = [];

    var has_system_prompt = false;
    var system_prompt = "";
    var prev_role = "";

    for (var i = 0; i < messages.length; i++) {
      if (messages[i].role === "system") {
        if (typeof messages[i].content === "string") {
          has_system_prompt = true;
          system_prompt = messages[i].content;
        }

        prev_role = messages[i].role;
      } else if (messages[i].role === "user") {
        // check the value type of the content

        var new_contents = [];

        if (prev_role === messages[i].role) {
          // continued user message
          // need to get back the previous user message, and append the current message to the previous message

          const last_message = new_messages.pop();

          // put the contents in the last message to the new contents

          for (var k = 0; k < last_message.content.length; k++) {
            new_contents.push(last_message.content[k]);
          }
        }

        if (typeof messages[i].content === "string") {
          // the message content is not an array, it is a text message

          console.log("text message", messages[i].content);

          const text_playload = { type: "text", text: messages[i].content };

          console.log("text_playload", text_playload);

          new_contents.push(text_playload);
        } else {
          for (var j = 0; j < messages[i].content.length; j++) {
            if (
              (messages[i].content[j] as MultimodalContent).type === "image_url"
            ) {
              const curent_content = messages[i].content[
                j
              ] as MultimodalContent;

              // console.log('image_url', curent_content.image_url.url);

              if (curent_content.image_url !== undefined) {
                const image_data_in_string = curent_content.image_url.url;

                const image_metadata = image_data_in_string.split(",")[0];
                const image_data = image_data_in_string.split(",")[1];

                const media_type = image_metadata.split(";")[0].split(":")[1];
                const image_type = image_metadata.split(";")[1];

                const image_playload = {
                  type: "image",
                  source: {
                    type: image_type,
                    media_type: media_type,
                    data: image_data,
                  },
                };

                new_contents.push(image_playload);
              }
            } else {
              new_contents.push(messages[i].content[j]);
            }
          }
        }

        new_messages.push({ role: messages[i].role, content: new_contents });

        prev_role = messages[i].role;

        // console.log("now , new message is:", new_messages);
      } else if (messages[i].role === "assistant") {
        var new_contents = [];

        if (prev_role === messages[i].role) {
          // continued assistant message
          // need to get back the previous assistant message, and append the current message to the previous message

          const last_message = new_messages.pop();

          // put the contents in the last message to the new contents

          for (var k = 0; k < last_message.content.length; k++) {
            new_contents.push(last_message.content[k]);
          }
        }

        if (typeof messages[i].content === "string") {
          // the message content is not an array, it is a text message

          const text_playload = { type: "text", text: messages[i].content };

          new_contents.push(text_playload);
        } else {
          for (var j = 0; j < messages[i].content.length; j++) {
            new_contents.push(messages[i].content[j]);
          }
        }

        new_messages.push({ role: messages[i].role, content: new_contents });

        prev_role = messages[i].role;
      } else {
        new_messages.push(messages[i]);

        prev_role = messages[i].role;
      }
    }
    // }

    // else {
    //   var new_messages = messages;
    // }

    // var requestPayload

    // if (visionModel) {

    const requestPayload = {
      ...(has_system_prompt ? { system: system_prompt } : {}),
      messages: new_messages,
      top_p: modelConfig.top_p,
      temperature: modelConfig.temperature,
      max_tokens: modelConfig.max_tokens,
      anthropic_version: "bedrock-2023-05-31",
    };

    return requestPayload;
  }

  async chat(options: ChatOptions) {
    const visionModel = isVisionModel(options.config.model);

    const modelConfig = {
      ...useAppConfig.getState().modelConfig,
      ...useChatStore.getState().currentSession().mask.modelConfig,
      ...{
        model: options.config.model,
      },
    };

    const accessStore = useAccessStore.getState();

    if (
      accessStore.awsRegion === "" ||
      accessStore.awsAccessKeyId === "" ||
      accessStore.awsSecretAccessKey === ""
    ) {
      console.log("AWS credentials are not set");
      options.onError?.(
        new Error(
          "AWS credentials are not set, go to settings page to set AWS credentials",
        ),
      );
      return;
    }

    const aws_config_data = {
      region: accessStore.awsRegion,
      credentials: {
        accessKeyId: accessStore.awsAccessKeyId,
        secretAccessKey: accessStore.awsSecretAccessKey,
      },
    };

    console.log("aws_config_data", aws_config_data);

    const client = new BedrockClient(aws_config_data);

    console.log("is vision model", visionModel);

    console.log("options.messages", options.messages);

    const messages = options.messages.map((v) => ({
      role: v.role,
      content: visionModel ? v.content : getMessageTextContent(v),
    }));

    const requestPayload = this.convertMessagePayload(messages, modelConfig);

    console.log("requestPayload", requestPayload);

    // add max_tokens to vision model
    if (visionModel) {
      Object.defineProperty(requestPayload, "max_tokens", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: modelConfig.max_tokens,
      });
    }

    // console.log("[Request] claude payload: ", requestPayload);

    const shouldStream = !!options.config.stream;
    const controller = new AbortController();
    options.onController?.(controller);

    try {
      // const chatPath = this.path(OpenaiPath.ChatPath);
      // const chatPayload = {
      //   method: "POST",
      //   body: JSON.stringify(requestPayload),
      //   signal: controller.signal,
      //   headers: getHeaders(),
      // };

      // make a fetch request
      const requestTimeoutId = setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT_MS,
      );

      if (shouldStream) {
        console.log("streaming");
        let responseText = "";
        let remainText = "";
        let finished = false;

        // animate response to make it looks smooth
        function animateResponseText() {
          if (finished || controller.signal.aborted) {
            responseText += remainText;
            console.log("[Response Animation] finished");
            return;
          }

          if (remainText.length > 0) {
            const fetchCount = Math.max(1, Math.round(remainText.length / 60));
            const fetchText = remainText.slice(0, fetchCount);
            responseText += fetchText;
            remainText = remainText.slice(fetchCount);
            options.onUpdate?.(responseText, fetchText);
          }

          requestAnimationFrame(animateResponseText);
        }

        // start animaion
        animateResponseText();

        const finish = () => {
          if (!finished) {
            finished = true;
            options.onFinish(responseText + remainText);
          }
        };

        controller.signal.onabort = finish;

        const response = await client.invokeModelWithStream(
          requestPayload,
          "anthropic.claude-3-sonnet-20240229-v1:0",
        );

        // console.log('response of streaming request:', response);

        if (response.body) {
          // console.log('streaming response', response.body);

          for await (const item of response.body) {
            // console.log('for loop, item', item);
            if (item.chunk?.bytes) {
              const decodedResponseBody = new TextDecoder().decode(
                item.chunk.bytes,
              );
              const responseBody = JSON.parse(decodedResponseBody);

              console.log("streaming response:", responseBody);

              if (responseBody.delta?.type === "text_delta") {
                // console.log('delta', responseBody.delta.text);

                remainText += responseBody.delta.text;
              }
            }
          }

          finish();
        } else {
          // Handle errors
          console.error("Error invoking model:");

          finish();
        }
      } else {
        console.log("not streaming");

        const res = await client.invokeModel(
          requestPayload,
          "anthropic.claude-3-sonnet-20240229-v1:0",
        );

        clearTimeout(requestTimeoutId);

        const decodedResponseBody = new TextDecoder().decode(res.body);
        const responseBody = JSON.parse(decodedResponseBody);

        console.log("response", responseBody.content);

        const message = responseBody.content;
        options.onFinish(message);
      }
    } catch (e) {
      console.log("[Request] failed to make a chat request", e);
      options.onError?.(e as Error);
    }
  }
  async usage() {
    // const formatDate = (d: Date) =>
    //   `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
    //     .getDate()
    //     .toString()
    //     .padStart(2, "0")}`;
    // const ONE_DAY = 1 * 24 * 60 * 60 * 1000;
    // const now = new Date();
    // const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    // const startDate = formatDate(startOfMonth);
    // const endDate = formatDate(new Date(Date.now() + ONE_DAY));

    // const [used, subs] = await Promise.all([
    //   fetch(
    //     this.path(
    //       `${OpenaiPath.UsagePath}?start_date=${startDate}&end_date=${endDate}`,
    //     ),
    //     {
    //       method: "GET",
    //       headers: getHeaders(),
    //     },
    //   ),
    //   fetch(this.path(OpenaiPath.SubsPath), {
    //     method: "GET",
    //     headers: getHeaders(),
    //   }),
    // ]);

    // if (used.status === 401) {
    //   throw new Error(Locale.Error.Unauthorized);
    // }

    // if (!used.ok || !subs.ok) {
    //   throw new Error("Failed to query usage from openai");
    // }

    // const response = (await used.json()) as {
    //   total_usage?: number;
    //   error?: {
    //     type: string;
    //     message: string;
    //   };
    // };

    // const total = (await subs.json()) as {
    //   hard_limit_usd?: number;
    // };

    // if (response.error && response.error.type) {
    //   throw Error(response.error.message);
    // }

    // if (response.total_usage) {
    //   response.total_usage = Math.round(response.total_usage) / 100;
    // }

    // if (total.hard_limit_usd) {
    //   total.hard_limit_usd = Math.round(total.hard_limit_usd * 100) / 100;
    // }

    // return {
    //   used: response.total_usage,
    //   total: total.hard_limit_usd,
    // } as LLMUsage;

    return {
      used: 1000,
      total: 1000,
    } as LLMUsage;
  }

  async models(): Promise<LLMModel[]> {
    if (this.disableListModels) {
      return DEFAULT_MODELS.slice();
    }

    const res = await fetch(this.path(OpenaiPath.ListModelPath), {
      method: "GET",
      headers: {
        ...getHeaders(),
      },
    });

    const resJson = (await res.json()) as AWSListModelResponse;
    const chatModels = resJson.data?.filter((m) => m.id.startsWith("gpt-"));
    console.log("[Models]", chatModels);

    if (!chatModels) {
      return [];
    }

    return chatModels.map((m) => ({
      name: m.id,
      available: true,
      provider: {
        id: "openai",
        providerName: "OpenAI",
        providerType: "openai",
      },
    }));
  }
}
export { OpenaiPath };
