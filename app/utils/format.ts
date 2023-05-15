export function prettyObject(msg: any) {
  const prettyMsg = [
    "```json\n",
    JSON.stringify(msg, null, "  "),
    "\n```",
  ].join("");
  return prettyMsg;
}
