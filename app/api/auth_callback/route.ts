import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Function to handle GET requests (assuming you only need GET for this route)
export async function GET(req: NextRequest, res: NextResponse) {
  // Extract the token from the query string
  const searchParams = req.nextUrl.searchParams;
  const token = searchParams.get("token");
  console.log(token);
  // Validate the token (optional, add your validation logic here)
  if (!token) {
    return NextResponse.json({ error: "Missing token in query string" });
  }

  // Set the cookie with appropriate options
  cookies().set("auth_token", token, {
    path: "/", // Accessible from all paths on your domain
    httpOnly: false, // Not accessible from JavaScript for enhanced security
    secure: process.env.NODE_ENV === "production", // Set to true for HTTPS in production
    maxAge: 60 * 60 * 24, // Expires in 24 hours (adjust as needed)
  });

  // Redirect to the home page
  return NextResponse.redirect("http://localhost:3000/");
  //https://chat.i.inc/ //prod
  //http://localhost:3000/ //dev
}
