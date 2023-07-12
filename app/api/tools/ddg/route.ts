import { prettyObject } from "@/app/utils/format";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../auth";

import { search, SafeSearchType } from "duck-duck-scrape";

async function handle(req: NextRequest) {
  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }

  let query = req.nextUrl.searchParams.get("query") ?? "";
  let maxResults = req.nextUrl.searchParams.get(
    "max_results",
  ) as unknown as number;
  if (!maxResults) maxResults = 3;
  console.log("[Tools Route] query ", query);

  const authResult = auth(req);
  if (authResult.error) {
    return NextResponse.json(authResult, {
      status: 401,
    });
  }

  try {
    const searchResults = await search(query, {
      safeSearch: SafeSearchType.OFF,
    });
    const result = searchResults.results
      .slice(0, maxResults)
      .map(({ title, description, url }) => ({
        title,
        content: description,
        url,
      }));
    const res = new NextResponse(JSON.stringify(result));
    res.headers.set("Content-Type", "application/json");
    res.headers.set("Cache-Control", "no-cache");
    return res;
  } catch (e) {
    console.error("[Tools] ", e);
    return NextResponse.json(prettyObject(e));
  }
}

export const GET = handle;
export const POST = handle;

export const runtime = "nodejs";
