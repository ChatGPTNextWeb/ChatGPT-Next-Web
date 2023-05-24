import { NextRequest } from "next/server";

export const OPENAI_URL = "api.openai.com";
const DEFAULT_PROTOCOL = "https";
const PROTOCOL = process.env.PROTOCOL ?? DEFAULT_PROTOCOL;

export async function requestOpenai(req: NextRequest) {
  const controller = new AbortController();
  const authValue = req.headers.get("Authorization") ?? "";
  const azureApiKey = req.headers.get("azure-api-key") ?? "";
  const azureDomainName = req.headers.get("azure-domain-name") ?? "";
  const AZURE_OPENAI_URL = `${azureDomainName}.openai.azure.com`;
  const openaiPath = `${req.nextUrl.pathname}${req.nextUrl.search}`.replaceAll(
    "/api/openai/",
    "",
  );

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

  if (process.env.OPENAI_ORG_ID) {
    console.log("[Org ID]", process.env.OPENAI_ORG_ID);
  }

  if (!azureApiKey && (!authValue || !authValue.startsWith("Bearer sk-"))) {
    console.error("[OpenAI Request] invalid api key provided", authValue);
  }
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 10 * 60 * 1000);

  const fetchUrl = `${baseUrl}/${openaiPath}`;
  const fetchOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      Authorization: authValue,
      "api-key": azureApiKey,
      ...(process.env.OPENAI_ORG_ID && {
        "OpenAI-Organization": process.env.OPENAI_ORG_ID,
      }),
    },
    cache: "no-store",
    method: req.method,
    body: req.body,
    signal: controller.signal,
  };

  try {
    const res = await fetch(fetchUrl, fetchOptions);

    if (res.status === 401) {
      // to prevent browser prompt for credentials
      res.headers.delete("www-authenticate");
    }

    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}
