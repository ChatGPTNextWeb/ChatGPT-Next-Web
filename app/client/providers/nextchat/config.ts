import { SettingItem } from "../../common";
import { isVisionModel } from "@/app/utils";
import Locale from "@/app/locales";

export const OPENAI_BASE_URL = "https://api.openai.com";

export const NextChatMetas = {
  ChatPath: "v1/chat/completions",
  UsagePath: "dashboard/billing/usage",
  SubsPath: "dashboard/billing/subscription",
  ListModelPath: "v1/models",
};

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

export type SettingKeys = "accessCode";

export const defaultModal = "gpt-3.5-turbo";

export const models = [
  defaultModal,
  "gpt-3.5-turbo-0301",
  "gpt-3.5-turbo-0613",
  "gpt-3.5-turbo-1106",
  "gpt-3.5-turbo-0125",
  "gpt-3.5-turbo-16k",
  "gpt-3.5-turbo-16k-0613",
  "gpt-4",
  "gpt-4-0314",
  "gpt-4-0613",
  "gpt-4-1106-preview",
  "gpt-4-0125-preview",
  "gpt-4-32k",
  "gpt-4-32k-0314",
  "gpt-4-32k-0613",
  "gpt-4-turbo",
  "gpt-4-turbo-preview",
  "gpt-4-vision-preview",
  "gpt-4-turbo-2024-04-09",

  "gemini-1.0-pro",
  "gemini-1.5-pro-latest",
  "gemini-pro-vision",

  "claude-instant-1.2",
  "claude-2.0",
  "claude-2.1",
  "claude-3-sonnet-20240229",
  "claude-3-opus-20240229",
  "claude-3-haiku-20240307",
];

export const modelConfigs = models.map((name) => ({
  name,
  displayName: name,
  isVision: isVisionModel(name),
  isDefaultActive: true,
  isDefaultSelected: name === defaultModal,
}));

export const settingItems: SettingItem<SettingKeys>[] = [
  {
    name: "accessCode",
    title: Locale.Auth.Title,
    description: Locale.Auth.Tips,
    placeholder: Locale.Auth.Input,
    type: "input",
    inputType: "password",
    validators: ["required"],
  },
];
