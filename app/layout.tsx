/* eslint-disable @next/next/no-page-custom-font */
import "./styles/globals.scss";
import "./styles/markdown.scss";
import "./styles/highlight.scss";
import { getClientConfig } from "./config/client";
import { type Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getServerSideConfig } from "./config/server";

const serverConfig = getServerSideConfig();
import { Providers } from "@/app/providers";
import { Viewport } from "next";

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
        <link
          rel="manifest"
          href="https://cos.xiaosi.cc/next/public/site.webmanifest"
        ></link>
        <script src="/serviceWorkerRegister.js" defer></script>
      </head>
      <body>
        <Providers>{children}</Providers>
        {serverConfig?.isVercel && (
          <>
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}
