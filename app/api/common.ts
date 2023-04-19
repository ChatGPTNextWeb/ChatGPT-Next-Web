import { NextRequest } from "next/server";

const OPENAI_URL = "api.openai.com";
const AZURE_OPENAI_URL = "azure-openai-gpt.openai.azure.com";
const DEFAULT_PROTOCOL = "https";
const PROTOCOL = process.env.PROTOCOL ?? DEFAULT_PROTOCOL;

export async function requestOpenai(req: NextRequest) {
  const apiKey = req.headers.get("token");
  const openaiPath = req.headers.get("path");

  let baseUrl = OPENAI_URL;
  if (openaiPath?.includes("/deployments/")) {
    baseUrl = AZURE_OPENAI_URL;
  }
  if (process.env.BASE_URL) {
    baseUrl = process.env.BASE_URL;
  }

  if (!baseUrl.startsWith("http")) {
    baseUrl = `${PROTOCOL}://${baseUrl}`;
  }

  console.log("[Proxy] ", openaiPath);
  console.log("[Base Url]", baseUrl);

  return fetch(`${baseUrl}/${openaiPath}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "api-key": apiKey || "",
    },
    method: req.method,
    body: req.body,
  });
}
