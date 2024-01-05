import { NextRequest, NextResponse } from "next/server";
import { getServerSideConfig } from "../config/server";
import { DEFAULT_MODELS, OPENAI_BASE_URL } from "../constant";
import { collectModelTable } from "../utils/model";
import { makeAzurePath } from "../azure";
// import { Readable } from 'stream'
// const streamifier = require('streamifier');



import nodefetch from 'node-fetch';
import FormData from 'form-data';

const tunnel = require('tunnel');
// const fs = require('fs');
// const nodepath = require('path');

// const FormData = require('form-data');





const serverConfig = getServerSideConfig();

const agent = tunnel.httpsOverHttp({
  proxy: {
    host: '127.0.0.1',
    port: process.env.PROXY_PORT,
  },
});



export async function requestOpenai(req: NextRequest) {
  const controller = new AbortController();

  const authValue = req.headers.get("Authorization") ?? "";
  const authHeaderName = serverConfig.isAzure ? "api-key" : "Authorization";

  let path = `${req.nextUrl.pathname}${req.nextUrl.search}`.replaceAll(
    "/api/openai/",
    "",
  );

  let baseUrl =
    serverConfig.azureUrl || serverConfig.baseUrl || OPENAI_BASE_URL;

  if (!baseUrl.startsWith("http")) {
    baseUrl = `https://${baseUrl}`;
  }

  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
  }

  console.log("[Proxy] ", path);
  console.log("[Base Url]", baseUrl);
  // this fix [Org ID] undefined in server side if not using custom point
  if (serverConfig.openaiOrgId !== undefined) {
    console.log("[Org ID]", serverConfig.openaiOrgId);
  }

  const timeoutId = setTimeout(
    () => {
      controller.abort();
    },
    10 * 60 * 1000,
  );

  if (serverConfig.isAzure) {
    if (!serverConfig.azureApiVersion) {
      return NextResponse.json({
        error: true,
        message: `missing AZURE_API_VERSION in server env vars`,
      });
    }
    path = makeAzurePath(path, serverConfig.azureApiVersion);
  }

  const fetchUrl = `${baseUrl}/${path}`;


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
    body: req.body,
    // to fix #2485: https://stackoverflow.com/questions/55920957/cloudflare-worker-typeerror-one-time-use-body
    redirect: "manual",
    // @ts-ignore
    duplex: "half",
    signal: controller.signal,
    // agent
  };


  // #1815 try to refuse gpt4 request
  if (serverConfig.customModels && req.body) {
    try {
      const modelTable = collectModelTable(
        DEFAULT_MODELS,
        serverConfig.customModels,
      );
      const clonedBody = await req.text();
      fetchOptions.body = clonedBody;

      const jsonBody = JSON.parse(clonedBody) as { model?: string };

      // not undefined and is false
      if (modelTable[jsonBody?.model ?? ""].available === false) {
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

    // to prevent browser prompt for credentials
    const newHeaders = new Headers(res.headers);
    newHeaders.delete("www-authenticate");
    // to disable nginx buffering
    newHeaders.set("X-Accel-Buffering", "no");

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: newHeaders,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}


//目前只针对WhisperConversion
export async function requestWhisperConversion(req: NextRequest) {

  

  

  const reqformData = await (req.formData()  as any )

  const formData = new FormData();

  const fileObject = reqformData.get('file');

  // fs.writeFileSync(tempFilePath, fileObject.stream());
  // fileObject.pipe(fs.createWriteStream(tempFilePath));
  // const stream = fs.createReadStream(tempFilePath);
  // const fileBuffer = await fileObject;
  // const stream = streamifier.createReadStream(fileObject);

  formData.append('model', 'whisper-1');
  // const formData = new FormData();  // formData.append('file', (reqformData.get('file')),'adiou.webm');
  // formData.append('model', 'whisper-1');
  formData.append('file', Buffer.from(await fileObject.arrayBuffer()),'audio.webm');
  // formData.append('language', "zh");



  const authValue = req.headers.get("Authorization") ?? "";
  const authHeaderName = serverConfig.isAzure ? "api-key" : "Authorization";

  let path = `${req.nextUrl.pathname}${req.nextUrl.search}`.replaceAll(
    "/api/openai/",
    "",
  );

  let baseUrl =
    serverConfig.azureUrl || serverConfig.baseUrl || OPENAI_BASE_URL;

  if (!baseUrl.startsWith("http")) {
    baseUrl = `https://${baseUrl}`;
  }

  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
  }

  const fetchUrl = `${baseUrl}/${path}`;
  // const fetchUrl = 'https://api.openai.com/v1/audio/transcriptions';
 

  // formData.append('model', 'whisper-1');
  const res = (await nodefetch(fetchUrl,{
    headers: {
      // ...formData.getHeaders(),
      // "Content-Type": "multipart/form-data",
      // "Content-Type":req.headers.get('Content-Type'),
      [authHeaderName]: authValue,
      ...(serverConfig.openaiOrgId && {
        "OpenAI-Organization": serverConfig.openaiOrgId,
      }),
    },
    body:formData,
    method: req.method,
    // agent: agent,
 
  }))  as any


  // const { text, error } = await res.json();
  // console.log(text, error);
  

  
  
  const newHeaders = new Headers(res.headers);
  newHeaders.delete("www-authenticate");
  // // to disable nginx buffering
  newHeaders.set("X-Accel-Buffering", "no");

  return new Response(res?.body, {
    status: res.status,
    statusText: res.statusText,
    headers: newHeaders,
  });

}