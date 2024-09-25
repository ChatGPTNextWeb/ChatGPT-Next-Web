import { NextRequest, NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  console.log("[SF] params ", params);

  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }
  const url = new URL(req.url);
  const queryParams = new URLSearchParams(url.search);
  const code = queryParams.get("code");
  let sfak = "";
  console.log("[SF] code ", code);
  try {
    const tokenFetch = await fetch(
      `${
        process.env.NEXT_PUBLIC_SF_NEXT_CHAT_SF_ACCOUNT_ENDPOINT ||
        "https://account.siliconflow.cn"
      }/api/open/oauth`,
      {
        method: "POST",
        body: JSON.stringify({
          clientId: process.env.NEXT_PUBLIC_SF_NEXT_CHAT_CLIENT_ID,
          secret: process.env.SF_NEXT_CHAT_SECRET,
          code,
        }),
      },
    );
    if (!tokenFetch.ok)
      return Response.json(
        { status: false, message: "fetch error" },
        { status: 500 },
      );
    const tokenJson = await tokenFetch.json();
    const access_token = tokenJson.status ? tokenJson.data?.access_token : null;
    console.log("access_token", access_token);
    const apiKey = await fetch(
      `${
        process.env.NEXT_PUBLIC_SF_NEXT_CHAT_SF_CLOUD_ENDPOINT ||
        "https://cloud.siliconflow.cn"
      }/api/oauth/apikeys`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${access_token}`,
        },
      },
    );
    const apiKeysData = await apiKey.json();
    console.log("apiKeysData", apiKeysData);
    sfak = apiKeysData.data[0].secretKey;
  } catch (error) {
    console.log("error", error);
    return Response.json(
      { status: false, message: "fetch error" },
      { status: 500 },
    );
  }
  cookies().set("sfak", sfak);
  redirect(`/`);
}
