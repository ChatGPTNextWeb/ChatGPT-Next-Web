import { NextRequest, NextResponse } from "next/server";
import { requestOpenai } from "../common";

async function makeRequest(req: NextRequest) {
  try {
    const res = await requestOpenai(req);
    return new Response(res.body);
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
