import { SettingItem } from "../../common";
import Locale from "./locale";

export type SettingKeys =
  | "anthropicUrl"
  | "anthropicApiKey"
  | "anthropicApiVersion";

export const AnthropicMetas = {
  ChatPath: "v1/messages",
  ChatPath1: "v1/complete",
  ExampleEndpoint: "https://api.anthropic.com",
  Vision: "2023-06-01",
};

export const ClaudeMapper = {
  assistant: "assistant",
  user: "user",
  system: "user",
} as const;

export const modelConfigs = [
  {
    name: "claude-instant-1.2",
    displayName: "claude-instant-1.2",
    isVision: false,
    isDefaultActive: true,
    isDefaultSelected: true,
  },
  {
    name: "claude-2.0",
    displayName: "claude-2.0",
    isVision: false,
    isDefaultActive: true,
    isDefaultSelected: false,
  },
  {
    name: "claude-2.1",
    displayName: "claude-2.1",
    isVision: false,
    isDefaultActive: true,
    isDefaultSelected: false,
  },
  {
    name: "claude-3-sonnet-20240229",
    displayName: "claude-3-sonnet-20240229",
    isVision: true,
    isDefaultActive: false,
    isDefaultSelected: false,
  },
  {
    name: "claude-3-opus-20240229",
    displayName: "claude-3-opus-20240229",
    isVision: true,
    isDefaultActive: false,
    isDefaultSelected: false,
  },
  {
    name: "claude-3-haiku-20240307",
    displayName: "claude-3-haiku-20240307",
    isVision: true,
    isDefaultActive: true,
    isDefaultSelected: false,
  },
];

const defaultEndpoint = "/api/anthropic";

export const settingItems: SettingItem<SettingKeys>[] = [
  {
    name: "anthropicUrl",
    title: Locale.Endpoint.Title,
    description: Locale.Endpoint.SubTitle + AnthropicMetas.ExampleEndpoint,
    placeholder: AnthropicMetas.ExampleEndpoint,
    type: "input",
    defaultValue: defaultEndpoint,
    validators: [
      "required",
      async (v: any) => {
        if (typeof v === "string" && !v.startsWith(defaultEndpoint)) {
          try {
            new URL(v);
          } catch (e) {
            return Locale.Endpoint.Error.IllegalURL;
          }
        }
        if (typeof v === "string" && v.endsWith("/")) {
          return Locale.Endpoint.Error.EndWithBackslash;
        }
      },
    ],
  },
  {
    name: "anthropicApiKey",
    title: Locale.ApiKey.Title,
    description: Locale.ApiKey.SubTitle,
    placeholder: Locale.ApiKey.Placeholder,
    type: "input",
    inputType: "password",
    // validators: ["required"],
  },
  {
    name: "anthropicApiVersion",
    title: Locale.ApiVerion.Title,
    description: Locale.ApiVerion.SubTitle,
    placeholder: AnthropicMetas.Vision,
    type: "input",
    // validators: ["required"],
  },
];
