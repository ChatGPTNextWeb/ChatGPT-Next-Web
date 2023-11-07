import { MaskConfig, ProviderConfig } from "../store";
import { shareToShareGPT } from "./common/share";
import { createOpenAiClient } from "./openai";
import { ChatControllerPool } from "./common/controller";
import { createAnthropicClient } from "./anthropic";

export const LLMClients = {
  openai: createOpenAiClient,
  anthropic: createAnthropicClient,
};

export function createLLMClient(
  config: ProviderConfig,
  maskConfig: MaskConfig,
) {
  return LLMClients[maskConfig.provider as any as keyof typeof LLMClients](
    config,
    maskConfig.modelConfig,
  );
}

export function createApi() {
  return {
    createLLMClient,
    shareToShareGPT,
    controllerManager: ChatControllerPool,
  };
}

export const api = createApi();
