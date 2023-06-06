import { NextRequest } from "next/server";

// const OPENAI_URL = "api.openai.com";
const DEFAULT_PROTOCOL = "https";
const PROTOCOL = DEFAULT_PROTOCOL;
// const BASE_URL = process.env.BASE_URL ?? OPENAI_URL;

//for Azure Open AI Service
const AZURE_OPENAI_API_BASE = process.env.AZURE_OPENAI_API_BASE;
const AZURE_OPENAI_DEPLOYMENT_NAME = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AZURE_OPENAI_PATH = "chat/completions?api-version=2023-03-15-preview";

export async function requestOpenai(req: NextRequest) {
  //ONLY get API key from environemnt variable
  //const apiKey = req.headers.get("token");

  // const openaiPath = req.headers.get("path");
  //For Azure Open AI Service, the path is predefined
  //Check Azure doc for more details:
  //https://learn.microsoft.com/en-us/azure/cognitive-services/openai/chatgpt-quickstart?tabs=command-line&pivots=rest-api

  // console.log("[Proxy] ", openaiPath);
  console.log(
    "[Proxy] ",
    `${AZURE_OPENAI_API_BASE}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT_NAME}/${AZURE_OPENAI_PATH}`,
  );

  return fetch(
    `${AZURE_OPENAI_API_BASE}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT_NAME}/${AZURE_OPENAI_PATH}`,
    {
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${apiKey}`,
        // A bit different here than the OpenAI API
        "api-key": `${OPENAI_API_KEY}`,
      },
      method: req.method,
      body: req.body,
      duplex: "half",
    } as RequestInit & { duplex: "half" },
  );
}
