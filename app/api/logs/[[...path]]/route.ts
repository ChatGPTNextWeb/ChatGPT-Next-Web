import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenLength } from "@/lib/utils";

async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  try {
    const request_data = await req.json();
    try {
      if (request_data?.logEntry) {
        const regex_message = /(?<="content":")(.*?)(?="}[,\]])/g;
        const matchAllMessage = request_data.logEntry.match(regex_message);
        // console.log(matchAllMessage, "=====");
        if (matchAllMessage && matchAllMessage.length > 0) {
          request_data.logToken =
            getTokenLength(matchAllMessage.join(" ")) +
            matchAllMessage.length * 3;
        }
        delete request_data["logEntry"];
      }
      if (request_data?.model == "midjourney") {
        request_data.logToken = 1000;
      }
    } catch (e) {
      console.log("[LOG]", "logToken", e);
      request_data.logToken = 0;
    }
    // 默认时间不准，还是手动获取一下吧。
    // 转换时区太麻烦，我还是直接减去时差
    // const current_time = new Date();
    // request_data.createdAt = subMinutes(current_time, current_time.getTimezoneOffset())

    await prisma.logEntry.create({
      data: request_data,
    });
  } catch (e) {
    console.log("[LOG]", e);

    return NextResponse.json({ status: e?.toString() }, { status: 400 });
  }

  return NextResponse.json({ status: 1 });
}
// export const GET = handle;
export const POST = handle;

// export const runtime = "edge";
