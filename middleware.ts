import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
// import { isName, ADMIN_LIST } from "@/lib/auth_list";
import { VerifiedUser, VerifiedAdminUser } from "@/lib/auth_client";

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
    const isUser = await VerifiedUser(session);
    const isAdminUser = await VerifiedAdminUser(session);

    // 管理员页面的api接口还是要认证的
    if (path.startsWith('/api/admin/')) {
        // 需要确认是管理员
        if (!isAdminUser) return NextResponse.json({error: '无管理员授权'}, { status: 401 });
    }
    // 不是用户且页面不是登录页
    if (!isUser && path !== "/login" ) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // 如果登录了且页面是登录页面
    if (isUser && path == "/login") {
        return NextResponse.redirect(new URL("/", req.url))
    }

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
