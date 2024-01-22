/* eslint-disable @next/next/no-page-custom-font */
import "./styles/globals.scss";
import "./styles/markdown.scss";
import "./styles/highlight.scss";
import { getClientConfig } from "./config/client";
import { type Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getServerSideConfig } from "./config/server";
import { GoogleAnalytics } from '@next/third-parties/google'

const serverConfig = getServerSideConfig();

export const metadata: Metadata = {
  title: "NextChat",
  description: "Your personal ChatGPT Chat Bot.",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#151515" },
  ],
  appleWebApp: {
    title: "NextChat",
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
        <link rel="manifest" href="/site.webmanifest"></link>
        <script src="/serviceWorkerRegister.js" defer></script>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6765970453610684" crossOrigin="anonymous"></script>
        <GoogleAnalytics gaId="G-KQB25CC08Q" />
      </head>
      <body>
        {children}
        {serverConfig?.isVercel && (
          <>
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}
