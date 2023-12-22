// "use client";
import { BarList, Bold, Card, Flex, Text, Title } from "@tremor/react";
import prisma from "@/lib/prisma";
import { estimateTokenLength } from "@/app/utils/token";

function HandleLogData(todayLog: [{ userName: string; logEntry: string }]) {
  const data1 = todayLog.map((log) => {
    return {
      name: log.userName ?? "unknown",
      value: estimateTokenLength(log.logEntry ?? ""),
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
      return b.value - a.value;
    });
  return data3;
}

export default async function UsageAnalysis() {
  // 今天日期的开始和结束
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  const todayLog = await prisma.logEntry.findMany({
    where: {
      createdAt: {
        gte: startDate, // gte 表示 '大于等于'
        lte: endDate, // lte 表示 '小于等于'
      },
    },
    include: {
      user: true,
    },
  });

  // @ts-ignore
  const log_data = HandleLogData(todayLog);

  // @ts-ignore
  return (
    <Card className="max-w-lg">
      <Title>Website Analytics</Title>
      <Flex className="mt-4">
        <Text>
          <Bold>Source</Bold>
        </Text>
        <Text>
          <Bold>Visits</Bold>
        </Text>
      </Flex>
      <BarList data={log_data} className="mt-2" />
    </Card>
  );
}
