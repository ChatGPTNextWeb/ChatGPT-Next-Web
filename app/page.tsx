import { Analytics } from "@vercel/analytics/react";

import { Home } from "./components/home";
import { getServerSideConfig } from "./config/server";
import { RUNTIME_CONFIG_DOM } from "./constant";

const serverConfig = getServerSideConfig();

// Danger! Don not write any secret value here!
// 警告！不要在这里写入任何敏感信息！
const DANGER_CONFIG = {
  needCode: serverConfig?.needCode,
};

declare global {
  type DangerConfig = typeof DANGER_CONFIG;
}

export default function App() {
  return (
    <>
      <div style={{ display: "none" }} id={RUNTIME_CONFIG_DOM}>
        {JSON.stringify(DANGER_CONFIG)}
      </div>
      <Home />
      {serverConfig?.isVercel && <Analytics />}
    </>
  );
}
