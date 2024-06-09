import { SettingItem } from "../../common";
import Locale from "./locale";

export const OPENAI_BASE_URL = "https://api.openai.com";

export const ROLES = ["system", "user", "assistant"] as const;

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

export const OpenaiMetas = {
  ChatPath: "v1/chat/completions",
  UsagePath: "dashboard/billing/usage",
  SubsPath: "dashboard/billing/subscription",
  ListModelPath: "v1/models",
};

export type SettingKeys = "openaiUrl" | "openaiApiKey";

export const modelConfigs = [
  {
    name: "gpt-4o",
    displayName: "gpt-4o",
    isVision: false,
    isDefaultActive: true,
    isDefaultSelected: true,
  },
  {
    name: "gpt-3.5-turbo",
    displayName: "gpt-3.5-turbo",
    isVision: false,
    isDefaultActive: true,
    isDefaultSelected: false,
  },
  {
    name: "gpt-3.5-turbo-0301",
    displayName: "gpt-3.5-turbo-0301",
    isVision: false,
    isDefaultActive: false,
    isDefaultSelected: false,
  },
  {
    name: "gpt-3.5-turbo-0613",
    displayName: "gpt-3.5-turbo-0613",
    isVision: false,
    isDefaultActive: false,
    isDefaultSelected: false,
  },
  {
    name: "gpt-3.5-turbo-1106",
    displayName: "gpt-3.5-turbo-1106",
    isVision: false,
    isDefaultActive: false,
    isDefaultSelected: false,
  },
  {
    name: "gpt-3.5-turbo-0125",
    displayName: "gpt-3.5-turbo-0125",
    isVision: false,
    isDefaultActive: false,
    isDefaultSelected: false,
  },
  {
    name: "gpt-3.5-turbo-16k",
    displayName: "gpt-3.5-turbo-16k",
    isVision: false,
    isDefaultActive: false,
    isDefaultSelected: false,
  },
  {
    name: "gpt-3.5-turbo-16k-0613",
    displayName: "gpt-3.5-turbo-16k-0613",
    isVision: false,
    isDefaultActive: false,
    isDefaultSelected: false,
  },
  {
    name: "gpt-4",
    displayName: "gpt-4",
    isVision: false,
    isDefaultActive: true,
    isDefaultSelected: false,
  },
  {
    name: "gpt-4-0314",
    displayName: "gpt-4-0314",
    isVision: false,
    isDefaultActive: false,
    isDefaultSelected: false,
  },
  {
    name: "gpt-4-0613",
    displayName: "gpt-4-0613",
    isVision: false,
    isDefaultActive: false,
    isDefaultSelected: false,
  },
  {
    name: "gpt-4-1106-preview",
    displayName: "gpt-4-1106-preview",
    isVision: false,
    isDefaultActive: false,
    isDefaultSelected: false,
  },
  {
    name: "gpt-4-0125-preview",
    displayName: "gpt-4-0125-preview",
    isVision: false,
    isDefaultActive: false,
    isDefaultSelected: false,
  },
  {
    name: "gpt-4-32k",
    displayName: "gpt-4-32k",
    isVision: false,
    isDefaultActive: false,
    isDefaultSelected: false,
  },
  {
    name: "gpt-4-32k-0314",
    displayName: "gpt-4-32k-0314",
    isVision: false,
    isDefaultActive: false,
    isDefaultSelected: false,
  },
  {
    name: "gpt-4-32k-0613",
    displayName: "gpt-4-32k-0613",
    isVision: false,
    isDefaultActive: false,
    isDefaultSelected: false,
  },
  {
    name: "gpt-4-turbo",
    displayName: "gpt-4-turbo",
    isVision: true,
    isDefaultActive: true,
    isDefaultSelected: false,
  },
  {
    name: "gpt-4-turbo-preview",
    displayName: "gpt-4-turbo-preview",
    isVision: false,
    isDefaultActive: false,
    isDefaultSelected: false,
  },
  {
    name: "gpt-4-vision-preview",
    displayName: "gpt-4-vision-preview",
    isVision: true,
    isDefaultActive: false,
    isDefaultSelected: false,
  },
  {
    name: "gpt-4-turbo-2024-04-09",
    displayName: "gpt-4-turbo-2024-04-09",
    isVision: true,
    isDefaultActive: false,
    isDefaultSelected: false,
  },
];

export const settingItems: (
  defaultEndpoint: string,
) => SettingItem<SettingKeys>[] = (defaultEndpoint) => [
  {
    name: "openaiUrl",
    title: Locale.Endpoint.Title,
    description: Locale.Endpoint.SubTitle,
    defaultValue: defaultEndpoint,
    type: "input",
    validators: [
      "required",
      async (v: any) => {
        if (typeof v === "string" && v.endsWith("/")) {
          return Locale.Endpoint.Error.EndWithBackslash;
        }
        if (
          typeof v === "string" &&
          !v.startsWith(defaultEndpoint) &&
          !v.startsWith("http")
        ) {
          return Locale.Endpoint.SubTitle;
        }
      },
    ],
  },
  {
    name: "openaiApiKey",
    title: Locale.ApiKey.Title,
    description: Locale.ApiKey.SubTitle,
    placeholder: Locale.ApiKey.Placeholder,
    type: "input",
    inputType: "password",
    // validators: ["required"],
  },
];
