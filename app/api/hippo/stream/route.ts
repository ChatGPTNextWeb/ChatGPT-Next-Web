import { NextResponse } from "next/server";
const axios = require("axios");
const headers = {
  "Content-Type": "application/json",
  Authorization: process.env.TOKENHIPPO,
};

export async function GET(request: Request) {
  try {
    const result = await axios.get(process.env.STREAMBOT, { headers });
    const data = result.data.message;
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    console.log(e);
  }
}
