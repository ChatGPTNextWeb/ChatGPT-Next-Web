/* eslint-disable @next/next/no-page-custom-font */
import { type Metadata } from "next";
import { getServerSession } from "next-auth";
import SessionProvider from "./components/session-provider";
import { getClientConfig } from "./config/client";
import "./styles/globals.scss";
import "./styles/highlight.scss";
import "./styles/markdown.scss";

export const metadata: Metadata = {
  title: "AdExGPT Web",
  description: "Our AdExGPT assistant - powered by Gen AI.",
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
    title: "AdExGPT Mobile",
    statusBarStyle: "default",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <html lang="en">
      <head>
        <meta name="config" content={JSON.stringify(getClientConfig())} />
        <link rel="manifest" href="/site.webmanifest"></link>
        <script src="/serviceWorkerRegister.js" defer></script>
        <script src="/redirect.js" defer></script>
      </head>
      <body>
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
