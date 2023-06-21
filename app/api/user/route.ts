import { NextResponse } from "next/server";
export function handle(req: any, res: any) {
  return NextResponse.json({ name: "John Doe11" });
}
export const GET = handle;
export const POST = handle;

export const runtime = "edge";
