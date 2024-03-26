import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  // 判断网址和请求方法
  // const method = req.method;
  // // const url = req.url;
  // const { pathname } = new URL(req.url);
  //
  // console.log('123', method, pathname,)
  // const result = await prisma.user.findMany({
  //     orderBy: {
  //         createdAt: "desc",
  //     },
  // });
  return NextResponse.json({ error: "暂未开发" }, { status: 400 });
}

export const GET = handle;
export const POST = handle;
