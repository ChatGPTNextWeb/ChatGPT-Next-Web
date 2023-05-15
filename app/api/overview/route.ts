import { NextRequest, NextResponse } from "next/server";
import { getTTL, redisGet, redisKeys } from "@/app/util/redis_util";
import { formatTimestamp } from "@/app/util/date_util";
import { sortBy } from "lodash";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const password = req.nextUrl.searchParams.get("password");
  if (password != process.env.ADMIN_PASSWORD) {
    return NextResponse.json({
      error: "Authentication failed",
    });
  }

  const result = await redisKeys();
  const users = [];
  for (const key of result) {
    const recordStr = await redisGet(key);
    if (!recordStr) continue;
    const record = JSON.parse(recordStr);
    record.ttl = await getTTL(key);
    record.endTime = formatTimestamp(Date.now() + record.ttl * 1000);
    record.createdAt = formatTimestamp(
      record.createdAt ||
        Date.now() + record.ttl * 1000 - record.seconds * 1000,
    );
    users.push(record);
  }
  // sort users by createdAt desc
  const sort_users = sortBy(users, ["createdAt"]).reverse();
  // return csv
  return NextResponse.json(sort_users);
}
