"use client";
import React, { useEffect, useState } from "react";
import * as echarts from "echarts"; // 导入 echarts

export default function UsageByModelChart({
  option,
}: {
  option: echarts.EChartsOption;
}) {
  // const EchartsComponent: React.FC = ({ data: any }) => {
  //   const [option, setOption] = useState({});
  console.log("======", option);

  useEffect(() => {
    var chartDom = document.getElementById("usage-by-model-chart");
    // if (chartDom) echarts.dispose(chartDom);
    var myChart = echarts.init(chartDom);
    // console.log('=======[option]', option)
    option && myChart.setOption(option);
  }, []); // 空数组作为第二个参数，表示仅在组件挂载和卸载时执行

  return (
    <div
      id="usage-by-model-chart"
      style={{ width: "100%", height: "400px" }}
    ></div>
  );
}

// export default EchartsComponent;
