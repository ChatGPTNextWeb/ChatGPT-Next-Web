import { NextRequest, NextResponse } from "next/server";
// import { VerifiedUser } from "@/lib/auth";
import { getServerSideConfig } from "@/app/config/server";
const serverConfig = getServerSideConfig();
// Gets an access token.
async function getAccessToken() {
  let uri = "https://eastasia.api.cognitive.microsoft.com/sts/v1.0/issueToken";
  let options: RequestInit = {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": serverConfig.azureVoiceKey,
    },
    cache: "no-cache",
  };
  return await fetch(uri, options);
}

async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  // 认证

  // const isUser = await VerifiedUser();
  // if (!isUser) return NextResponse.json({ error: "未认证" }, { status: 401 });

  const get_access_token = await getAccessToken();

  if (!get_access_token.ok) {
    return NextResponse.json(
      { error: "获取access_token失败" },
      {
        status: get_access_token.status,
        statusText: get_access_token.statusText,
      },
    );
  }
  const access_token = await get_access_token.text();

  return NextResponse.json({ result: access_token });
}

export const GET = handle;
// export const POST = handle;
