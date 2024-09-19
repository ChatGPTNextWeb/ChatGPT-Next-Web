/* eslint-disable @next/next/no-page-custom-font */
import "./styles/globals.scss";
import "./styles/markdown.scss";
import "./styles/highlight.scss";
import { getClientConfig } from "./config/client";
import type { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getServerSideConfig } from "./config/server";
// eslint-disable-next-line unused-imports/no-unused-imports
import { GoogleTagManager } from "@next/third-parties/google";
const serverConfig = getServerSideConfig();
import { Providers } from "@/app/providers";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#151515" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "来聊天吧！",
  description: "你的个人聊天助理。",
  appleWebApp: {
    title: "来聊天吧！",
    statusBarStyle: "default",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="config" content={JSON.stringify(getClientConfig())} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link
          rel="manifest"
          href="/site.webmanifest"
          crossOrigin="use-credentials"
        ></link>
        {/*<link*/}
        {/*  rel="icon"*/}
        {/*  type="image/x-icon"*/}
        {/*  href="https://oss.xiaosi.cc/chat/public/favicon.ico"*/}
        {/*/>*/}
        {/*<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />*/}

        {/*<link*/}
        {/*  rel="manifest"*/}
        {/*  href="https://oss.xiaosi.cc/chat/public/site.webmanifest"*/}
        {/*></link>*/}
        <script src="/serviceWorkerRegister.js" defer></script>

        {/*  <script*/}
        {/*  src="https://oss.xiaosi.cc/chat/public/serviceWorkerRegister.js"*/}
        {/*  defer*/}
        {/*></script>*/}
      </head>
      <body>
        <Providers>{children}</Providers>
        {serverConfig?.isVercel && (
          <>
            <SpeedInsights />
          </>
        )}
        {/*{serverConfig?.gtmId && (*/}
        {/*  <>*/}
        {/*    <GoogleTagManager gtmId={serverConfig.gtmId} />*/}
        {/*  </>*/}
        {/*)}*/}
        {/*{serverConfig?.gaId && (*/}
        {/*  <>*/}
        {/*    <GoogleAnalytics gaId={serverConfig.gaId} />*/}
        {/*  </>*/}
        {/*)}*/}
      </body>
    </html>
  );
}
