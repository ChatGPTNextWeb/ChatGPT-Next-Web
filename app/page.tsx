import { Analytics } from "@vercel/analytics/react";

import { Home } from "./components/home";

import { getServerSideConfig } from "./config/server";

const serverConfig = getServerSideConfig();

export default function App() {
    // 使用 useEffect 加载 Hotjar 脚本
    React.useEffect(() => {
        if (serverConfig?.isVercel) {
            (function (h, o, t, j, a, r) {
                h.hj =
                    h.hj ||
                    function () {
                        (h.hj.q = h.hj.q || []).push(arguments);
                    };
                h._hjSettings = { hjid: 3414362, hjsv: 6 };
                a = o.getElementsByTagName("head")[0];
                r = o.createElement("script");
                r.async = 1;
                r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
                a.appendChild(r);
            })(window, document, "https://static.hotjar.com/c/hotjar-", ".js?sv=");
        }
    }, []); // 空依赖数组，确保只在组件加载时运行一次

    return (
        <>
            <Home />
            {serverConfig?.isVercel && <Analytics />}
        </>
    );
}
