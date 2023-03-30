import { NextRequest } from "next/server";

const OPENAI_URL = "api.openai.com";
const DEFAULT_PROTOCOL = "https";
const PROTOCOL = process.env.PROTOCOL ?? DEFAULT_PROTOCOL;
const BASE_URL = process.env.BASE_URL ?? OPENAI_URL;

export async function requestOpenai(req: NextRequest) {
  const apiKey = req.headers.get("token");
  const openaiPath = req.headers.get("path");
  const openaiEndpoint = `${PROTOCOL}://${BASE_URL}/${openaiPath}`;
  const azureApiKey = req.headers.get("azure-api-key");
  const azureAccount = req.headers.get("azure-account");
  const azureModel = req.headers.get("azure-model");
  const azureEndpoint = `https://${azureAccount}.openai.azure.com/openai/deployments/${azureModel}/chat/completions?api-version=2023-03-15-preview`;

  const endpoint = apiKey ? openaiEndpoint : azureEndpoint;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }
  if (azureApiKey) {
    headers["api-key"] = azureApiKey;
  }

  console.log("[Proxy] ", endpoint);

  return fetch(endpoint, {
    headers,
    method: req.method,
    body: req.body,
  });
}
