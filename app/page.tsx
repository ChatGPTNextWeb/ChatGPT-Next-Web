import { Analytics } from "@vercel/analytics/react";

import { Home } from "./components/home";

import { getServerSideConfig } from "./config/server";
import { Providers } from "./providers";

const serverConfig = getServerSideConfig();

export default async function App() {
  return (
    <Providers>
      <Home />
      {serverConfig?.isVercel && <Analytics />}
    </Providers>
  );
}
