import { NextRequest, NextResponse } from "next/server";
import fs from "fs";

export async function POST(req: NextRequest) {
  console.log(req.nextUrl.pathname);
  if (
    req.method === "POST" &&
    req.nextUrl.pathname.startsWith("/api/documents/upload")
  ) {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    const filePath = `./uploads/${file.name}`;

    // Create uploads folder if needed
    if (!fs.existsSync("./uploads")) {
      fs.mkdirSync("./uploads");
    }

    // Save file
    const uint8Array = await file.arrayBuffer();
    const buffer = Buffer.from(uint8Array);

    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({
      status: "ok",
      file: file.name,
      size: buffer.length,
    });
  }
}
