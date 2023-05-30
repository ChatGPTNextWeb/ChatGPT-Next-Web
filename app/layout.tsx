/* eslint-disable @next/next/no-page-custom-font */
import "./styles/globals.scss";
import "./styles/markdown.scss";
import "./styles/highlight.scss";
import { getBuildConfig } from "./config/build";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { cookies } from "next/headers";
import { Theme } from "./store";

const buildConfig = getBuildConfig();

export const metadata = {
  title: "Cognitiev PRO",
  description: "Your Ultimate AI Sidekick.",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#1B1D24" },
  ],
  appleWebApp: {
    title: "Cognitiev PRO",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();

  const theme = cookieStore.get("theme");

  const isLightMode = theme?.value === Theme.Light;

  return (
    <ClerkProvider
      appearance={{
        ...(!isLightMode && { baseTheme: dark }),
        variables: !isLightMode
          ? {
              colorPrimary: "rgb(29, 147, 171)",
              colorText: "white",
              colorBackground: "rgb(30, 30, 30)",
            }
          : {
              colorPrimary: "rgb(29, 147, 171)",
              colorText: "black",
            },
      }}
    >
      <html lang="en">
        <head>
          <meta name="version" content={buildConfig.commitId} />
          <link rel="manifest" href="/site.webmanifest"></link>
          <script src="/serviceWorkerRegister.js" defer></script>
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
