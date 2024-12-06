import { NextRequest, NextResponse } from "next/server";

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

// 路径拼接函数
function joinPaths(...parts: string[]): string {
  return parts
    .map(part => part.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/');
}

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
    const method = req.method;

    console.log(`[Proxy Request] ${method} ${req.url}`);
    console.log("Request Headers:", Object.fromEntries(req.headers));

    if (method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    if (!ALLOWED_METHODS.includes(method)) {
      return NextResponse.json(
        { error: "Method Not Allowed" },
        { status: 405, headers: CORS_HEADERS }
      );
    }

    // 构建目标 URL（使用自定义的 joinPaths 函数替代 path.join）
    const targetUrlObj = new URL(ENDPOINT);
    const pathSegments = params.path || [];
    targetUrlObj.pathname = joinPaths(targetUrlObj.pathname, ...pathSegments);
    const targetUrl = targetUrlObj.toString();

    // 其余代码保持不变...
    const headers = new Headers();
    req.headers.forEach((value, key) => {
      if (ALLOWED_HEADERS.includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    });

    const depth = req.headers.get('depth');
    if (depth) {
      headers.set('depth', depth);
    }

    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      headers.set('authorization', authHeader);
    }

    let requestBody: BodyInit | null = null;
    if (["POST", "PUT"].includes(method)) {
      try {
        const contentLength = req.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
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

    const responseHeaders = new Headers(response.headers);
    ["set-cookie", "server"].forEach((header) => {
      responseHeaders.delete(header);
    });

    Object.entries({
      ...CORS_HEADERS,
      "Content-Security-Policy": "upgrade-insecure-requests",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains"
    }).forEach(([key, value]) => {
      responseHeaders.set(key, value);
    });

    console.log(`[Proxy Response] ${response.status} ${response.statusText}`);
    console.log("Response Headers:", Object.fromEntries(responseHeaders));

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[Global Error]", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const OPTIONS = handler;
export const PROPFIND = handler;
export const MKCOL = handler;
