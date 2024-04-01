import { Analytics } from "@vercel/analytics/react";

import { Home } from "./components/home";

import { getServerSideConfig } from "./config/server";

// import { getSession } from "@/lib/auth";
// import { isName } from "@/lib/auth_list";
// import { redirect } from "next/navigation";

const serverConfig = getServerSideConfig();

export default async function App() {
  // const session = await getSession();
  // const name = session?.user?.email || session?.user?.name;
  // if (!(name && isName(name))) {
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
