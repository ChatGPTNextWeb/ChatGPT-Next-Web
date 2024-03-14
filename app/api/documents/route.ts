import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function DELETE(req: NextRequest) {
  const file = req.nextUrl.searchParams.get("file");

  if (!file) {
    return NextResponse.json({ error: "File not specified" }, { status: 400 });
  }

  const filePath = path.join("./uploads", file);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  fs.unlinkSync(filePath);

  return new NextResponse(null, { status: 200 });
}

export async function GET(req: NextRequest) {
  if (
    req.method === "GET" &&
    req.nextUrl.pathname.startsWith("/api/documents")
  ) {
    const uploadsDir = "./uploads";

    // Check if uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      return NextResponse.json({ files: [] });
    }

    // Read files from uploads directory
    const files = fs.readdirSync(uploadsDir);

    // Get file details (name and size)
    const fileDetails = files.map((file) => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      return {
        file: file,
        size: stats.size,
      };
    });

    return NextResponse.json(fileDetails);
  }

  // Return 404 for other routes
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
