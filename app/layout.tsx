/* eslint-disable @next/next/no-page-custom-font */
import "./styles/globals.scss";
import "./styles/markdown.scss";
import "./styles/highlight.scss";
import { getBuildConfig } from "./config/build";

import { APP_TITLE, APP_SUB_TITLE } from "./constant";

const buildConfig = getBuildConfig();

export const metadata = {
  title: APP_TITLE,
  description: APP_SUB_TITLE,
  appleWebApp: {
    title: APP_TITLE,
    statusBarStyle: "default",
  },
  themeColor: "#fafafa",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
        />
        <meta
          name="theme-color"
          content="#151515"
          media="(prefers-color-scheme: dark)"
        />
        <meta name="version" content={buildConfig.commitId} />
        <link rel="manifest" href="/site.webmanifest"></link>
        <link rel="preconnect" href="https://fonts.googleapis.com"></link>
        <link rel="preconnect" href="https://fonts.gstatic.com"></link>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;700;900&display=swap"
          rel="stylesheet"
        ></link>
        <script src="/serviceWorkerRegister.js" defer></script>
        {/* Google tag (gtag.js) */}
        <script async={true} src={"https://www.googletagmanager.com/gtag/js?id=G-1FKGPYXXMT"}></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-1FKGPYXXMT');
        </script>
      </head>
      <body>{children}</body>
    </html>
  );
}
