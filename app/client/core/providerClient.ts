import {
  ChatHandlers,
  IProviderTemplate,
  Model,
  StandChatReponseMessage,
  StandChatRequestPayload,
} from "./types";
import * as ProviderTemplates from "@/app/client/providers";
import { cloneDeep } from "lodash-es";

export type ProviderTemplate =
  (typeof ProviderTemplates)[keyof typeof ProviderTemplates];

export type ProviderTemplateName =
  (typeof ProviderTemplates)[keyof typeof ProviderTemplates]["prototype"]["name"];

export class ProviderClient {
  provider: IProviderTemplate<any, any, any>;

  static ProviderTemplates = ProviderTemplates;

  static getAllProvidersDefaultModels = () => {
    return Object.values(ProviderClient.ProviderTemplates).reduce(
      (r, p) => ({
        ...r,
        [p.prototype.name]: cloneDeep(p.prototype.models),
      }),
      {} as Record<ProviderTemplateName, Model[]>,
    );
  };

  static getAllProviderTemplates = () => {
    return Object.values(ProviderClient.ProviderTemplates).reduce(
      (r, p) => ({
        ...r,
        [p.prototype.name]: p,
      }),
      {} as Record<ProviderTemplateName, ProviderTemplate>,
    );
  };

  static getProviderTemplateList = () => {
    return Object.values(ProviderClient.ProviderTemplates);
  };

  constructor(providerTemplateName: string) {
    this.provider = this.getProviderTemplate(providerTemplateName);
  }

  get settingItems() {
    const { providerMeta } = this.provider;
    const { settingItems } = providerMeta;
    return settingItems;
  }

  private getProviderTemplate(providerTemplateName: string) {
    const providerTemplate =
      Object.values(ProviderTemplates).find(
        (template) => template.prototype.name === providerTemplateName,
      ) || ProviderTemplates.NextChatProvider;

    return new providerTemplate();
  }

  getModelConfig(modelName: string) {
    const { models } = this.provider;
    return (
      models.find((config) => config.name === modelName) ||
      models.find((config) => config.isDefaultSelected)
    );
  }

  async chat(
    payload: StandChatRequestPayload<string>,
  ): Promise<StandChatReponseMessage> {
    return this.provider.chat({
      ...payload,
      stream: false,
      isVisionModel: this.getModelConfig(payload.model)?.isVisionModel,
    });
  }

  streamChat(payload: StandChatRequestPayload<string>, handlers: ChatHandlers) {
    return this.provider.streamChat(
      {
        ...payload,
        stream: true,
        isVisionModel: this.getModelConfig(payload.model)?.isVisionModel,
      },
      handlers.onProgress,
      handlers.onFinish,
      handlers.onError,
    );
  }
}

export interface Provider {
  name: string; // id of provider
  displayName: string;
  isActive: boolean;
  providerTemplateName: ProviderTemplateName;
  models: Model[];
}

function createProvider(
  provider: ProviderTemplateName,
  params?: Omit<Provider, "providerTemplateName">,
): Provider;
function createProvider(
  provider: ProviderTemplate,
  params?: Omit<Provider, "providerTemplateName">,
): Provider;
function createProvider(
  provider: ProviderTemplate | ProviderTemplateName,
  params?: Omit<Provider, "providerTemplateName">,
): Provider {
  let providerTemplate: ProviderTemplate;
  if (typeof provider === "string") {
    providerTemplate = ProviderClient.getAllProviderTemplates()[provider];
  } else {
    providerTemplate = provider;
  }
  const {
    name = providerTemplate.prototype.name,
    displayName = providerTemplate.prototype.providerMeta.displayName,
    models = providerTemplate.prototype.models,
  } = params ?? {};
  return {
    name,
    displayName,
    isActive: true,
    models,
    providerTemplateName: providerTemplate.prototype.name,
  };
}

export { createProvider };
