import "./styles/globals.scss";
import "./styles/markdown.scss";
import "./styles/highlight.scss";
import { getClientConfig } from "./config/client";
import AccessOverlay from './AccessOverlay.client';

export const metadata = {
  // existing metadata...
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* existing head elements */}
      </head>
      <body>
        <AccessOverlay>{children}</AccessOverlay>
      </body>
    </html>
  );
}
