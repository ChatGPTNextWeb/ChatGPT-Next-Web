import "./globals.css";
import "./markdown.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
