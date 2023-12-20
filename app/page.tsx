import { SpeedInsights } from "@vercel/speed-insights/next";

import { Home } from "./components/home";

import { getServerSideConfig } from "./config/server";

const serverConfig = getServerSideConfig();

export default async function App() {
  return (
    <>
      <Home />
      {serverConfig?.isVercel && <SpeedInsights />}
    </>
  );
}
