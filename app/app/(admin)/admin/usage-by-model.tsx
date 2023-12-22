"use client";
import React, { useEffect } from "react";
import * as echarts from "echarts"; // 导入 echarts

// const isBrowser = () => typeof window !== 'undefined'; //The approach recommended by Next.js

const EchartsComponent: React.FC = () => {
  useEffect(() => {
    // if (!isBrowser()) return;
    var chartDom = document.getElementById("usage-by-model-chart");
    // if (!chartDiv.current) return;
    // var myChart = echarts.init(chartDiv.current)
    var myChart = echarts.init(chartDom);
    var option;

    option = {
      title: {
        text: "Referer of a Website",
        subtext: "Fake Data",
        left: "center",
      },
      tooltip: {
        trigger: "item",
      },
      legend: {
        orient: "vertical",
        left: "left",
      },
      series: [
        {
          name: "Access From",
          type: "pie",
          radius: "50%",
          data: [
            { value: 1048, name: "Search Engine" },
            { value: 735, name: "Direct" },
            { value: 580, name: "Email" },
            { value: 484, name: "Union Ads" },
            { value: 300, name: "Video Ads" },
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };

    option && myChart.setOption(option);
  }, []); // 空数组作为第二个参数，表示仅在组件挂载和卸载时执行

  return (
    <div
      id="usage-by-model-chart"
      style={{ width: "100%", height: "400px" }}
    ></div>
  );
};

export default EchartsComponent;
