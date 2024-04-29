import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { addHours, subMinutes } from "date-fns";
import { EChartsOption } from "echarts";
import { getCurStartEnd } from "@/app/utils/custom";

interface StringKeyedObject {
  [key: string]: { [key: string]: number };
}
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
  return {
    modelNameList,
    userNameList,
    data_by_name,
  };
}

async function handle(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const currentTime = new Date(searchParams.get("date") ?? "");
  const { startOfTheDayInTimeZone, endOfTheDayInTimeZone } =
    getCurStartEnd(currentTime);
  const todayLog = await prisma.logEntry.findMany({
    where: {
      createdAt: {
        gte: startOfTheDayInTimeZone.toISOString(), // gte 表示 '大于等于'
        lte: endOfTheDayInTimeZone.toISOString(), // lte 表示 '小于等于'
      },
    },
    include: {
      user: true,
    },
  });
  // @ts-ignore
  const log_data = HandleLogData(todayLog);
  // console.log('log_data', log_data)

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
  };
  return NextResponse.json(usageByModelOption);
}

export const GET = handle;
// export const POST = handle;
