import { NextRequest, NextResponse } from "next/server";

async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }

  const [protocol, ...subpath] = params.path;
  const targetUrl = `${protocol}://${subpath.join("/")}`;

  const method = req.headers.get("method") ?? undefined;
  const shouldNotHaveBody = ["get", "head"].includes(
    method?.toLowerCase() ?? "",
  );

  const fetchOptions: RequestInit = {
    headers: {
      authorization: req.headers.get("authorization") ?? "",
    },
    body: shouldNotHaveBody ? null : req.body,
    method,
    // @ts-ignore
    duplex: "half",
  };

  console.log("[Any Proxy]", targetUrl);

  const fetchResult = fetch(targetUrl, fetchOptions);

  return fetchResult;
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;

// nextjs dose not support those https methods, sucks
export const PROFIND = handle;
export const MKCOL = handle;

export const runtime = "edge";
