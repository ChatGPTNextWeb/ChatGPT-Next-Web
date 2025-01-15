import { Analytics } from "@vercel/analytics/react";
import { Home } from "./components/home";
import { getServerSideConfig } from "./config/server";
import { initializeMcpSystem } from "./mcp/actions";

const serverConfig = getServerSideConfig();

export default async function App() {
  // 初始化 MCP 系统
  await initializeMcpSystem();

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
