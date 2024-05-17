import Locale from "./locale";

import { SettingItem } from "../../common";
import { modelConfigs as openaiModelConfigs } from "../openai/config";

export const AzureMetas = {
  ExampleEndpoint: "https://{resource-url}/openai/deployments/{deploy-id}",
  ChatPath: "v1/chat/completions",
};

export type SettingKeys = "azureUrl" | "azureApiKey" | "azureApiVersion";

export const modelConfigs = openaiModelConfigs;

export const settingItems: SettingItem<SettingKeys>[] = [
  {
    name: "azureUrl",
    title: Locale.Endpoint.Title,
    description: Locale.Endpoint.SubTitle + AzureMetas.ExampleEndpoint,
    placeholder: AzureMetas.ExampleEndpoint,
    type: "input",
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
