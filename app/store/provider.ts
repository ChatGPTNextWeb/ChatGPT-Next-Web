import {
  ProviderClient,
  NextChatProvider,
  createProvider,
  Provider,
  Model,
} from "@/app/client";
// import { getClientConfig } from "../config/client";
import { StoreKey } from "../constant";
import { createPersistStore } from "../utils/store";

export const DEFAULT_CONFIG = {
  lastUpdate: Date.now(), // timestamp, to merge state

  providers: ProviderClient.getProviderTemplateList()
    .filter((p) => p !== NextChatProvider)
    .map((p) => createProvider(p)),
};

export type ProvidersConfig = typeof DEFAULT_CONFIG;

export const useProviders = createPersistStore(
  { ...DEFAULT_CONFIG },
  (set, get) => {
    const methods = {
      reset() {
        set(() => ({ ...DEFAULT_CONFIG }));
      },

      addProvider(provider: Provider) {
        set(() => ({
          providers: [...get().providers, provider],
        }));
      },

      deleteProvider(provider: Provider) {
        set(() => ({
          providers: [
            ...get().providers.filter((p) => p.name !== provider.name),
          ],
        }));
      },

      updateProvider(provider: Provider) {
        set(() => ({
          providers: get().providers.map((p) =>
            p.name === provider.name ? provider : p,
          ),
        }));
      },

      getProvider(providerName: string) {
        return get().providers.find((p) => p.name === providerName);
      },

      addModel(model: Omit<Model, "providerTemplateName">, provider: Provider) {
        const newModel: Model = {
          providerTemplateName: provider.providerTemplateName,
          ...model,
        };
        return methods.updateProvider({
          ...provider,
          models: [...provider.models, newModel],
        });
      },

      deleteModel(model: Model, provider: Provider) {
        return methods.updateProvider({
          ...provider,
          models: provider.models.filter((m) => m.name !== model.name),
        });
      },

      updateModel(model: Model, provider: Provider) {
        return methods.updateProvider({
          ...provider,
          models: provider.models.map((m) =>
            m.name === model.name ? model : m,
          ),
        });
      },

      getModel(
        modelName: string,
        providerName: string,
      ): (Model & { providerName: string }) | undefined {
        const provider = methods.getProvider(providerName);
        const model = provider?.models.find((m) => m.name === modelName);
        return model
          ? {
              ...model,
              providerName: provider!.name,
            }
          : undefined;
      },

      allModels() {},
    };

    return methods;
  },
  {
    name: StoreKey.Provider,
    version: 1.0,
    migrate(persistedState, version) {
      const state = persistedState as ProvidersConfig;

      return state as any;
    },
  },
);
