import { Analytics } from "@vercel/analytics/react";
import { Home } from "./components/home";
import { getServerSideConfig } from "./config/server";
import { initializeMcpClients } from "./mcp/actions";

const serverConfig = getServerSideConfig();

export default async function App() {
  await initializeMcpClients();

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
