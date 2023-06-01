import { prettyObject } from "@/app/utils/format";
import { NextRequest, NextResponse } from "next/server";
import {
  getCustomer,
  getSubscriptionsForUser,
  getSubscriptionEntitlements,
  getPortalSession,
  createPortalSession,
} from "../../chargebee";
import { getAuth } from "@clerk/nextjs/server";

const handle = async (req: NextRequest) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json(
      { msg: "No Auth headers provided" },
      {
        status: 401,
      },
    );
  }

  // try {
  //   const session = await getPortalSession(userId);

  //   return NextResponse.json({
  //     ...session,
  //   }, {
  //     status: 200
  //   });
  // } catch (e) {
  try {
    const session = await createPortalSession(userId);

    return NextResponse.json(
      {
        ...session,
      },
      {
        status: 200,
      },
    );
  } catch (e: any) {
    console.error("[Plans] ", e);
    return NextResponse.json(
      {
        error: e.message,
      },
      {
        status: 500,
      },
    );
  }
};
// }

export const GET = handle;

export const runtime = "nodejs";
