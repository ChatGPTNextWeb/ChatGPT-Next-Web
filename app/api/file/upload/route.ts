import { NextRequest, NextResponse } from "next/server";
import { ModelProvider } from "@/app/constant";
import { auth } from "@/app/api/auth";
import LocalFileStorage from "@/app/utils/local_file_storage";
import { getServerSideConfig } from "@/app/config/server";
import S3FileStorage from "@/app/utils/s3_file_storage";

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
    const image = formData.get("file") as File;

    const imageReader = image.stream().getReader();
    const imageData: number[] = [];

    while (true) {
      const { done, value } = await imageReader.read();
      if (done) break;
      imageData.push(...value);
    }

    const buffer = Buffer.from(imageData);

    var fileName = `${Date.now()}.png`;
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
