const moment = require("moment-timezone");

export function formatTimestamp(
  timestamp: number,
  format = "YYYY/MM/DD HH:mm",
): string {
  const cnTimeString = moment(timestamp).tz("Asia/Shanghai").format(format);
  return cnTimeString;
}
