import { ChatRequestPayload, Model, ModelConfig, ChatHandlers } from "./types";
import { ProviderClient, ProviderTemplateName } from "./providerClient";

export class ModelClient {
  static getAllProvidersDefaultModels = () => {
    return ProviderClient.getAllProvidersDefaultModels();
  };

  constructor(
    private model: Model,
    private modelConfig: ModelConfig,
    private providerClient: ProviderClient,
  ) {}

  chat(payload: ChatRequestPayload, handlers: ChatHandlers) {
    try {
      return this.providerClient.streamChat(
        {
          ...payload,
          modelConfig: this.modelConfig,
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
        modelConfig: this.modelConfig,
        model: this.model.name,
      });
    } catch (e) {
      return "";
    }
  }
}

export function ModelClientFactory(model: Model, modelConfig: ModelConfig) {
  const providerClient = new ProviderClient(model.providerTemplateName);
  return new ModelClient(model, modelConfig, providerClient);
}
