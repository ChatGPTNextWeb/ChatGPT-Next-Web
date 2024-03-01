import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { insertUser } from "@/lib/auth";
// import { getTokenLength } from "@/app/utils/token";
// import { Tiktoken } from "tiktoken/lite"
// import cl100k_base from "tiktoken/encoders/cl100k_base.json"
// import "tiktoken";
// import { get_encoding } from "tiktoken";
import { addHours, subMinutes } from "date-fns";
import { getTokenLength } from "@/lib/utils";

// function getTokenLength(input: string): number {
//   const encoding = get_encoding("cl100k_base");
//   // console.log('tokens: ', input, encoding.countTokens())
//   return encoding.encode(input).length;
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

    return NextResponse.json({ status: 0 });
  }

  return NextResponse.json({ status: 1 });
}
export const GET = handle;
export const POST = handle;

// export const runtime = "edge";
