import { ChatCompletionRequestMessage } from "openai";
import { ModelType } from "../store";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AZURE_OPENAI_API_BASE = process.env.AZURE_OPENAI_API_BASE;

export async function requestOpenai(
  input: ChatCompletionRequestMessage[],
  deployment: ModelType,
  response_max_tokens: number,
  temperature: number,
) {
  const apiUrl = `${AZURE_OPENAI_API_BASE}/openai/deployments/${deployment}/chat/completions?api-version=2023-07-01-preview`;
  const apiKey: string | undefined = OPENAI_API_KEY;

  const requestData = {
    messages: input,
    max_tokens: response_max_tokens,
    temperature: temperature,
    frequency_penalty: 0,
    presence_penalty: 0,
    top_p: 1,
    stop: null,
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "content-type": "application/json", "api-key": apiKey ?? "" },
    body: JSON.stringify(requestData),
  });

  const data = await response.json();
  if (!data?.choices) {
    return undefined;
  }
  return data.choices[0].message.content;
}
