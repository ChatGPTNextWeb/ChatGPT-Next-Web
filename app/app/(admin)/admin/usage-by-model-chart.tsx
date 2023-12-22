"use client";
import React, { useEffect, useState } from "react";
import * as echarts from "echarts"; // 导入 echarts

export default function UsageByModelChart({
  option,
}: {
  option: echarts.EChartsOption;
}) {
  useEffect(() => {
    var chartDom = document.getElementById("usage-by-model-chart");
    var myChart = echarts.init(chartDom);
    option && myChart.setOption(option);
  }, [option]); // 空数组作为第二个参数，表示仅在组件挂载和卸载时执行

  return (
    <div
      id="usage-by-model-chart"
      style={{ width: "100%", height: "400px" }}
    ></div>
  );
}
