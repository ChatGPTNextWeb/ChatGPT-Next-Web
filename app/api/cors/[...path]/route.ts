import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_CORS_HOST } from "@/app/constant";

async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  if (req.method === "OPTIONS") {
    // Set CORS headers for preflight requests
    return NextResponse.json(
      { body: "OK" },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": `${DEFAULT_CORS_HOST}`, // Replace * with the appropriate origin(s)
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS", // Add other allowed methods if needed
          "Access-Control-Allow-Headers": "*", // Replace * with the appropriate headers
          "Access-Control-Max-Age": "86400", // Adjust the max age value if needed
        },
      },
    );
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

export const POST = handle;

export const runtime = "edge";
