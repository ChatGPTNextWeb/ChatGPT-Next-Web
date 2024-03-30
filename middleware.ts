import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { isName, ADMIN_LIST } from "@/lib/auth_list";

export default async function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const searchParams = req.nextUrl.searchParams.toString();
    const path = `${url.pathname}${
        searchParams.length > 0 ? `?${searchParams}` : ""
    }`;
    // 直接将/app/下面路由重定向到顶层
    if (path.startsWith('/app')) {
        return NextResponse.redirect(new URL(path.replace('/app', ''), req.url), 301);
    }

    const session = await getToken({ req });

    // 管理员页面的api接口还是要认证的
    if (path.startsWith('/api/admin/')) {
        let is_admin_user = false;
        // 需要确认是管理员
        if (session && session?.user) {
            if (ADMIN_LIST.includes(session?.name ?? "")) {
                is_admin_user = true
            }
        }
        if (!is_admin_user) return NextResponse.json({error: '无管理员授权'}, { status: 401 });

    }
    const userName = session?.name || session?.email
    if (!isName(userName ?? "") && path !== "/login" ) {
      // 用处不大，避免漏网之鱼
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // 认证有点多此一举，页面中的认证应该已经够了
    // if (!session && path !== "/login") {
    //     // 给关键请求特殊待遇
    //     if (path.startsWith('/api/openai/')) {
    //          return NextResponse.json(false, {
    //             status: 401,
    //          });
    //     }
    //     return NextResponse.redirect(new URL("/login", req.url));
    // } else if (session) {
    //   // console.log('referer=====', DENY_LIST.includes(session?.name ?? ""))
    //   if (isName(session?.name ?? "") && path.startsWith("/login"))
    //     return NextResponse.redirect(new URL("/", req.url));
    // }

    if (path == '/login') {
        return NextResponse.rewrite(
            new URL(`/app${path}`, req.url),
        );
    }
    if (path.startsWith("/admin")) {
        return NextResponse.rewrite(
            new URL(`/app${path}`, req.url),
        );
    }

    // if (req.method == 'POST' && (path.startsWith("/api/openai/") || path.startsWith("/api/midjourney"))) {
    //     // 重写header，添加用户名
    //     // console.log(session,'========')
    //     const requestHeaders = new Headers(req.headers)
    //
    //     // 使用 encodeURIComponent 对特殊字符进行编码
    //     // 将编码的 URI 组件转换成 Base64
    //     const encodeName = Buffer.from(encodeURIComponent(`${session?.name}`)).toString('base64');
    //
    //     requestHeaders.set('x-request-name', encodeName)
    //     return NextResponse.next({
    //         request: {
    //             // New request headers
    //             headers: requestHeaders,
    //         },
    //     })
    // }

    return NextResponse.next()
}


export const config = {
    matcher: [
        // "/api/:path*",
        "/((?!api/logs/|api/auth/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
    ],
};
