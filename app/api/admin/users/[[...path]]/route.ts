import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { User } from "@prisma/client";
import { hashPassword } from "@/lib/utils";

async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  // 判断网址和请求方法
  const method = req.method;
  // const url = req.url;
  const { pathname, searchParams } = new URL(req.url);
  const searchText = searchParams.get("search");

  // console.log(req, '2', params.path)

  if (method === "GET") {
    // 是否有查询
    try {
      const skip = Number(searchParams.get("skip"));
      const take = Number(searchParams.get("take"));
      console.log("-----", skip, take);
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
      return NextResponse.json({
        count: count,
        results: result.map((item) => {
          return {
            id: item.id,
            name: item.name,
            username: item.username,
            gh_username: item.gh_username,
            image: item.image,
            email: item.email,
            emailVerified: item.emailVerified,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            allowToLogin: item.allowToLogin,
            isAdmin: item.isAdmin,
          };
        }),
      });
    } catch {}
    return NextResponse.json({ error: "未知错误" }, { status: 500 });
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

  if (method === "PUT") {
    try {
      const userId = params.path[0];
      let new_user_info: Partial<User> = Object.entries(
        await req.json(),
      ).reduce((acc, [key, value]) => {
        if (value !== null) {
          // @ts-ignore
          acc[key] = value;
        }
        return acc;
      }, {});
      return await changeUserInfo(userId, new_user_info);
    } catch {
      return NextResponse.json({ error: "未知错误" }, { status: 500 });
    }
  }
  return NextResponse.json({ error: "当前方法不支持" }, { status: 405 });
}

async function changeUserInfo(id: string, info: Partial<User>) {
  if (info.password) {
    info["password"] = hashPassword(info.password);
  }
  // console.log("-----------", id, info, hashDPassword);
  if (info) {
    await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        ...info,
      },
    });
    return NextResponse.json({ result: "ok" });
  }
  return NextResponse.json({ error: "未知错误" }, { status: 500 });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
