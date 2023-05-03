import { NextRequest, NextResponse } from "next/server";
import { redisGet, verifyToken } from "@/app/util/redis_util";

export async function GET(req: NextRequest) {
  const api_key = req.headers.get("access-code");
  const result = await verifyToken(api_key);
  const user_string = await redisGet(api_key);
  const user = JSON.parse(user_string as string);
  if (result == false) {
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
  return NextResponse.json({
    user: user,
  });
}
