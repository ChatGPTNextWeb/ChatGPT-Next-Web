import Locale from './locales'

export function trimTopic(topic: string) {
  const s = topic.split("");
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
    alert(Locale.Copy.Success)
  }).catch(err => {
    alert(Locale.Copy.Failed)
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

export function isIOS() {
  const userAgent = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}