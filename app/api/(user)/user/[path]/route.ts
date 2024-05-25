import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, comparePassword } from "@/lib/utils";
import { getSession } from "@/lib/auth";

async function handle(
  req: NextRequest,
  { params }: { params: { path: string } },
) {
  // 判断网址和请求方法
  const method = req.method;
  // const url = req.url;
  const { pathname, searchParams } = new URL(req.url);
  const searchText = searchParams.get("search");

  // 校验仅当前用户支持访问
  const session = await getSession();
  if (params.path !== session?.user?.id) {
    // return NextResponse.json({ error: "无权限" }, { status: 402 });
  }

  const new_password_d = await req.json();
  // 旧密码校验
  // @ts-expect-error
  if (session?.user?.hasPassword) {
    const user = await prisma.user.findUnique({
      where: {
        id: params.path,
      },
    });
    if (
      !(
        new_password_d["user[old_password]"] &&
        comparePassword(
          new_password_d["user[old_password]"],
          user?.password ?? "",
        )
      )
    ) {
      return NextResponse.json({ error: "密码校验失败" }, { status: 401 });
    }
  }

  // 校验新密码规则
  if (
    new_password_d["user[password]"].length < 6 ||
    new_password_d["user[password]"] !==
      new_password_d["user[password_confirmation]"]
  ) {
    return NextResponse.json({ error: "密码校验失败" }, { status: 401 });
  }

  await prisma.user.update({
    where: {
      id: params.path,
    },
    data: {
      password: hashPassword(new_password_d["user[password]"]),
    },
  });
  return NextResponse.json({ result: "ok" });

  // return NextResponse.json({ error: "未知错误" }, { status: 500 });
  // return NextResponse.json({ error: "当前方法不支持" }, { status: 405 });
}

// export const GET = handle;
// export const POST = handle;
export const PUT = handle;
// export const DELETE = handle;
