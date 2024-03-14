import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

import { ContentLoader } from "@/app/utils/loader";

export async function GET(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/api/documents/list")) {
    // Get file name from query parameter
    const file = req.nextUrl.searchParams.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "File not specified" },
        { status: 400 },
      );
    }

    const filePath = path.join("./uploads", file);
    console.log(filePath);
    if (fs.existsSync(filePath)) {
      const contents = await ContentLoader({ fileType: "pdf", file });
      return NextResponse.json({ context: contents });
    } else {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
  }
}
