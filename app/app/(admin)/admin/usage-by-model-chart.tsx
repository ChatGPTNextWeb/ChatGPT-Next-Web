"use client";
import { useEffect, useState, Dispatch, SetStateAction } from "react";

import * as echarts from "echarts";
import { DatePicker, DatePickerValue } from "@tremor/react";
import { zhCN } from "date-fns/locale";
import { EChartsOption } from "echarts";
import { essos, walden } from "@/lib/charts_theme";

interface ComponentProps {
  currentDate: Date;
  setCurrentDate: Dispatch<SetStateAction<Date>>;
}

function DateSelectComponent({ currentDate, setCurrentDate }: ComponentProps) {
  return (
    <DatePicker
      className="max-w-sm mx-auto justify-center"
      value={currentDate}
      locale={zhCN}
      defaultValue={new Date()}
      onValueChange={(d) => d && setCurrentDate(d)}
      maxDate={new Date()}
    />
  );
}

function EchartsComponent({ currentDate, setCurrentDate }: ComponentProps) {
  const [searchDate, setSearchDate] = useState("");

  useEffect(() => {
    let ignore = false;
    // console.log('windows', window.location.href)
    console.log("init", currentDate, searchDate);
    const currentDateString = currentDate.toLocaleDateString();
    if (searchDate != currentDateString) {
      async function fetchData() {
        // console.log("异步", searchDate, currentDateString);
        const response = await fetch("/api/charts?date=" + currentDateString, {
          method: "GET",
        });
        // console.log('====', searchDate, currentDateString),
        const option: EChartsOption = await response.json();
        option["tooltip"] = {
          ...option["tooltip"],
          formatter: function (params) {
            if (!Array.isArray(params)) {
              return "";
            }
            //@ts-ignore
            let tooltipHtml = params[0].axisValue + "<br>";
            let sum: number = 0;
            for (let i = 0; i < params.length; i++) {
              if (params[i].value) {
                tooltipHtml +=
                  (params[i].marker ?? "") +
                  (params[i].seriesName ?? "") +
                  ": " +
                  params[i].value +
                  "<br>";
                //@ts-ignore
                sum += params[i].value;
              }
            }
            tooltipHtml += "总和: " + sum;
            return tooltipHtml;
          },
        };
        return option;
      }
      fetchData().then((option) => {
        if (!ignore && option && typeof window !== "undefined") {
          let chartDom = document.getElementById("usage-by-model-chart");
          echarts.registerTheme("default", essos);
          let myChart = echarts.init(chartDom, "default");
          option && myChart.setOption(option);
          setSearchDate(currentDateString);
          console.log("option计数", 1);
        }
      });
      console.log("搜索开始计数", 1, searchDate, currentDateString);
    }
    return () => {
      ignore = true;
    };
  }, [currentDate, searchDate]); // 空数组作为第二个参数，表示仅在组件挂载和卸载时执行

  return (
    <div
      id="usage-by-model-chart"
      style={{ width: "100%", height: "400px" }}
    ></div>
  );
}

export default function UsageByModelChart() {
  const [currentDate, setCurrentDate] = useState(new Date());

  return (
    <div>
      <DateSelectComponent
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
      />
      <EchartsComponent
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
      />
    </div>
  );
}
