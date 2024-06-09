import { SettingItem } from "../../common";
import Locale from "./locale";

export type SettingKeys =
  | "anthropicUrl"
  | "anthropicApiKey"
  | "anthropicApiVersion";

export const ANTHROPIC_BASE_URL = "https://api.anthropic.com";

export const AnthropicMetas = {
  ChatPath: "v1/messages",
  ExampleEndpoint: ANTHROPIC_BASE_URL,
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

export const preferredRegion: string | string[] = [
  "arn1",
  "bom1",
  "cdg1",
  "cle1",
  "cpt1",
  "dub1",
  "fra1",
  "gru1",
  "hnd1",
  "iad1",
  "icn1",
  "kix1",
  "lhr1",
  "pdx1",
  "sfo1",
  "sin1",
  "syd1",
];

export const settingItems: (
  defaultEndpoint: string,
) => SettingItem<SettingKeys>[] = (defaultEndpoint) => [
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
    defaultValue: AnthropicMetas.Vision,
    type: "input",
    // validators: ["required"],
  },
];
