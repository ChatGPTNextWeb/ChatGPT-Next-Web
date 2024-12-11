import { Analytics } from "@vercel/analytics/react";
import { Home } from "./components/home";
import { getServerSideConfig } from "./config/server";
import Hotjar from '@hotjar/browser';
const siteId = 4245983;
const hotjarVersion = 6;

Hotjar.init(siteId, hotjarVersion);

// Initializing with `debug` option:
Hotjar.init(siteId, hotjarVersion, {
    debug: true
});
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
