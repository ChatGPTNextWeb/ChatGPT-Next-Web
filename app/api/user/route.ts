import { NextRequest, NextResponse } from "next/server";
import { initUser } from "@/app/util/redis_util";
import { User } from "@/app/api/user/user";

const crypto = require("crypto");

enum SubscribeType {
  trial = "trial",
  week = "week",
  month = "month",
  quarter = "quarter",
  halfYear = "halfYear",
}

interface IAddData {
  subscribe_type: SubscribeType;
  wechat: string;
  remark: string;
  password: string;
}

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
    remark: "",
    wechat: "",
    api_key: api_key,
    balance: balance,
    seconds: days * 24 * 60 * 60,
    createdAt: Date.now(),
    subscribe_type: "",
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

export async function POST(req: NextRequest) {
  const { subscribe_type, wechat, remark, password } =
    (await req.json()) as IAddData;
  if (password != process.env.ADMIN_PASSWORD) {
    return NextResponse.json({
      error: "Authentication failed",
    });
  }
  let days: number = 0;
  let balance: number = 0;
  switch (subscribe_type) {
    case SubscribeType.trial:
      days = 3;
      balance = 20;
      break;
    case SubscribeType.week:
      days = 7;
      balance = 250;
      break;
    case SubscribeType.month:
      days = 30;
      balance = 1000;
      break;
    case SubscribeType.quarter:
      days = 90;
      balance = 3000;
      break;
    case SubscribeType.halfYear:
      days = 180;
      balance = 6000;
      break;
    default:
      return NextResponse.json({
        error: "subscribe_type error",
      });
  }

  const api_key = getHashKey();
  const user: User = {
    api_key: api_key,
    balance: balance,
    seconds: days * 24 * 60 * 60,
    createdAt: Date.now(),
    subscribe_type,
    wechat,
    remark,
  };
  const result = await initUser(api_key, JSON.stringify(user), user.seconds);
  return NextResponse.json(result);
}
