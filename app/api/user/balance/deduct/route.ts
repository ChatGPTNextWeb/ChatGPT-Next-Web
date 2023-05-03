import { NextRequest, NextResponse } from "next/server";
import { deductTokenBalance, redisGet } from "@/app/util/redis_util";

export async function GET(req: NextRequest) {
  const api_key = req.headers.get("access-code");
  if (api_key == null) {
    return NextResponse.json(
      {
        error: true,
        needAccessCode: true,
        msg: "Please go settings page and fill your access code.",
      },
      {
        status: 401,
      },
    );
  }
  const user = await deductTokenBalance(api_key);
  console.log("[Danny Debug] deduct user", user);
  return NextResponse.json({
    user: user,
  });
}
