import { authMiddleware } from "@clerk/nextjs";
import { getServerSideConfig } from "./app/config/server"
import { NextFetchEvent, NextRequest } from "next/server";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware

const serverConfig = getServerSideConfig();

const middleware = serverConfig.isClerkEnabled
    ? authMiddleware({})
    : function middleware(req: NextRequest, ev: NextFetchEvent) {
        // Do nothing, allow anything to pass. 
    };


export default middleware;

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
