import { COMMON_PROVIDER_CONFIG } from "../common/config";

export const OpenAIConfig = {
  model: {
    model: "gpt-3.5-turbo" as string,
    summarizeModel: "gpt-3.5-turbo",

    temperature: 0.5,
    top_p: 1,
    max_tokens: 2000,
    presence_penalty: 0,
    frequency_penalty: 0,
  },
  provider: {
    name: "OpenAI",
    endpoint: "https://api.openai.com",
    apiKey: "",
    ...COMMON_PROVIDER_CONFIG,
  },
};
