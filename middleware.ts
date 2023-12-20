import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const searchParams = req.nextUrl.searchParams.toString();
    const path = `${url.pathname}${
        searchParams.length > 0 ? `?${searchParams}` : ""
    }`;

    const session = await getToken({ req });

    // console.log('==============,认证，', path, session)
    if (!session && path !== "/login") {
        // 给关键请求特殊待遇
        if (path.startsWith('/api/openai/')) {
             return NextResponse.json(false, {
                status: 401,
             });
        }
        return NextResponse.redirect(new URL("/login", req.url));
    } else if (session) {
        if (path.startsWith("/login") || path.startsWith('/app/login')) return NextResponse.redirect(new URL("/", req.url));
        // admin 认证
        const admin_user = ["sijinhui", "司金辉"]
        // @ts-ignore
        if ((path.startsWith("/admin") || path.startsWith("/app/admin")) && !admin_user.includes(session?.user?.name)) {
            return NextResponse.redirect(new URL("/", req.url));
        } else {
            console.log('[admin]', session?.user)
        }
    }

    if (path == '/login') {
        return NextResponse.rewrite(
            new URL(`/app${path}`, req.url),
        );
    }
    if (path == "/admin") {
        return NextResponse.rewrite(
            new URL(`/app${path}`, req.url),
        );
    }

    if (req.method == 'POST' && (path.startsWith("/api/openai/") || path.startsWith("/api/midjourney"))) {
        // 重写header，添加用户名
        // console.log(session,'========')
        const requestHeaders = new Headers(req.headers)

        // 使用 encodeURIComponent 对特殊字符进行编码
        // 将编码的 URI 组件转换成 Base64
        const encodeName = Buffer.from(encodeURIComponent(`${session?.name}`)).toString('base64');

        requestHeaders.set('x-request-name', encodeName)
        return NextResponse.next({
            request: {
                // New request headers
                headers: requestHeaders,
            },
        })
    }

    return NextResponse.next()
}


export const config = {
    matcher: [
        // "/api/:path*",
        "/((?!api/logs/|api/auth/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
    ],
};
