export function prettyObject(msg: any) {
  if (typeof msg !== "string") {
    msg = JSON.stringify(msg, null, "  ");
  }
  const prettyMsg = ["```json", msg, "```"].join("\n");
  return prettyMsg;
}
