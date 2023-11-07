export const AnthropicConfig = {
  model: {
    model: "claude-instant-1",
    summarizeModel: "claude-instant-1",

    max_tokens_to_sample: 8192,
    temperature: 0.5,
    top_p: 0.7,
    top_k: 5,
  },
  provider: {
    name: "Anthropic" as const,
    endpoint: "https://api.anthropic.com",
    apiKey: "",
    customModels: "",
    version: "2023-06-01",

    models: [
      {
        name: "claude-instant-1",
        available: true,
      },
      {
        name: "claude-2",
        available: true,
      },
    ],
  },
};
