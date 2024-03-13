import { NextRequest, NextResponse } from "next/server";

async function handle(
  req: NextRequest,
  { params }: { params: { action: string; key: string[] } },
) {
  const requestUrl = new URL(req.url);
  const endpoint = requestUrl.searchParams.get("endpoint");

  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }
  const [action, ...key] = params.key;
  // only allow to request to *.upstash.io
  if (!endpoint || !new URL(endpoint).hostname.endsWith(".upstash.io")) {
    return NextResponse.json(
      {
        error: true,
        msg: "you are not allowed to request " + params.key.join("/"),
      },
      {
        status: 403,
      },
    );
  }

  // only allow upstash get and set method
  if (action !== "get" && action !== "set") {
    return NextResponse.json(
      {
        error: true,
        msg: "you are not allowed to request " + params.action,
      },
      {
        status: 403,
      },
    );
  }

  const [protocol, ...subpath] = params.key;
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

  const fetchResult = await fetch(targetUrl, fetchOptions);

  console.log("[Any Proxy]", targetUrl, {
    status: fetchResult.status,
    statusText: fetchResult.statusText,
  });

  return fetchResult;
}

export const POST = handle;
export const GET = handle;
export const OPTIONS = handle;

export const runtime = "edge";
