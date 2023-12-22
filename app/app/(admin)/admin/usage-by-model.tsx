import * as echarts from "echarts";
import { EChartsOption } from "echarts";
import dynamic from "next/dynamic";

const UsageByModelChart = dynamic(() => import("./usage-by-model-chart"), {
  ssr: false,
});

export default function UsageByModel() {
  const usageByModelOption: EChartsOption = {
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
  return (
    <>
      <UsageByModelChart option={usageByModelOption} />
    </>
  );
}
