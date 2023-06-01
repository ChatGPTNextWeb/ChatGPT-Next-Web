import { prettyObject } from "@/app/utils/format";
import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "../../chargebee";
import { getAuth } from "@clerk/nextjs/server";

const handle = async (req: NextRequest) => {
  const data = getAuth(req);

  if (!data.userId) {
    return NextResponse.json(
      { msg: "No Auth headers provided" },
      {
        status: 401,
      },
    );
  }

  console.log(req);
  const url = new URL(req.url);
  const id = new URLSearchParams(url.search).get("id");

  if (!id) {
    return NextResponse.redirect("/plans", {
      status: 302,
    });
  }

  const { user: { firstName, lastName, emailAddresses = [] } = {}, userId } =
    data;

  const email =
    emailAddresses.filter((e) => e.verification?.status === "verified")[0]
      ?.emailAddress || "";
  try {
    const session = await createCheckoutSession({
      id: userId,
      email,
      firstName: firstName || "",
      lastName: lastName || "",
      planId: id,
    });

    return NextResponse.json(
      {
        ...session,
      },
      {
        status: 200,
      },
    );
  } catch (e) {
    console.error("[Plans] ", e);
    return NextResponse.json(prettyObject(e));
  }
};

export const GET = handle;

export const runtime = "nodejs";
