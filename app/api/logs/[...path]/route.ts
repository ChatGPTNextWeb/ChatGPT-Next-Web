import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { insertUser } from "@/lib/auth";
// import { getTokenLength } from "@/app/utils/token";
// import { Tiktoken } from "tiktoken/lite"
// import cl100k_base from "tiktoken/encoders/cl100k_base.json"
import "tiktoken";
import { get_encoding } from "tiktoken";

function getTokenLength(input: string): number {
  // const { Tiktoken } = require("tiktoken/lite");
  // const cl100k_base = require("tiktoken/encoders/cl100k_base.json");
  // const encoding = new Tiktoken(
  //     cl100k_base.bpe_ranks,
  //     cl100k_base.special_tokens,
  //     cl100k_base.pat_str,
  // );
  const encoding = get_encoding("cl100k_base");

  const tokenLength = encoding.encode(input).length;
  // console.log('[TOKEN],=========', input, tokenLength)

  return tokenLength;
}

async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  try {
    const request_data = await req.json();
    if (request_data?.userName) {
      await insertUser({ name: request_data?.userName });
    }
    // console.log("===========4", request_data);
    try {
      if (request_data?.logEntry) {
        const regex = /\[(.*)]/g;
        const matchResponse = request_data.logEntry.match(regex);
        if (matchResponse.length > 0) {
          request_data.logToken = getTokenLength(matchResponse[0]);
        }
      }
    } catch (e) {
      console.log("[LOG]", "logToken", e);
      request_data.logToken = 0;
    }

    await prisma.logEntry.create({
      data: request_data,
    });
  } catch (e) {
    console.log("[LOG]", e);

    return NextResponse.json({ status: 0 });
  }

  return NextResponse.json({ status: 1 });
}
export const GET = handle;
export const POST = handle;

// export const runtime = "edge";
