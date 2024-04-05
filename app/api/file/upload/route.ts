import { NextRequest, NextResponse } from "next/server";
import { ModelProvider } from "@/app/constant";
import { auth } from "@/app/api/auth";
import LocalFileStorage from "@/app/utils/local_file_storage";
import { getServerSideConfig } from "@/app/config/server";
import S3FileStorage from "@/app/utils/s3_file_storage";
import path from "path";

async function handle(req: NextRequest) {
  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }

  const authResult = auth(req, ModelProvider.GPT);
  if (authResult.error) {
    return NextResponse.json(authResult, {
      status: 401,
    });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const originalFileName = file?.name;

    let fileData: ArrayBuffer | undefined;
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        fileData = await value.arrayBuffer();
      }
    }
    if (!fileData) throw new Error("Get file buffer error");
    const buffer = Buffer.from(fileData);
    const fileType = path.extname(originalFileName).slice(1);
    var fileName = `${Date.now()}.${fileType}`;
    var filePath = "";
    const serverConfig = getServerSideConfig();
    if (serverConfig.isStoreFileToLocal) {
      filePath = await LocalFileStorage.put(fileName, buffer);
    } else {
      filePath = await S3FileStorage.put(fileName, buffer);
    }
    return NextResponse.json(
      {
        fileName: fileName,
        filePath: filePath,
      },
      {
        status: 200,
      },
    );
  } catch (e) {
    return NextResponse.json(
      {
        error: true,
        msg: (e as Error).message,
      },
      {
        status: 500,
      },
    );
  }
}

export const POST = handle;

export const runtime = "nodejs";
