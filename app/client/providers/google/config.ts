import { SettingItem } from "../../core/types";
import Locale from "./locale";

export const GoogleMetas = {
  ExampleEndpoint: "https://generativelanguage.googleapis.com/",
  ChatPath: (modelName: string) => `v1beta/models/${modelName}:generateContent`,
  VisionChatPath: (modelName: string) =>
    `v1beta/models/${modelName}:generateContent`,
};

export type SettingKeys = "googleUrl" | "googleApiKey" | "googleApiVersion";

export const modelConfigs = [
  {
    name: "gemini-1.0-pro",
    displayName: "gemini-1.0-pro",
    isVision: false,
    isDefaultActive: true,
    isDefaultSelected: true,
  },
  {
    name: "gemini-1.5-pro-latest",
    displayName: "gemini-1.5-pro-latest",
    isVision: true,
    isDefaultActive: true,
    isDefaultSelected: false,
  },
  {
    name: "gemini-pro-vision",
    displayName: "gemini-pro-vision",
    isVision: true,
    isDefaultActive: true,
    isDefaultSelected: false,
  },
];

export const settingItems: SettingItem<SettingKeys>[] = [
  {
    name: "googleUrl",
    title: Locale.Endpoint.Title,
    description: Locale.Endpoint.SubTitle + GoogleMetas.ExampleEndpoint,
    placeholder: GoogleMetas.ExampleEndpoint,
    type: "input",
    validators: ["required"],
  },
  {
    name: "googleApiKey",
    title: Locale.ApiKey.Title,
    description: Locale.ApiKey.SubTitle,
    placeholder: Locale.ApiKey.Placeholder,
    type: "input",
    inputType: "password",
    validators: ["required"],
  },
  {
    name: "googleApiVersion",
    title: Locale.ApiVersion.Title,
    description: Locale.ApiVersion.SubTitle,
    placeholder: "2023-08-01-preview",
    type: "input",
    validators: ["required"],
  },
];
