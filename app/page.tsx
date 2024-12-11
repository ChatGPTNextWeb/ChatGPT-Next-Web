import { Analytics } from "@vercel/analytics/react";
import { Home } from "./components/home";
import { getServerSideConfig } from "./config/server";
const siteId = 5237727;
const hotjarVersion = 6;

const serverConfig = getServerSideConfig();
Hotjar.init(siteId, hotjarVersion);

// Initializing with `debug` option:
Hotjar.init(siteId, hotjarVersion, {
    debug: true
});
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
