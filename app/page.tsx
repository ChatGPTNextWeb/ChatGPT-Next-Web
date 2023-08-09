import { Analytics } from "@vercel/analytics/react";

import { Home } from "./components/home";
import { User } from "./components/user";
// import { Login } from "./components/login";

import { getServerSideConfig } from "./config/server";

const serverConfig = getServerSideConfig();

export default async function App() {
  return (
    <>
      <Home />
      {serverConfig?.isVercel && <Analytics />}
    </>
  );
}
