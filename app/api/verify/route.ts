import { NextRequest, NextResponse } from "next/server";
import { initUser, verifyToken } from "@/app/util/redis_util";

export async function GET(req: NextRequest) {
  const api_key = req.headers.get("access-code");
  const result = await verifyToken(api_key);
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
    verify: result,
  });
}
