export function trimTopic(topic: string) {
  const s = topic.split("").slice(0, 20);
  let lastChar = s.at(-1); // 获取 s 的最后一个字符
  let pattern = /[，。！？、]/; // 定义匹配中文标点符号的正则表达式
  while (lastChar && pattern.test(lastChar!)) {
    s.pop();
    lastChar = s.at(-1);
  }

  return s.join("");
}
