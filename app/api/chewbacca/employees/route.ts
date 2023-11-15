import { EmployeeItem } from "@/app/salesGPT/types";
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.CHEWBACCA_BASE_URL;

export const GET = async (
  req: NextRequest,
  res: NextResponse,
): Promise<Response> => {
  const request = await fetch(`${BASE_URL}/employees`, {
    headers: {},
  });
  if (!request.ok) {
    return new Response(null, { status: 500 });
  }
  const result = (await request.json()).employees as EmployeeItem[];
  return new Response(JSON.stringify(result), { status: 200 });
};
