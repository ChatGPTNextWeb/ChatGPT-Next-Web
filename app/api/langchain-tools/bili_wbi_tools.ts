import md5 from "md5";
import { getRandomUserAgent } from "./ua_tools";

const mixinKeyEncTab: number[] = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
  33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61,
  26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36,
  20, 34, 44, 52,
];

// 对 imgKey 和 subKey 进行字符顺序打乱编码
const getMixinKey = (orig: string): string =>
  mixinKeyEncTab
    .map((n) => orig[n])
    .join("")
    .slice(0, 32);

// 为请求参数进行 wbi 签名
export function encWbi(
  params: Record<string, string | number>,
  img_key: string,
  sub_key: string,
): string {
  const mixin_key: string = getMixinKey(img_key + sub_key);
  const curr_time: number = Math.round(Date.now() / 1000);
  const chr_filter: RegExp = /[!'()*]/g;

  Object.assign(params, { wts: curr_time }); // 添加 wts 字段
  // 按照 key 重排参数
  const query: string = Object.keys(params)
    .sort()
    .map((key) => {
      // 过滤 value 中的 "!'()*" 字符
      const value: string = params[key].toString().replace(chr_filter, "");
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join("&");

  const wbi_sign: string = md5(query + mixin_key); // 计算 w_rid

  return query + "&w_rid=" + wbi_sign;
}

// 获取最新的 img_key 和 sub_key
export async function getWbiKeys(): Promise<{
  img_key: string;
  sub_key: string;
}> {
  // check if process.env.BILIBILI_COOKIES is set
  if (!process.env.BILIBILI_COOKIES) {
    throw new Error(
      "Cookie not found. Please set BILIBILI_COOKIES environment variable.",
    );
  }
  const res: Response = await fetch(
    "https://api.bilibili.com/x/web-interface/nav",
    {
      headers: {
        Cookie: process.env.BILIBILI_COOKIES,
        "User-Agent": getRandomUserAgent(),
        Referer: "https://www.bilibili.com/", //对于直接浏览器调用可能不适用
      },
    },
  );
  const {
    data: {
      wbi_img: { img_url, sub_url },
    },
  } = await res.json();

  return {
    img_key: img_url.slice(
      img_url.lastIndexOf("/") + 1,
      img_url.lastIndexOf("."),
    ),
    sub_key: sub_url.slice(
      sub_url.lastIndexOf("/") + 1,
      sub_url.lastIndexOf("."),
    ),
  };
}
