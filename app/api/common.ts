import { NextRequest, NextResponse } from "next/server";
import { getServerSideConfig } from "../config/server";
import { OPENAI_BASE_URL, ServiceProvider } from "../constant";

// import { makeAzurePath } from "../azure";
import { getIP } from "@/app/api/auth";
import { getSessionName } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getTokenLength } from "@/lib/utils";

import { isModelAvailableInServer } from "../utils/model";
import { cloudflareAIGatewayUrl } from "../utils/cloudflare";

const serverConfig = getServerSideConfig();

export async function requestOpenai(
  req: NextRequest,
  // cloneBody: any,
  // isAzure: boolean,
  // current_model?: string,
) {
  const controller = new AbortController();

  const isAzure = req.nextUrl.pathname.includes("azure/deployments");

  var authValue,
    authHeaderName = "";
  if (isAzure) {
    authValue =
      req.headers
        .get("Authorization")
        ?.trim()
        .replaceAll("Bearer ", "")
        .trim() ?? "";

    authHeaderName = "api-key";
  } else {
    authValue = req.headers.get("Authorization") ?? "";
    authHeaderName = "Authorization";
  }
  // const authValue = req.headers.get("Authorization") ?? "";
  // const authHeaderName = isAzure ? "api-key" : "Authorization";

  let path = `${req.nextUrl.pathname}`.replaceAll("/api/openai/", "");

  let baseUrl =
    (isAzure ? serverConfig.azureUrl : serverConfig.baseUrl) || OPENAI_BASE_URL;

  if (!baseUrl.startsWith("http")) {
    baseUrl = `https://${baseUrl}`;
  }

  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
  }

  // console.log("[Proxy] ", path);
  // console.log("[Base Url]", baseUrl);

  const timeoutId = setTimeout(
    () => {
      controller.abort();
    },
    10 * 60 * 1000,
  );

  if (isAzure) {
    const azureApiVersion =
      req?.nextUrl?.searchParams?.get("api-version") ||
      serverConfig.azureApiVersion;
    baseUrl = baseUrl.split("/deployments").shift() as string;
    path = `${req.nextUrl.pathname.replaceAll(
      "/api/azure/",
      "openai/",
    )}?api-version=${azureApiVersion}`;

    // Forward compatibility:
    // if display_name(deployment_name) not set, and '{deploy-id}' in AZURE_URL
    // then using default '{deploy-id}'
    if (serverConfig.customModels && serverConfig.azureUrl) {
      const modelName = path.split("/")[1];
      let realDeployName = "";
      serverConfig.customModels
        .split(",")
        .filter((v) => !!v && !v.startsWith("-") && v.includes(modelName))
        .forEach((m) => {
          const [fullName, displayName] = m.split("=");
          const [_, providerName] = fullName.split("@");
          if (providerName === "azure" && !displayName) {
            const [_, deployId] = (serverConfig?.azureUrl ?? "").split(
              "deployments/",
            );
            if (deployId) {
              realDeployName = deployId;
            }
          }
        });
      if (realDeployName) {
        console.log("[Replace with DeployId", realDeployName);
        path = path.replaceAll(modelName, realDeployName);
      }
    }
  }

  const fetchUrl = cloudflareAIGatewayUrl(`${baseUrl}/${path}`);
  console.log("fetchUrl", fetchUrl);
  const jsonBody = await req.json();
  const fetchOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      [authHeaderName]: authValue,
      ...(serverConfig.openaiOrgId && {
        "OpenAI-Organization": serverConfig.openaiOrgId,
      }),
    },
    method: req.method,
    body: JSON.stringify(jsonBody),
    // to fix #2485: https://stackoverflow.com/questions/55920957/cloudflare-worker-typeerror-one-time-use-body
    redirect: "manual",
    // @ts-ignore
    duplex: "half",
    signal: controller.signal,
  };

  // console.log('4444444444444444', fetchUrl, req.body)
  requestLog(req, jsonBody, path);
  // #1815 try to refuse gpt4 request
  if (serverConfig.customModels && req.body) {
    try {
      const clonedBody = await req.text();
      fetchOptions.body = clonedBody;

      const jsonBody = JSON.parse(clonedBody) as { model?: string };

      // not undefined and is false
      if (
        isModelAvailableInServer(
          serverConfig.customModels,
          jsonBody?.model as string,
          ServiceProvider.OpenAI as string,
        ) ||
        isModelAvailableInServer(
          serverConfig.customModels,
          jsonBody?.model as string,
          ServiceProvider.Azure as string,
        )
      ) {
        return NextResponse.json(
          {
            error: true,
            message: `you are not allowed to use ${jsonBody?.model} model`,
          },
          {
            status: 403,
          },
        );
      }
    } catch (e) {
      console.error("[OpenAI] gpt4 filter", e);
    }
  }

  try {
    const res = await fetch(fetchUrl, fetchOptions);

    // Extract the OpenAI-Organization header from the response
    const openaiOrganizationHeader = res.headers.get("OpenAI-Organization");

    // Check if serverConfig.openaiOrgId is defined and not an empty string
    if (serverConfig.openaiOrgId && serverConfig.openaiOrgId.trim() !== "") {
      // If openaiOrganizationHeader is present, log it; otherwise, log that the header is not present
      console.log("[Org ID]", openaiOrganizationHeader);
    } else {
      // console.log("[Org ID] is not set up.");
    }

    // to prevent browser prompt for credentials
    const newHeaders = new Headers(res.headers);
    newHeaders.delete("www-authenticate");
    // to disable nginx buffering
    newHeaders.set("X-Accel-Buffering", "no");

    // Conditionally delete the OpenAI-Organization header from the response if [Org ID] is undefined or empty (not setup in ENV)
    // Also, this is to prevent the header from being sent to the client
    if (!serverConfig.openaiOrgId || serverConfig.openaiOrgId.trim() === "") {
      newHeaders.delete("OpenAI-Organization");
    }

    // The latest version of the OpenAI API forced the content-encoding to be "br" in json response
    // So if the streaming is disabled, we need to remove the content-encoding header
    // Because Vercel uses gzip to compress the response, if we don't remove the content-encoding header
    // The browser will try to decode the response with brotli and fail
    newHeaders.delete("content-encoding");

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: newHeaders,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function requestLog(
  req: NextRequest,
  jsonBody: any,
  url_path: string,
) {
  // LOG
  try {
    if (url_path.startsWith("mj/") && !url_path.startsWith("mj/submit/")) {
      return;
    }
    const baseUrl = "http://localhost:3000";
    const ip = getIP(req);

    let { session, name } = await getSessionName();
    // console.log("[中文]", name, session, baseUrl);
    const logData = {
      ip: ip,
      path: url_path,
      logEntry: JSON.stringify(jsonBody),
      model: url_path.startsWith("mj/") ? "midjourney" : jsonBody?.model, // 后面尝试请求是添加到参数
      userName: name,
      userID: session?.user?.id,
    };
    saveLogs(logData);
  } catch (e) {
    console.log("[LOG]", e, "==========");
  }
}

export async function saveLogs(logData: {
  ip?: string;
  path?: string;
  logEntry?: string;
  model?: string;
  userName?: string;
  userID?: string;
  logToken?: number;
}) {
  try {
    if (logData?.logEntry) {
      const regex_message = /(?<="content":")(.*?)(?="}[,\]])/g;
      const matchAllMessage = logData.logEntry.match(regex_message);
      // console.log(matchAllMessage, "=====");
      if (matchAllMessage && matchAllMessage.length > 0) {
        logData.logToken =
          getTokenLength(matchAllMessage.join(" ")) +
          matchAllMessage.length * 3;
      }
      console.log("[debug log]----", logData);
      delete logData?.logEntry;
    }
    if (logData?.model == "midjourney") {
      logData.logToken = 1000;
    }
  } catch (e) {
    console.log("[LOG]", "logToken", e);
    logData.logToken = 0;
  }
  try {
    const result = await prisma.logEntry.create({
      data: logData,
    });
  } catch (e) {
    // console.log("-------[debug log2]", logData);
    delete logData?.userID;
    const result = await prisma.logEntry.create({
      data: logData,
    });
  }

  // console.log("result", result)
}
