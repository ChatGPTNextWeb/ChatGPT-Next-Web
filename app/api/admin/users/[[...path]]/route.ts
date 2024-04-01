import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { VerifiedAdminUser } from "@/lib/auth";

async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  // 认证，管理员权限
  const isAdmin = await VerifiedAdminUser();
  if (isAdmin) {
    return NextResponse.json({ error: "无权限" }, { status: 401 });
  }

  // 判断网址和请求方法
  const method = req.method;
  // const url = req.url;
  const { pathname, searchParams } = new URL(req.url);
  const searchText = searchParams.get("search");
  // console.log(req, '2', params.path)

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

  if (method === "DELETE") {
    if (!params.path) {
      return NextResponse.json({ error: "未输入用户ID" }, { status: 400 });
    }
    try {
      const userId = params.path[0];
      const user = await prisma.user.delete({
        where: {
          id: userId,
        },
      });
      // console.log('user', user)
    } catch (e) {
      console.log("[delete user]", e);
      return NextResponse.json({ error: "无法删除用户" }, { status: 400 });
    }
    return NextResponse.json({ result: "删除用户成功" });
  }
  return NextResponse.json({ error: "当前方法不支持" }, { status: 405 });
}

export const GET = handle;
export const POST = handle;
export const DELETE = handle;
