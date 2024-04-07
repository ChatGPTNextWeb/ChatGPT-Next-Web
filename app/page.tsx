import { Analytics } from "@vercel/analytics/react";

import { Home } from "./components/home";

import { getServerSideConfig } from "./config/server";

// import { VerifiedUser } from "@/lib/auth";
// import { redirect } from "next/navigation";

const serverConfig = getServerSideConfig();

export default async function App() {
  // const isUser = await VerifiedUser();
  // if (!isUser) {
  //   redirect("/login");
  // }

  return (
    <>
      <Home />
      {serverConfig?.isVercel && (
        <>
          <Analytics />
        </>
      )}
    </>
  );
}
