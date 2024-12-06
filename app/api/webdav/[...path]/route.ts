import { NextRequest, NextResponse } from "next/server";
import path from "path";

// 配置常量
const ALLOWED_METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PROPFIND", "MKCOL"];
const ALLOWED_HEADERS = [
  "authorization",
  "content-type",
  "accept",
  "depth",
  "destination",
  "overwrite",
  "content-length"
];
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": ALLOWED_METHODS.join(","),
  "Access-Control-Allow-Headers": ALLOWED_HEADERS.join(", "),
  "Access-Control-Max-Age": "86400",
};
const TIMEOUT = 30000; // 30 seconds

// WebDAV 服务器端点配置
const ENDPOINT = process.env.WEBDAV_ENDPOINT || "http://localhost:8080";

export const runtime = "edge";

// 重试机制
async function makeRequest(url: string, options: RequestInit, retries = 3) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (error.name === 'AbortError') {
        throw new Error('Request Timeout');
      }
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Max retries reached');
}

export async function handler(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // 获取请求方法
    const method = req.method;

    // 记录请求日志
    console.log(`[Proxy Request] ${method} ${req.url}`);
    console.log("Request Headers:", Object.fromEntries(req.headers));

    // 处理 OPTIONS 请求
    if (method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    // 验证请求方法
    if (!ALLOWED_METHODS.includes(method)) {
      return NextResponse.json(
        { error: "Method Not Allowed" },
        { status: 405, headers: CORS_HEADERS }
      );
    }

    // 构建目标 URL
    const targetUrlObj = new URL(ENDPOINT);
    targetUrlObj.pathname = path.join(targetUrlObj.pathname, ...(params.path || []));
    const targetUrl = targetUrlObj.toString();

    // 处理请求头
    const headers = new Headers();
    req.headers.forEach((value, key) => {
      if (ALLOWED_HEADERS.includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    });

    // 特殊处理 WebDAV 相关头
    const depth = req.headers.get('depth');
    if (depth) {
      headers.set('depth', depth);
    }

    // 处理认证头
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      headers.set('authorization', authHeader);
    }

    // 处理请求体
    let requestBody: BodyInit | null = null;
    if (["POST", "PUT"].includes(method)) {
      try {
        const contentLength = req.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
          // 大文件使用流式处理
          requestBody = req.body;
          headers.set('transfer-encoding', 'chunked');
        } else {
          requestBody = await req.blob();
        }
      } catch (error) {
        console.error("[Request Body Error]", error);
        return NextResponse.json(
          { error: "Invalid Request Body" },
          { status: 400, headers: CORS_HEADERS }
        );
      }
    }

    // 构建fetch选项
    const fetchOptions: RequestInit = {
      method,
      headers,
      body: requestBody,
      redirect: "manual",
      cache: 'no-store',
      next: {
        revalidate: 0
      }
    };

    // 发送代理请求
    let response: Response;
    try {
      console.log(`[Proxy Forward] ${method} ${targetUrl}`);
      response = await makeRequest(targetUrl, fetchOptions);
    } catch (error) {
      console.error("[Proxy Error]", error);
      const status = error.message === 'Request Timeout' ? 504 : 500;
      return NextResponse.json(
        { error: error.message || "Internal Server Error" },
        { status, headers: CORS_HEADERS }
      );
    }

    // 处理响应头
    const responseHeaders = new Headers(response.headers);
    // 移除敏感头信息
    ["set-cookie", "server"].forEach((header) => {
      responseHeaders.delete(header);
    });

    // 添加 CORS 头和安全头
    Object.entries({
      ...CORS_HEADERS,
      "Content-Security-Policy": "upgrade-insecure-requests",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains"
    }).forEach(([key, value]) => {
      responseHeaders.set(key, value);
    });

    // 记录响应日志
    console.log(`[Proxy Response] ${response.status} ${response.statusText}`);
    console.log("Response Headers:", Object.fromEntries(responseHeaders));

    // 返回响应
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    // 捕获全局异常
    console.error("[Global Error]", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

// 导出支持的 HTTP 方法
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const OPTIONS = handler;
export const PROPFIND = handler;
export const MKCOL = handler;
