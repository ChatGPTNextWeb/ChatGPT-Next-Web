import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  // 判断网址和请求方法
  const method = req.method;
  // const url = req.url;
  const { pathname, searchParams } = new URL(req.url);
  const searchText = searchParams.get("search");
  // console.log(req)

  if (method === "GET") {
    // 是否有查询
    const result = searchText
      ? await prisma.user.findMany({
          orderBy: {
            createdAt: "desc",
          },
          where: {
            OR: [
              {
                name: {
                  contains: searchText,
                  mode: "insensitive", // 不区分大小写
                },
              },
              {
                username: {
                  contains: searchText,
                  mode: "insensitive", // 不区分大小写
                },
              },
              {
                email: {
                  contains: searchText,
                  mode: "insensitive", // 不区分大小写
                },
              },
            ],
          },
        })
      : await prisma.user.findMany({
          orderBy: {
            createdAt: "desc",
          },
        });
    const count = result.length;
    return NextResponse.json({ count: count, results: result });
  }

  return NextResponse.json({ error: "当前方法不支持" }, { status: 400 });
}

export const GET = handle;
export const POST = handle;
