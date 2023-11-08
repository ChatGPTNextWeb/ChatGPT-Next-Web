export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - login (login route)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - prompts.json (prompts file)
     * - redirect.json (redirect file)
     * - serviceWorker.js (service worker file)
     * - serviceWorkerRegister.js (service worker register file)
     * - site.webmanifest (manifest file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|prompts.json|redirect.json|serviceWorker.js|serviceWorkerRegister.js|site.webmanifest).*)",
  ],
};
