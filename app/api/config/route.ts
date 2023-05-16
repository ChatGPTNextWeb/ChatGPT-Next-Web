import { NextResponse } from "next/server";

import { getServerSideConfig } from "../../config/server";

// Danger! Don not write any secret value here!
// 警告！不要在这里写入任何敏感信息！

declare global {
  type DangerConfig = {
    needCode: boolean;
    hideUserApiKey: boolean;
    enableGPT4: boolean;
  };
}

async function handle() {
  const serverConfig = getServerSideConfig();
  const DANGER_CONFIG = {
    needCode: serverConfig.needCode,
    hideUserApiKey: serverConfig.hideUserApiKey,
    enableGPT4: serverConfig.enableGPT4,
  };
  return NextResponse.json(DANGER_CONFIG);
}

export const GET = handle;
export const POST = handle;

export const runtime = "edge";
