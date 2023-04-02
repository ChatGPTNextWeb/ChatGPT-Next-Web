import { NextRequest, NextResponse } from "next/server";
import { requestOpenai } from "../common";

async function makeRequest(req: NextRequest) {
  try {
    const api = await requestOpenai(req);
    const res = new NextResponse(api.body);
    res.headers.set("Content-Type", "application/json");
    return res;
  } catch (e) {
    console.error("[OpenAI] ", req.body, e);
    return NextResponse.json(
      {
        error: true,
        msg: JSON.stringify(e),
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(req: NextRequest) {
  return makeRequest(req);
}

export async function GET(req: NextRequest) {
  return makeRequest(req);
}
