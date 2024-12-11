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

            // 获取 <head> 元素
            a = o.getElementsByTagName("head")[0];
            if (!a) {
                console.error("Head element not found in the document.");
                return; // 如果没有找到 <head>，直接退出
            }

            // 创建 <script> 元素
            r = o.createElement("script");
            r.async = 1;
            r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;

            // 将 <script> 插入 <head>
            a.appendChild(r);
        })(window, document, "https://static.hotjar.com/c/hotjar-", ".js?sv=");
    }, []);

    return null; // 组件不需要渲染任何内容
}
