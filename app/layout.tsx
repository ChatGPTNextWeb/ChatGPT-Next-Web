/* eslint-disable @next/next/no-page-custom-font */
import "./styles/globals.scss";
import "./styles/markdown.scss";
import "./styles/prism.scss";
import process from "child_process";
import { ACCESS_CODES, IS_IN_DOCKER } from "./api/access";

let COMMIT_ID: string | undefined;
try {
  COMMIT_ID = process
    .execSync("git describe --tags --abbrev=0")
    .toString()
    .trim();
} catch (e) {
  console.error("No git or not from git repo.");
}

export const metadata = {
  title: "ChatGPT Next Web",
  description: "Your personal ChatGPT Chat Bot.",
  appleWebApp: {
    title: "ChatGPT Next Web",
    statusBarStyle: "black-translucent",
  },
  themeColor: "#fafafa",
};

function Meta() {
  const metas = {
    version: COMMIT_ID ?? "unknown",
    access: ACCESS_CODES.size > 0 || IS_IN_DOCKER ? "enabled" : "disabled",
  };

  return (
    <>
      {Object.entries(metas).map(([k, v]) => (
        <meta name={k} content={v} key={k} />
      ))}
    </>
  );
}

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
        <Meta />
        <link rel="manifest" href="/site.webmanifest"></link>
        <link rel="preconnect" href="https://fonts.googleapis.com"></link>
        <link rel="preconnect" href="https://fonts.gstatic.com"></link>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;700;900&display=swap"
          rel="stylesheet"
        ></link>
        <script src="/serviceWorkerRegister.js" defer></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
