import { isMacOS } from "../utils";
import { getClientConfig } from "../config/client";
import {
  DEFAULT_INPUT_TEMPLATE,
  DEFAULT_SIDEBAR_WIDTH,
  StoreKey,
} from "../constant";
import { createPersistStore } from "../utils/store";
import { OpenAIConfig } from "../client/openai/config";
import { api } from "../client";
import { SubmitKey, Theme } from "../typing";
import { AnthropicConfig } from "../client/anthropic/config";

export const DEFAULT_CHAT_CONFIG = {
  enableAutoGenerateTitle: true,
  sendMemory: true,
  historyMessageCount: 4,
  compressMessageLengthThreshold: 1000,
  enableInjectSystemPrompts: true,
  template: DEFAULT_INPUT_TEMPLATE,
};
export type ChatConfig = typeof DEFAULT_CHAT_CONFIG;

export const DEFAULT_PROVIDER_CONFIG = {
  openai: OpenAIConfig.provider,
  anthropic: AnthropicConfig.provider,
  // azure: {
  //   endpoint: "https://api.openai.com",
  //   apiKey: "",
  //   version: "",
  //   ...COMMON_PROVIDER_CONFIG,
  // },
  // google: {
  //   endpoint: "https://api.anthropic.com",
  //   apiKey: "",
  //   ...COMMON_PROVIDER_CONFIG,
  // },
};

export const DEFAULT_MODEL_CONFIG = {
  openai: OpenAIConfig.model,
  anthropic: AnthropicConfig.model,
  // azure: {
  //   model: "gpt-3.5-turbo" as string,
  //   summarizeModel: "gpt-3.5-turbo",
  //
  //   temperature: 0.5,
  //   top_p: 1,
  //   max_tokens: 2000,
  //   presence_penalty: 0,
  //   frequency_penalty: 0,
  // },
  // google: {
  //   model: "chat-bison-001",
  //   summarizeModel: "claude-2",
  //
  //   temperature: 1,
  //   topP: 0.7,
  //   topK: 1,
  // },
};

export type LLMProvider = keyof typeof DEFAULT_PROVIDER_CONFIG;
export const LLMProviders = Array.from(
  Object.entries(DEFAULT_PROVIDER_CONFIG),
).map(([k, v]) => [v.name, k]);

export const DEFAULT_MASK_CONFIG = {
  provider: "openai" as LLMProvider,
  chatConfig: { ...DEFAULT_CHAT_CONFIG },
  modelConfig: { ...DEFAULT_MODEL_CONFIG },
};

export const DEFAULT_APP_CONFIG = {
  lastUpdate: Date.now(), // timestamp, to merge state

  submitKey: isMacOS() ? SubmitKey.MetaEnter : SubmitKey.CtrlEnter,
  avatar: "1f603",
  fontSize: 14,
  theme: Theme.Auto as Theme,
  tightBorder: !!getClientConfig()?.isApp,
  sendPreviewBubble: true,
  sidebarWidth: DEFAULT_SIDEBAR_WIDTH,

  disablePromptHint: false,

  dontShowMaskSplashScreen: false, // dont show splash screen when create chat
  hideBuiltinMasks: false, // dont add builtin masks

  providerConfig: { ...DEFAULT_PROVIDER_CONFIG },
  globalMaskConfig: { ...DEFAULT_MASK_CONFIG },
};

export type AppConfig = typeof DEFAULT_APP_CONFIG;
export type ProviderConfig = typeof DEFAULT_PROVIDER_CONFIG;
export type MaskConfig = typeof DEFAULT_MASK_CONFIG;
export type ModelConfig = typeof DEFAULT_MODEL_CONFIG;

export function limitNumber(
  x: number,
  min: number,
  max: number,
  defaultValue: number,
) {
  if (isNaN(x)) {
    return defaultValue;
  }

  return Math.min(max, Math.max(min, x));
}

export const ModalConfigValidator = {
  model(x: string) {
    return x as string;
  },
  max_tokens(x: number) {
    return limitNumber(x, 0, 100000, 2000);
  },
  presence_penalty(x: number) {
    return limitNumber(x, -2, 2, 0);
  },
  frequency_penalty(x: number) {
    return limitNumber(x, -2, 2, 0);
  },
  temperature(x: number) {
    return limitNumber(x, 0, 1, 1);
  },
  top_p(x: number) {
    return limitNumber(x, 0, 1, 1);
  },
};

export const useAppConfig = createPersistStore(
  { ...DEFAULT_APP_CONFIG },
  (set, get) => ({
    reset() {
      set(() => ({ ...DEFAULT_APP_CONFIG }));
    },

    getDefaultClient() {
      return api.createLLMClient(get().providerConfig, get().globalMaskConfig);
    },
  }),
  {
    name: StoreKey.Config,
    version: 4,
    migrate(persistedState, version) {
      const state = persistedState as any;

      if (version < 3.4) {
        state.modelConfig.sendMemory = true;
        state.modelConfig.historyMessageCount = 4;
        state.modelConfig.compressMessageLengthThreshold = 1000;
        state.modelConfig.frequency_penalty = 0;
        state.modelConfig.top_p = 1;
        state.modelConfig.template = DEFAULT_INPUT_TEMPLATE;
        state.dontShowMaskSplashScreen = false;
        state.hideBuiltinMasks = false;
      }

      if (version < 3.5) {
        state.customModels = "claude,claude-100k";
      }

      if (version < 3.6) {
        state.modelConfig.enableInjectSystemPrompts = true;
      }

      if (version < 3.7) {
        state.enableAutoGenerateTitle = true;
      }

      if (version < 3.8) {
        state.lastUpdate = Date.now();
      }

      if (version < 4) {
        // todo: migarte from old versions
      }

      return state as any;
    },
  },
);
