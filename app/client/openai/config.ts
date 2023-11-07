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
    name: "OpenAI" as const,
    endpoint: "https://api.openai.com",
    apiKey: "",
    customModels: "",
    autoFetchModels: false, // fetch available models from server or not

    models: [
      {
        name: "gpt-4",
        available: true,
      },
      {
        name: "gpt-4-0314",
        available: true,
      },
      {
        name: "gpt-4-0613",
        available: true,
      },
      {
        name: "gpt-4-32k",
        available: true,
      },
      {
        name: "gpt-4-32k-0314",
        available: true,
      },
      {
        name: "gpt-4-32k-0613",
        available: true,
      },
      {
        name: "gpt-3.5-turbo",
        available: true,
      },
      {
        name: "gpt-3.5-turbo-0301",
        available: true,
      },
      {
        name: "gpt-3.5-turbo-0613",
        available: true,
      },
      {
        name: "gpt-3.5-turbo-16k",
        available: true,
      },
      {
        name: "gpt-3.5-turbo-16k-0613",
        available: true,
      },
    ],
  },
};
