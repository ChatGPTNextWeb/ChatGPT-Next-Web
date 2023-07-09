import { prettyObject } from "@/app/utils/format";
import { auth } from "../auth";
import { NextRequest, NextResponse } from "next/server";
import {
  getCustomer,
  getSubscriptionsForUser,
  getSubscriptionEntitlements,
} from "../chargebee";
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

  const access = {
    hasAppAccess: false,
    hasTelegramAccess: false,
    hasWhatsappAccess: false,
  };

  try {
    const subscriptions = await getSubscriptionsForUser(userId);

    const activeSubscriptions = subscriptions.filter(
      (subscription: any) => subscription.status === "active" || subscription.status === "in_trial",
    );

    if (activeSubscriptions.length === 0) {
      return NextResponse.json(access, {
        status: 200,
      });
    }

    const entitlements = await Promise.all(
      activeSubscriptions.map((sub: any) =>
        getSubscriptionEntitlements(sub.id),
      ),
    );

    const flattenedEntitlements = entitlements.flat();

    flattenedEntitlements.forEach((entitlement: any) => {
      if (entitlement.feature_id === "app" && entitlement.value === "true") {
        access.hasAppAccess = true;
      }

      if (
        entitlement.feature_id === "telegram" &&
        entitlement.value === "true"
      ) {
        access.hasTelegramAccess = true;
      }

      if (
        entitlement.feature_id === "whatsapp" &&
        entitlement.value === "true"
      ) {
        access.hasWhatsappAccess = true;
      }
    });

    return NextResponse.json(access, {
      status: 200,
    });
  } catch (e) {
    console.error("[Plans] ", e);
    return NextResponse.json(prettyObject(e));
  }
};

export const GET = handle;
export const POST = handle;

export const runtime = "nodejs";
