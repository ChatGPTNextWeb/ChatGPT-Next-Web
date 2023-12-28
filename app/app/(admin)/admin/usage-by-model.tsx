import * as echarts from "echarts";
import { EChartsOption } from "echarts";
import dynamic from "next/dynamic";
import prisma from "@/lib/prisma";
import { addHours } from "date-fns";

// import { getTokenLength } from "@/app/utils/token";

const UsageByModelChart = dynamic(() => import("./usage-by-model-chart"), {
  ssr: false,
});

function HandleLogData(
  todayLog: [{ userName: string; logEntry: string; logToken: number }],
) {
  const data1 = todayLog.map((log) => {
    return {
      name: log.userName ?? "unknown",
      value: log.logToken,
    };
  });

  type Accumulator = {
    [key: string]: number;
  };
  const data2 = data1.reduce<Accumulator>((acc, item) => {
    if (acc[item.name]) {
      acc[item.name] += item.value;
    } else {
      acc[item.name] = item.value;
    }
    return acc;
  }, {});
  const data3 = Object.entries(data2)
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => {
      return a.value - b.value;
    });

  const data4 = data3.reduce(
    (acc, cur) => {
      // @ts-ignore
      acc.name.push(cur.name);
      // @ts-ignore
      acc.value.push(cur.value);
      return acc;
    },
    { name: [], value: [] },
  );
  return data4;
}

export default async function UsageByModel() {
  // 今天日期的开始和结束
  var today = new Date();
  today = addHours(today, +8);
  const startOfTheDayInTimeZone = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    0,
    0,
    0,
  );
  // const endOfTheDayInTimeZone = new Date(
  //   today.getFullYear(),
  //   today.getMonth(),
  //   today.getDate(),
  //   23,
  //   59,
  //   59,
  // ); // 当天的结束时间
  const endOfTheDayInTimeZone = addHours(startOfTheDayInTimeZone, +24); // 当天的结束时间

  // const startDate = addHours(startOfTheDayInTimeZone, -8);
  // const endDate = addHours(endOfTheDayInTimeZone, -8);
  console.log("===", today, startOfTheDayInTimeZone, endOfTheDayInTimeZone);
  const todayLog = await prisma.logEntry.findMany({
    where: {
      createdAt: {
        gte: startOfTheDayInTimeZone, // gte 表示 '大于等于'
        lte: endOfTheDayInTimeZone, // lte 表示 '小于等于'
      },
    },
    include: {
      user: true,
    },
  });

  // console.log("========", todayLog[todayLog.length - 1]);
  // @ts-ignore
  const log_data = HandleLogData(todayLog);

  console.log("[log_data]====---==", todayLog);

  const usageByModelOption: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    title: {
      show: true,
      text: "token使用分析",
    },
    legend: {},
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "value",
      },
    ],
    yAxis: [
      {
        type: "category",
        data: log_data.name,
      },
    ],
    series: [
      {
        name: "总量",
        type: "bar",
        emphasis: {
          focus: "series",
        },
        label: {
          show: true,
          position: "right",
        },
        colorBy: "data",
        // progress: {
        //   show: true
        // },
        data: log_data.value,
      },
      // {
      //   name: 'Email',
      //   type: 'bar',
      //   stack: 'Ad',
      //   emphasis: {
      //     focus: 'series'
      //   },
      //   data: [120, 132, 101, 134, 90, 230, 210]
      // },
      // {
      //   name: 'Union Ads',
      //   type: 'bar',
      //   stack: 'Ad',
      //   emphasis: {
      //     focus: 'series'
      //   },
      //   data: [220, 182, 191, 234, 290, 330, 310]
      // },
      // {
      //   name: 'Video Ads',
      //   type: 'bar',
      //   stack: 'Ad',
      //   emphasis: {
      //     focus: 'series'
      //   },
      //   data: [150, 232, 201, 154, 190, 330, 410]
      // },
      // {
      //   name: 'Search Engine',
      //   type: 'bar',
      //   data: [862, 1018, 964, 1026, 1679, 1600, 1570],
      //   emphasis: {
      //     focus: 'series'
      //   },
      //   // markLine: {
      //   //   lineStyle: {
      //   //     type: 'dashed'
      //   //   },
      //   //   data: [[{ type: 'min' }, { type: 'max' }]]
      //   // }
      // },
      // {
      //   name: 'Baidu',
      //   type: 'bar',
      //   barWidth: 5,
      //   stack: 'Search Engine',
      //   emphasis: {
      //     focus: 'series'
      //   },
      //   data: [620, 732, 701, 734, 1090, 1130, 1120]
      // },
      // {
      //   name: 'Google',
      //   type: 'bar',
      //   stack: 'Search Engine',
      //   emphasis: {
      //     focus: 'series'
      //   },
      //   data: [120, 132, 101, 134, 290, 230, 220]
      // },
      // {
      //   name: 'Bing',
      //   type: 'bar',
      //   stack: 'Search Engine',
      //   emphasis: {
      //     focus: 'series'
      //   },
      //   data: [60, 72, 71, 74, 190, 130, 110]
      // },
      // {
      //   name: 'Others',
      //   type: 'bar',
      //   stack: 'Search Engine',
      //   emphasis: {
      //     focus: 'series'
      //   },
      //   data: [62, 82, 91, 84, 109, 110, 120]
      // }
    ],
  };
  return (
    <>
      <UsageByModelChart option={usageByModelOption} />
    </>
  );
}
