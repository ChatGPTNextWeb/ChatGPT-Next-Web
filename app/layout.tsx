import "./globals.scss";
import "./markdown.scss";

export const metadata = {
  title: "ChatGPT Next Web",
  description: "Your personal ChatGPT Chat Bot.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hans-CN">
      <meta
        name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
      />
      <body>{children}</body>
    </html>
  );
}
