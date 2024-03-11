import { NextResponse } from "next/server";
const axios = require("axios");

export async function POST(request: Request): Promise<any> {
  const json = await request.json();
  const data = {
    collection_name: "collection_video_test",
    data: json.text,
    collect_meta: "true",
  };
  const result = await axios.post(process.env.SEARCHFROMVECTORDATABASE, data);

  return NextResponse.json(result.data, { status: 200 });
}
