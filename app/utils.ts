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

export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(res => {
    alert('复制成功')
  }).catch(err => {
    alert('复制失败，请赋予剪切板权限')
  })
}

export function downloadAs(text: string, filename: string) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}