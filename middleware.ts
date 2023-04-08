import { NextRequest, NextResponse } from "next/server";
import { ACCESS_CODES } from "./app/api/access";

export const config = {
  matcher: ["/api/openai", "/api/chat-stream"],
};

export function middleware(req: NextRequest) {
  const accessCode = req.headers.get("access-code");
  const token = req.headers.get("token");

  console.log("[Auth] allowed hashed codes: ", [...ACCESS_CODES]);
  console.log("[Auth] got access code:", accessCode);

  if (ACCESS_CODES.size > 0 && (!accessCode || !ACCESS_CODES.has(accessCode)) && !token) {
    return NextResponse.json(
      {
        error: true,
        needAccessCode: true,
        msg: "Please go settings page and fill your access code.",
      },
      {
        status: 401,
      },
    );
  }

  // inject api key
  if (!token) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      console.log("[Auth] set system token");
      req.headers.set("token", apiKey);
    } else {
      return NextResponse.json(
        {
          error: true,
          msg: "Empty Api Key",
        },
        {
          status: 401,
        },
      );
    }
  } else {
    console.log("[Auth] set user token");
  }

  return NextResponse.next({
    request: {
      headers: req.headers,
    },
  });
}
