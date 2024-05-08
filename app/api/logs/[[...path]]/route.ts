import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenLength } from "@/lib/utils";
import { getSession } from "@/lib/auth";
import { getCurStartEnd } from "@/app/utils/custom";

async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  // 判断网址和请求方法
  const method = req.method;
  // const url = req.url;
  const { pathname, searchParams } = new URL(req.url);
  const searchText = searchParams.get("search");
  if (method === "GET") {
    try {
      const session = await getSession();
      const user_id = session?.user.id;
      const { startOfTheDayInTimeZone, endOfTheDayInTimeZone } =
        getCurStartEnd();
      const current_token = await prisma.logEntry
        .findMany({
          where: {
            userID: user_id,
            createdAt: {
              gte: startOfTheDayInTimeZone.toISOString(), // gte 表示 '大于等于'
              lte: endOfTheDayInTimeZone.toISOString(), // lte 表示 '小于等于'
            },
          },
          select: {
            logToken: true,
          },
        })
        .then((result) => {
          return result.reduce(
            (acc, cur) => (cur.logToken ? acc + cur.logToken : acc),
            0,
          );
        });
      // console.log('-----------', user_id, current_token)
      return NextResponse.json({ result: { current_token: current_token } });
    } catch {}
    return NextResponse.json({ error: "未知错误" }, { status: 500 });
  }

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
export const GET = handle;
export const POST = handle;

// export const runtime = "edge";
