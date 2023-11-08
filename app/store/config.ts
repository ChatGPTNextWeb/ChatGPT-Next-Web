import { LLMModel } from "../client/api";
import { isMacOS } from "../utils";
import { getClientConfig } from "../config/client";
import {
  DEFAULT_INPUT_TEMPLATE,
  DEFAULT_MODELS,
  DEFAULT_SIDEBAR_WIDTH,
  StoreKey,
} from "../constant";
import { createPersistStore } from "../utils/store";

export type ModelType = (typeof DEFAULT_MODELS)[number]["name"];

export enum SubmitKey {
  Enter = "Enter",
  CtrlEnter = "Ctrl + Enter",
  ShiftEnter = "Shift + Enter",
  AltEnter = "Alt + Enter",
  MetaEnter = "Meta + Enter",
}

export enum Theme {
  Auto = "auto",
  Dark = "dark",
  Light = "light",
}

export const DEFAULT_CONFIG = {
  lastUpdate: Date.now(), // timestamp, to merge state

  submitKey: isMacOS() ? SubmitKey.MetaEnter : SubmitKey.CtrlEnter,
  avatar: "1f603",
  fontSize: 14,
  theme: Theme.Auto as Theme,
  tightBorder: !!getClientConfig()?.isApp,
  sendPreviewBubble: true,
  enableAutoGenerateTitle: true,
  sidebarWidth: DEFAULT_SIDEBAR_WIDTH,

  disablePromptHint: false,

  dontShowMaskSplashScreen: false, // dont show splash screen when create chat
  hideBuiltinMasks: false, // dont add builtin masks

  customModels: "",
  models: DEFAULT_MODELS as any as LLMModel[],

  modelConfig: {
    model: "gpt-3.5-turbo" as ModelType,
    temperature: 0.5,
    top_p: 1,
    max_tokens: 4000,
    presence_penalty: 0,
    frequency_penalty: 0,
    /**
     * DALL·E Models
     * Author: @H0llyW00dzZ
     **/
    n: 1, // The number of images to generate. Must be between 1 and 10. For dall-e-3, only n=1 is supported.
    /** Quality Only DALL·E-3 Models
     * Author: @H0llyW00dzZ
     * The quality of the image that will be generated. 
     * `hd` creates images with finer details and greater consistency across the image.
     **/
    quality: "hd", // Only DALL·E-3 for DALL·E-2 not not really needed
    /** SIZE ALL DALL·E Models
     * Author: @H0llyW00dzZ
     * DALL·E-2 : Must be one of `256x256`, `512x512`, or `1024x1024`.
     * DALL-E-3 : Must be one of `1024x1024`, `1792x1024`, or `1024x1792`.
     **/
    size: "1024x1024",
    /** Style DALL-E-3 Models
     * Author: @H0llyW00dzZ
     * Must be one of `vivid` or `natural`. 
     * `Vivid` causes the model to lean towards generating hyper-real and dramatic images. 
     * `Natural` causes the model to produce more natural, less hyper-real looking images. 
     */
    style: "vivid", // Only DALL·E-3 for DALL·E-2 not really needed
    sendMemory: true,
    historyMessageCount: 4,
    compressMessageLengthThreshold: 1000,
    enableInjectSystemPrompts: true,
    template: DEFAULT_INPUT_TEMPLATE,
  },
};

export type ChatConfig = typeof DEFAULT_CONFIG;

export type ModelConfig = ChatConfig["modelConfig"];

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
    return x as ModelType;
  },
  max_tokens(x: number) {
    return limitNumber(x, 0, 512000, 1024);
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
  n(x: number) {
    return limitNumber(x, 1, 10, 1);
  },
  quality(x: string) {
    return ["hd"].includes(x) ? x : "hd";
  },
  size(x: string) {
    const validSizes = ["256x256", "512x512", "1024x1024", "1792x1024", "1024x1792"];
    return validSizes.includes(x) ? x : "1024x1024";
  },
  style(x: string) {
    const validStyles = ["vivid", "natural"];
    return validStyles.includes(x) ? x : "vivid";
  },
};

export const useAppConfig = createPersistStore(
  { ...DEFAULT_CONFIG },
  (set, get) => ({
    reset() {
      set(() => ({ ...DEFAULT_CONFIG }));
    },

    mergeModels(newModels: LLMModel[]) {
      if (!newModels || newModels.length === 0) {
        return;
      }

      const oldModels = get().models;
      const modelMap: Record<string, LLMModel> = {};

      for (const model of oldModels) {
        model.available = false;
        modelMap[model.name] = model;
      }

      for (const model of newModels) {
        model.available = true;
        modelMap[model.name] = model;
      }

      set(() => ({
        models: Object.values(modelMap),
      }));
    },

    allModels() {},
  }),
  {
    name: StoreKey.Config,
    version: 4.1, // DALL·E Models switching version to 4.1 from 3.8 (in 3.9 I am using it for text moderation) because in 4.0 @Yidadaa using it.
    migrate(persistedState, version) {
      const state = persistedState as ChatConfig;

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

      if (version < 4.1) {
        state.modelConfig = {
          ...state.modelConfig,
          n: 1,
          quality: "hd",
          size: "1024x1024",
          style: "vivid",
        };
      }

      return state as any;
    },
  },
);
