import Locale from "./locale";

import { SettingItem } from "../../common";
import { modelConfigs as openaiModelConfigs } from "../openai/config";

export const AzureMetas = {
  ExampleEndpoint: "https://{resource-url}/openai/deployments/{deploy-id}",
  ChatPath: "chat/completions",
  ListModelPath: "v1/models",
};

export type SettingKeys = "azureUrl" | "azureApiKey" | "azureApiVersion";

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

export const modelConfigs = openaiModelConfigs;

export const settingItems: (
  defaultEndpoint: string,
) => SettingItem<SettingKeys>[] = (defaultEndpoint) => [
  {
    name: "azureUrl",
    title: Locale.Endpoint.Title,
    description: Locale.Endpoint.SubTitle + AzureMetas.ExampleEndpoint,
    placeholder: AzureMetas.ExampleEndpoint,
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
    name: "azureApiKey",
    title: Locale.ApiKey.Title,
    description: Locale.ApiKey.SubTitle,
    placeholder: Locale.ApiKey.Placeholder,
    type: "input",
    inputType: "password",
    validators: ["required"],
  },
  {
    name: "azureApiVersion",
    title: Locale.ApiVerion.Title,
    description: Locale.ApiVerion.SubTitle,
    placeholder: "2023-08-01-preview",
    type: "input",
    validators: ["required"],
  },
];
