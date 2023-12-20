import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { insertUser } from "@/lib/auth";

// function cleanObjectKeys(input: { [key: string]: string }): {
//   [key: string]: string;
// } {
//   const cleanedObj: { [key: string]: string } = {};
//   Object.keys(input).forEach((key) => {
//     cleanedObj[key] = input[key].trim();
//   });
//   console.log('========', input, cleanedObj)
//   return cleanedObj;
// }

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
    await prisma.logEntry.create({
      data: request_data,
    });
  } catch (e) {
    return NextResponse.json({ status: 0 });
    // console.log("[LOG]", e);
  }

  return NextResponse.json({ status: 1 });
}
export const GET = handle;
export const POST = handle;

// export const runtime = "edge";
