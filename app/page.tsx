import { Analytics } from "@vercel/analytics/react";
import { redirect } from "next/navigation";

import { getServerSession } from "next-auth/next";

import { Home } from "./components/home";
import { authOptions } from "./api/auth/auth-options";

export default async function App() {
  const session = await getServerSession(authOptions);
  console.log(session);
  if (!session) {
    return redirect("/api/auth/signin");
  }
  return (
    <>
      <Home />
      <Analytics />
    </>
  );
}
