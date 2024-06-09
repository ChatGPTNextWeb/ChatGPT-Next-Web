import { SettingItem } from "../../common";
import Locale from "./locale";

export const preferredRegion: string | string[] = [
  "bom1",
  "cle1",
  "cpt1",
  "gru1",
  "hnd1",
  "iad1",
  "icn1",
  "kix1",
  "pdx1",
  "sfo1",
  "sin1",
  "syd1",
];

export const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/";

export const GoogleMetas = {
  ExampleEndpoint: GEMINI_BASE_URL,
  ChatPath: (modelName: string) => `v1beta/models/${modelName}:generateContent`,
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

export const settingItems: (
  defaultEndpoint: string,
) => SettingItem<SettingKeys>[] = (defaultEndpoint) => [
  {
    name: "googleUrl",
    title: Locale.Endpoint.Title,
    description: Locale.Endpoint.SubTitle + GoogleMetas.ExampleEndpoint,
    placeholder: GoogleMetas.ExampleEndpoint,
    type: "input",
    defaultValue: defaultEndpoint,
    validators: [
      async (v: any) => {
        if (typeof v === "string") {
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
      "required",
    ],
  },
  {
    name: "googleApiKey",
    title: Locale.ApiKey.Title,
    description: Locale.ApiKey.SubTitle,
    placeholder: Locale.ApiKey.Placeholder,
    type: "input",
    inputType: "password",
    // validators: ["required"],
  },
  {
    name: "googleApiVersion",
    title: Locale.ApiVersion.Title,
    description: Locale.ApiVersion.SubTitle,
    placeholder: "2023-08-01-preview",
    type: "input",
    // validators: ["required"],
  },
];
