export function getCurrentTime(now?: Date): string {
  if (!now) {
    const now = new Date();
  }
  const formatter = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai", // 设置为中国标准时间
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // console.log(formattedDateTime); // 输出中国标准时间格式

  return formatter.format(now);
}
