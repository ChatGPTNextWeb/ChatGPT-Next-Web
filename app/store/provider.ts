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

const firstUpdate = Date.now();

function getDefaultConfig() {
  const providers = Object.values(ProviderClient.ProviderTemplates)
    .filter((t) => !(t instanceof NextChatProvider))
    .map((t) => createProvider(t, true));

  const initProvider = providers[0];

  const currentModel =
    initProvider.models.find((m) => m.isDefaultSelected) ||
    initProvider.models[0];

  return {
    lastUpdate: firstUpdate, // timestamp, to merge state

    currentModel: currentModel.name,
    currentProvider: initProvider.name,

    providers,
  };
}

export type ProvidersConfig = ReturnType<typeof getDefaultConfig>;

export const useProviders = createPersistStore(
  { ...getDefaultConfig() },
  (set, get) => {
    const methods = {
      reset() {
        set(() => getDefaultConfig());
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

      addModel(
        model: Omit<Model, "providerTemplateName" | "customized">,
        provider: Provider,
      ) {
        const newModel: Model = {
          ...model,
          providerTemplateName: provider.providerTemplateName,
          customized: true,
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

      switchModel(model: Model, provider: Provider) {
        set(() => ({
          currentModel: model.name,
          currentProvider: provider.name,
        }));
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
