import { NextRequest, NextResponse } from "next/server";

import { getServerSideConfig } from "../../config/server";
import { DEFAULT_MODELS, OPENAI_BASE_URL } from "../../constant";

const serverConfig = getServerSideConfig();


import fetch from 'node-fetch';
const fs = require('fs');
const tunnel = require('tunnel');
import path from 'path';

const agent = tunnel.httpsOverHttp({
  proxy: {
    host: '127.0.0.1',
    port: process.env.PROXY_PORT,
  },
});

async function handle(req:NextRequest) {

  
  const authValue = req.headers.get("Authorization") ?? "";
  const authHeaderName = serverConfig.isAzure ? "api-key" : "Authorization";

  // let path = `${req.nextUrl.pathname}${req.nextUrl.search}`.replaceAll(
  //   "/api/openai/",
  //   "",
  // );

  let baseUrl =
    serverConfig.azureUrl || serverConfig.baseUrl || OPENAI_BASE_URL;

  if (!baseUrl.startsWith("http")) {
    baseUrl = `https://${baseUrl}`;
  }

  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
  }

  // const fetchUrl = `${baseUrl}/${path}`;
  const fetchUrl = 'https://api.openai.com/v1/audio/speech';
 
  const requestData = {
    model: 'tts-1',
    input: `这是一句测试语数的我想看`,
    voice: 'onyx'
  };

  
  const reqJson = await req.json()

  console.log(reqJson);
  if(!reqJson.text){
    return  NextResponse.json( 
    {
      msg:'没有文字'
    },
    {
      status: 401,
    },
    )
  }
  requestData.input = reqJson.text

  const res = (await fetch(fetchUrl,{
    headers: {
      'Content-Type': 'application/json',
      [authHeaderName]: 'Bearer ' +serverConfig.apiKey,
      ...(serverConfig.openaiOrgId && {
        "OpenAI-Organization": serverConfig.openaiOrgId,
      }),
    },
    body: JSON.stringify(requestData),
    method: req.method,
    agent: agent,
 
  })) as any

  // console.log(res);
  
  // const uploadDir = path.join('public','uploads');
  //   // 确保上传目录存在
  // if (!fs.existsSync(uploadDir)) {
  //   fs.mkdirSync(uploadDir, { recursive: true });
  // }

  // const buffer = Buffer.from(await res.arrayBuffer());
  // const arrayBuffer =(await res.arrayBuffer());

  // const timestamp = Date.now();
  // const newFileName = `audio_${timestamp}.mp3`;
  // const newFilePath = path.join(uploadDir, newFileName);
  // fs.writeFileSync(newFilePath, buffer);

  // // console.log(newFilePath.replace(__dirname, '').replace(/\\/g, '/'));
  
  // const publicPath = newFilePath.replace(__dirname, '').replace(/\\/g, '/').replace('/public','').replace('public/','/')
  // console.log(publicPath);
  
  const newHeaders = new Headers(res.headers);

  return new Response(res?.body, {
    status: res.status,
    statusText: res.statusText,
    headers: newHeaders,
  });
}

export const GET = handle;
export const POST = handle;

export const runtime = "nodejs";
