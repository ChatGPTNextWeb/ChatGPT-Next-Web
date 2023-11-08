export { default } from "next-auth/middleware";

export const config = {
  matcher: "/((?!login|static|.*\\..*|_next).*)",
};
