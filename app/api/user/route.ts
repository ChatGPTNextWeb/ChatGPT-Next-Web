import { NextRequest, NextResponse } from "next/server";
import { initUser } from "@/app/util/redis_util";
import { User } from "@/app/api/user/user";
const crypto = require("crypto");

// api url: /api/user?password=xxx&days=7&balance=300
export async function GET(req: NextRequest) {
  const password = req.nextUrl.searchParams.get("password");
  if (password != process.env.ADMIN_PASSWORD) {
    return NextResponse.json({
      error: "Authentication failed",
    });
  }

  const days = Number(req.nextUrl.searchParams.get("days")) || 1;
  const balance = Number(req.nextUrl.searchParams.get("balance")) || 100;
  const api_key = getHashKey();
  const user: User = {
    api_key: api_key,
    balance: balance,
    seconds: days * 24 * 60 * 60,
    createdAt: Date.now(),
  };
  const result = await initUser(api_key, JSON.stringify(user), user.seconds);
  return NextResponse.json(result);
}

function getHashKey() {
  const key = Math.random().toString(36);
  const hash = crypto.createHash("sha256");
  hash.update(key);
  const result = hash.digest("hex").substring(0, 20);
  return result;
}
