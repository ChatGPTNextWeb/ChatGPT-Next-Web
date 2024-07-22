import { Analytics } from "@vercel/analytics/react";

import { Home } from "@/app/components/home";

import { getServerSideConfig } from "@/app/config/server";

const serverConfig = getServerSideConfig();

export default async function App() {
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
