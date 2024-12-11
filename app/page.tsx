import { Analytics } from "@vercel/analytics/react";
import { Home } from "./components/home";
import { getServerSideConfig } from "./config/server";
import HotjarLoader from "./components/HotjarLoader"; // 引入 HotjarLoader

const serverConfig = getServerSideConfig();

export default async function App() {
    return (
        <>
            <Home />
            {serverConfig?.isVercel && (
                <>
                    <Analytics />
                    <HotjarLoader /> {/* 加入 HotjarLoader */}
                </>
            )}
        </>
    );
}
