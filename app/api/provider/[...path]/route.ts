import * as ProviderTemplates from "@/app/client/providers";
import { getServerSideConfig } from "@/app/config/server";
import { NextRequest, NextResponse } from "next/server";
import { cloneDeep } from "lodash-es";
import {
  disableSystemApiKey,
  makeUrlsUsable,
  modelNameRequestHeader,
} from "@/app/client/common";
import { collectModelTable } from "@/app/utils/model";

async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const [providerName] = params.path;
  const { headers } = req;
  const serverConfig = getServerSideConfig();
  const modelName = headers.get(modelNameRequestHeader);

  const ProviderTemplate = Object.values(ProviderTemplates).find(
    (t) => t.prototype.name === providerName,
  );

  if (!ProviderTemplate) {
    return NextResponse.json(
      {
        error: true,
        message: "No provider found: " + providerName,
      },
      {
        status: 404,
      },
    );
  }

  // #1815 try to refuse gpt4 request
  if (modelName && serverConfig.customModels) {
    try {
      const modelTable = collectModelTable([], serverConfig.customModels);

      // not undefined and is false
      if (modelTable[modelName]?.available === false) {
        return NextResponse.json(
          {
            error: true,
            message: `you are not allowed to use ${modelName} model`,
          },
          {
            status: 403,
          },
        );
      }
    } catch (e) {
      console.error("models filter", e);
    }
  }

  const config = disableSystemApiKey(
    makeUrlsUsable(cloneDeep(serverConfig), [
      "anthropicUrl",
      "azureUrl",
      "googleUrl",
      "baseUrl",
    ]),
    ["anthropicApiKey", "azureApiKey", "googleApiKey", "apiKey"],
    serverConfig.needCode &&
      ProviderTemplate !== ProviderTemplates.NextChatProvider, // if it must take a access code in the req, do not provide system-keys for Non-nextchat providers
  );

  const request = Object.assign({}, req, {
    subpath: params.path.join("/"),
  });

  return new ProviderTemplate().serverSideRequestHandler(request, config);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;

export const runtime = "edge";
export const preferredRegion = Array.from(
  new Set(
    Object.values(ProviderTemplates).reduce(
      (arr, t) => [...arr, ...(t.prototype.preferredRegion ?? [])],
      [] as string[],
    ),
  ),
);
