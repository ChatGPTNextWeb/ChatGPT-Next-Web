import {
  ChatRequestPayload,
  Model,
  ModelSettings,
  InternalChatHandlers,
} from "../common";
import { Provider, ProviderClient } from "./providerClient";

export class ModelClient {
  constructor(
    private model: Model,
    private modelSettings: ModelSettings,
    private providerClient: ProviderClient,
  ) {}

  chat(payload: ChatRequestPayload, handlers: InternalChatHandlers) {
    try {
      return this.providerClient.streamChat(
        {
          ...payload,
          modelConfig: {
            ...this.modelSettings,
            max_tokens:
              this.model.max_tokens ?? this.modelSettings.global_max_tokens,
          },
          model: this.model.name,
        },
        handlers,
      );
    } catch (e) {
      handlers.onError(e as Error);
    }
  }

  summerize(payload: ChatRequestPayload) {
    try {
      return this.providerClient.chat({
        ...payload,
        modelConfig: {
          ...this.modelSettings,
          max_tokens:
            this.model.max_tokens ?? this.modelSettings.global_max_tokens,
        },
        model: this.model.name,
      });
    } catch (e) {
      return "";
    }
  }
}

// must generate new ModelClient during every chat
export function ModelClientFactory(
  model: Model,
  provider: Provider,
  modelSettings: ModelSettings,
) {
  const providerClient = new ProviderClient(provider);
  return new ModelClient(model, modelSettings, providerClient);
}

export function getFiltertModels(
  models: readonly Model[],
  customModels: string,
) {
  const modelTable: Record<string, Model> = {};

  // default models
  models.forEach((m) => {
    modelTable[m.name] = m;
  });

  // server custom models
  customModels
    .split(",")
    .filter((v) => !!v && v.length > 0)
    .forEach((m) => {
      const available = !m.startsWith("-");
      const nameConfig =
        m.startsWith("+") || m.startsWith("-") ? m.slice(1) : m;
      const [name, displayName] = nameConfig.split("=");

      // enable or disable all models
      if (name === "all") {
        Object.values(modelTable).forEach(
          (model) => (model.available = available),
        );
      } else {
        modelTable[name] = {
          ...modelTable[name],
          displayName,
          available,
        };
      }
    });

  return modelTable;
}
