"use client";
import React, { useEffect, useState } from "react";
import * as echarts from "echarts";
import { DatePicker, DatePickerValue } from "@tremor/react";
import { zhCN } from "date-fns/locale";
import { param } from "ts-interface-checker"; // 导入 echarts

// {
//   option,
// }: {
//   option: echarts.EChartsOption;
// }
export default function UsageByModelChart() {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [searchDate, setSearchDate] = React.useState("");

  useEffect(() => {
    console.log("init", currentDate, searchDate);
    const currentDateString = currentDate.toLocaleDateString();
    if (searchDate != currentDateString) {
      async function fetchData() {
        console.log("异步", searchDate, currentDateString);
        const response = await fetch("/api/charts?date=" + currentDateString, {
          method: "GET",
        });
        return await response.json();
      }
      fetchData().then((option) => {
        if (option) {
          let chartDom = document.getElementById("usage-by-model-chart");
          let myChart = echarts.init(chartDom);
          option && myChart.setOption(option);
          console.log("option计数", 1);
        }
      });
      console.log("搜索开始计数", 1, searchDate, currentDateString);
    }
    return () => {
      setSearchDate(currentDateString);
    };
  }, [currentDate, searchDate]); // 空数组作为第二个参数，表示仅在组件挂载和卸载时执行

  return (
    <div>
      <DatePicker
        className="max-w-sm mx-auto justify-center"
        value={currentDate}
        locale={zhCN}
        defaultValue={new Date()}
        onValueChange={(d) => d && setCurrentDate(d)}
        maxDate={new Date()}
      />
      <div
        id="usage-by-model-chart"
        style={{ width: "100%", height: "400px" }}
      ></div>
    </div>
  );
}
