import * as echarts from "echarts";
import { EChartsOption } from "echarts";
import dynamic from "next/dynamic";
import prisma from "@/lib/prisma";
import { addHours, subMinutes } from "date-fns";
import { log } from "util";
import { use } from "react";

// import { getTokenLength } from "@/app/utils/token";

const UsageByModelChart = dynamic(() => import("./usage-by-model-chart"), {
  ssr: false,
});

interface StringKeyedObject {
  [key: string]: { [key: string]: number };
}
// interface StringArray {
//   strings: string[];
// }

type StringSet = Set<string>;
type StringArray = string[];

function HandleLogData(
  todayLog: [{ userName: string; logToken: number; model: string }],
) {
  // 先遍历一遍，获取所有的模型和名字。
  let all_models: StringSet = new Set();
  let all_names: StringSet = new Set();
  // 拼接数据结构
  let data_by_name: StringKeyedObject = {};
  todayLog.map((log) => {
    all_models.add(log.model);
    all_names.add(log.userName);
    data_by_name[log.userName] = data_by_name[log.userName] ?? {};
    data_by_name[log.userName][log.model] =
      (data_by_name[log.userName][log.model] || 0) + log.logToken;
    // 这么顺利，顺便加个总数吧。
    data_by_name[log.userName]["all_token"] =
      (data_by_name[log.userName]["all_token"] || 0) + log.logToken;
  });
  //
  // 然后遍历并以all_token，排序。
  const userNameList: StringArray = Array.from(all_names).sort((a, b) => {
    return data_by_name[a]["all_token"] - data_by_name[b]["all_token"];
  });
  // 将值按模型分为两个序列
  const modelNameList = Array.from(all_models).map((model) => {
    return {
      name: model,
      data: userNameList.map((userName) => {
        return data_by_name[userName][model] ?? null;
      }),
    };
  });
  console.log("看看", modelNameList);
  return {
    modelNameList,
    userNameList,
    data_by_name,
  };
}

export default async function UsageByModel() {
  // 今天日期的开始和结束
  var today = new Date();
  // today = subMinutes(today, today.getTimezoneOffset())
  const startOfTheDayInTimeZone = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    0,
    0,
    0,
  );
  const endOfTheDayInTimeZone = addHours(startOfTheDayInTimeZone, +24); // 当天的结束时间
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
  // @ts-ignore
  const log_data = HandleLogData(todayLog);

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
        data: log_data.userNameList,
      },
    ],
    series: log_data.modelNameList.map((item) => {
      return {
        ...item,
        type: "bar",
        emphasis: {
          focus: "series",
        },
        label: {
          show: true,
          position: "right",
        },
        colorBy: "series",
        stack: "model",
      };
    }),

    // [
    // {
    //   name: "总量",
    //   type: "bar",
    //   emphasis: {
    //     focus: "series",
    //   },
    //   label: {
    //     show: true,
    //     position: "right",
    //   },
    //   colorBy: "data",
    //   // progress: {
    //   //   show: true
    //   // },
    //   data: log_data.value,
    // },
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
    // ],
  };
  return (
    <>
      <UsageByModelChart option={usageByModelOption} />
    </>
  );
}
