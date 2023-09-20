import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../auth";
import S3FileStorage from "../../../utils/r2_file_storage";

async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }

  // const authResult = auth(req);
  // if (authResult.error) {
  //   return NextResponse.json(authResult, {
  //     status: 401,
  //   });
  // }

  try {
    var file = await S3FileStorage.get(params.path[0]);
    return new Response(file?.transformToWebStream(), {
      headers: {
        "Content-Type": "image/png",
      },
    });
  } catch (e) {
    return new Response("not found", {
      status: 404,
    });
  }
}

export const GET = handle;

export const runtime = "edge";
