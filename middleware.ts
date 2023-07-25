import { createRemoteJWKSet, jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const TEAM_DOMAIN = process.env.TEAM_DOMAIN;
const CERTS_URL = `${TEAM_DOMAIN}/cdn-cgi/access/certs`;

const JWKS = createRemoteJWKSet(new URL(CERTS_URL));

const fakeKey = "sk-ffffffFFFFxxxxxjjjjjjjjjjPPPPPPPPPPPPPPPPPPPPPPP";

export async function middleware(request: NextRequest) {
  let token = request.cookies.get("CF_Authorization");

  if (process.env.NODE_ENV === "development") {
    // NextResponse.next();
    token = {
      value: process.env.DEBUG_JWT!,
      name: "",
    };
  }

  if (!token?.value) {
    return new NextResponse(JSON.stringify({ key: fakeKey }), {
      status: 403,
      headers: {
        "content-type": "application/json",
      },
    });
  }
  try {
    const result = await jwtVerify(token.value, JWKS);
    console.log(result);
  } catch (error) {
    console.error(error);

    return new NextResponse(JSON.stringify({ key: fakeKey }), {
      status: 403,
      headers: {
        "content-type": "application/json",
      },
    });
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/api/:path*",
  // matcher: "/:path*",
};
