import {
  IProviderTemplate,
  InternalChatHandlers,
  Model,
  ModelTemplate,
  ProviderTemplate,
  StandChatReponseMessage,
  StandChatRequestPayload,
  isSameOrigin,
  modelNameRequestHeader,
} from "../common";
import * as ProviderTemplates from "@/app/client/providers";
import { nanoid } from "nanoid";

export type ProviderTemplateName =
  (typeof ProviderTemplates)[keyof typeof ProviderTemplates]["prototype"]["name"];

export interface Provider<
  Providerconfig extends Record<string, any> = Record<string, any>,
> {
  name: string; // id of provider
  isActive: boolean;
  providerTemplateName: ProviderTemplateName;
  providerConfig: Providerconfig;
  isDefault: boolean; // Not allow to modify models of default provider
  updated: boolean; // provider initial is finished

  displayName: string;
  models: Model[];
}

const providerTemplates = Object.values(ProviderTemplates).reduce(
  (r, t) => ({
    ...r,
    [t.prototype.name]: new t(),
  }),
  {} as Record<ProviderTemplateName, ProviderTemplate>,
);

export class ProviderClient {
  providerTemplate: IProviderTemplate<any, any, any>;
  genFetch: (modelName: string) => typeof window.fetch;

  static ProviderTemplates = providerTemplates;

  static getAllProviderTemplates = () => {
    return Object.values(providerTemplates).reduce(
      (r, t) => ({
        ...r,
        [t.name]: t,
      }),
      {} as Record<ProviderTemplateName, ProviderTemplate>,
    );
  };

  static getProviderTemplateMetaList = () => {
    return Object.values(providerTemplates).map((t) => ({
      ...t.providerMeta,
      name: t.name,
    }));
  };

  constructor(private provider: Provider) {
    const { providerTemplateName } = provider;
    this.providerTemplate = this.getProviderTemplate(providerTemplateName);
    this.genFetch =
      (modelName: string) =>
      (...args) => {
        const req = new Request(...args);
        const headers: Record<string, any> = {
          ...req.headers,
        };
        if (isSameOrigin(req.url)) {
          headers[modelNameRequestHeader] = modelName;
        }

        return window.fetch(req.url, {
          method: req.method,
          keepalive: req.keepalive,
          headers,
          body: req.body,
          redirect: req.redirect,
          integrity: req.integrity,
          signal: req.signal,
          credentials: req.credentials,
          mode: req.mode,
          referrer: req.referrer,
          referrerPolicy: req.referrerPolicy,
        });
      };
  }

  private getProviderTemplate(providerTemplateName: string) {
    const providerTemplate = Object.values(providerTemplates).find(
      (template) => template.name === providerTemplateName,
    );

    return providerTemplate || providerTemplates.openai;
  }

  private getModelConfig(modelName: string) {
    const { models } = this.provider;
    return (
      models.find((m) => m.name === modelName) ||
      models.find((m) => m.isDefaultSelected)
    );
  }

  getAvailableModels() {
    return Promise.resolve(
      this.providerTemplate.getAvailableModels?.(this.provider.providerConfig),
    )
      .then((res) => {
        const { defaultModels } = this.providerTemplate;
        const availableModelsSet = new Set(
          (res ?? defaultModels).map((o) => o.name),
        );
        return defaultModels.filter((m) => availableModelsSet.has(m.name));
      })
      .catch(() => {
        return this.providerTemplate.defaultModels;
      });
  }

  async chat(
    payload: StandChatRequestPayload,
  ): Promise<StandChatReponseMessage> {
    return this.providerTemplate.chat(
      {
        ...payload,
        stream: false,
        isVisionModel: this.getModelConfig(payload.model)?.isVisionModel,
        providerConfig: this.provider.providerConfig,
      },
      this.genFetch(payload.model),
    );
  }

  streamChat(payload: StandChatRequestPayload, handlers: InternalChatHandlers) {
    let responseText = "";
    let remainText = "";

    const timer = this.providerTemplate.streamChat(
      {
        ...payload,
        stream: true,
        isVisionModel: this.getModelConfig(payload.model)?.isVisionModel,
        providerConfig: this.provider.providerConfig,
      },
      {
        onProgress: (chunk) => {
          remainText += chunk;
        },
        onError: (err) => {
          handlers.onError(err);
        },
        onFinish: () => {},
        onFlash: (message: string) => {
          handlers.onFinish(message);
        },
      },
      this.genFetch(payload.model),
    );

    timer.signal.onabort = () => {
      const message = responseText + remainText;
      remainText = "";
      handlers.onFinish(message);
    };

    const animateResponseText = () => {
      if (remainText.length > 0) {
        const fetchCount = Math.max(1, Math.round(remainText.length / 60));
        const fetchText = remainText.slice(0, fetchCount);
        responseText += fetchText;
        remainText = remainText.slice(fetchCount);
        handlers.onProgress(responseText, fetchText);
      }

      requestAnimationFrame(animateResponseText);
    };

    // start animaion
    animateResponseText();

    return timer;
  }
}

type Params = Omit<Provider, "providerTemplateName" | "name" | "isDefault">;

function createProvider(
  provider: ProviderTemplateName,
  isDefault: true,
): Provider;
function createProvider(provider: ProviderTemplate, isDefault: true): Provider;
function createProvider(
  provider: ProviderTemplateName,
  isDefault: false,
  params: Params,
): Provider;
function createProvider(
  provider: ProviderTemplate,
  isDefault: false,
  params: Params,
): Provider;
function createProvider(
  provider: ProviderTemplate | ProviderTemplateName,
  isDefault: boolean,
  params?: Params,
): Provider {
  let providerTemplate: ProviderTemplate;
  if (typeof provider === "string") {
    providerTemplate = ProviderClient.getAllProviderTemplates()[provider];
  } else {
    providerTemplate = provider;
  }

  const name = `${providerTemplate.name}__${nanoid()}`;

  const {
    displayName = providerTemplate.providerMeta.displayName,
    models = providerTemplate.defaultModels.map((m) =>
      createModelFromModelTemplate(m, providerTemplate, name),
    ),
    providerConfig,
  } = params ?? {};

  return {
    name,
    displayName,
    isActive: true,
    models,
    providerTemplateName: providerTemplate.name,
    providerConfig: isDefault ? {} : providerConfig!,
    isDefault,
    updated: true,
  };
}

function createModelFromModelTemplate(
  m: ModelTemplate,
  p: ProviderTemplate,
  providerName: string,
) {
  return {
    ...m,
    providerTemplateName: p.name,
    providerName,
    isActive: m.isDefaultActive,
    available: true,
    customized: false,
  };
}

export { createProvider };
