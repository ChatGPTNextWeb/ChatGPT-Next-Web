//Next.js请求中间件
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { fetchAuthSession } from "aws-amplify/auth";

// 如果在该函数中使用 "await"，则可将其标记为 "async"。
export async function middleware(request: NextRequest) {
  try {
    const session = await fetchAuthSession();
    if (session) {
      //return NextResponse.redirect(new URL("/auth", request.url));
      return NextResponse.next();
    } else {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  } catch (error) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }
  // return NextResponse.redirect(new URL("/", request.url));
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/((?!auth).*)"], // Apply middleware to all paths except /auth
};
