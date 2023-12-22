import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { insertUser } from "@/lib/auth";
import { getTokenLength } from "@/app/utils/token";

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
    if (request_data?.logEntry) {
      const regex = /\[(.*)]/g;
      const matchResponse = request_data.logEntry.match(regex);
      if (matchResponse.length > 0) {
        request_data.logToken = getTokenLength(matchResponse[0]);
      }
      // console.log('=======', request_data.logEntry, '=====', matchResponse);
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
