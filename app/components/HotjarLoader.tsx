"use client";

import { useEffect } from "react";

export default function HotjarLoader() {
    useEffect(() => {
        (function (h, o, t, j, a, r) {
            h.hj =
                h.hj ||
                function () {
                    (h.hj.q = h.hj.q || []).push(arguments);
                };
            h._hjSettings = { hjid: 3414362, hjsv: 6 };
            // 创建 <script> 元素
            r = o.createElement("script");
            r.async = 1;
            r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;

            // 将 <script> 插入 <head>
            headElement.appendChild(r); // 使用明确的变量
        })(window, document, "https://static.hotjar.com/c/hotjar-", ".js?sv=");
    }, []);

    return null; // 组件不需要渲染任何内容
}
