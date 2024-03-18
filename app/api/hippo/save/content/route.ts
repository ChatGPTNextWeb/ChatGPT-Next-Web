import { NextResponse } from "next/server";
const axios = require("axios");

export async function POST(request: Request): Promise<any> {
  try {
    const json = await request.json();
    const data = {
      collection_name: json.userId,
      data: json.text,
      data_type: "text",
    };
    const result = await axios.post(
      process.env.SAVECONTENTTOVECTORDATABASE,
      data,
    );
    return NextResponse.json(result.data.message, { status: 200 });
  } catch (error) {
    console.log(error);
    return null;
  }
}
