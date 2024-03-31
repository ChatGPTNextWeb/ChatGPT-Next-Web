import { getServerSideConfig } from "@/app/config/server";
import LocalFileStorage from "@/app/utils/local_file_storage";
import S3FileStorage from "@/app/utils/s3_file_storage";
import { NextRequest, NextResponse } from "next/server";
import mime from "mime";

async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }

  try {
    const serverConfig = getServerSideConfig();
    const fileName = params.path[0];
    const contentType = mime.getType(fileName);

    if (serverConfig.isStoreFileToLocal) {
      var fileBuffer = await LocalFileStorage.get(fileName);
      return new Response(fileBuffer, {
        headers: {
          "Content-Type": contentType ?? "application/octet-stream",
        },
      });
    } else {
      var file = await S3FileStorage.get(fileName);
      if (file) {
        return new Response(file?.transformToWebStream(), {
          headers: {
            "Content-Type": contentType ?? "application/octet-stream",
          },
        });
      }
      return new Response("not found", {
        status: 404,
      });
    }
  } catch (e) {
    return new Response("not found", {
      status: 404,
    });
  }
}

export const GET = handle;

export const runtime = "nodejs";
export const revalidate = 0;
