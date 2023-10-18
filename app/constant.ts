出口 常数 物主 = " sky1988102 ";
出口 常数 被卖方收回的汽车 = " ChatGPT-Next-Web ";
出口 常数 回购_URL = ` https://github.com/${物主}/${被卖方收回的汽车}`;
出口 常数 问题_URL = ` https://github.com/${物主}/${被卖方收回的汽车}/问题` 1;
出口 常数 更新_URL = `${回购_URL}#保持更新`状态;
出口 常数 发布_URL = `${回购_URL}/releases `版本;
出口 常数 获取提交URL = ` https://api.github.com/repos/${物主}/${被卖方收回的汽车}/提交？per_page=1 `页;
出口 常数 获取标签URL = ` https://api.github.com/repos/${物主}/${被卖方收回的汽车}/标签？per_page=1 `页;
出口 常数 运行时_配置_DOM = "危险-运行时-配置";

出口 常数 默认_ CORS _主机 = " https://chat.haoque.shop ";
出口 常数 默认API主机 = `${默认_ CORS _主机}/API/代理` 1;

出口 列举型别小路{
 主页 = "/",
 闲谈 = "/聊天",
 设置 = "/设置",
 新聊天 = "/新聊天",
 面具 = "/遮罩",
 作家（author的简写） = "/auth ",
}

出口 列举型别ApiPath{
 克-奥二氏分级量表 = "/api/cors ",
}

出口 列举型别SlotID{
 AppBody = "应用程序主体",
}

出口 列举型别文件名{
 面具 = " masks.json ",
 提示 = " prompts.json ",
}

出口 列举型别StoreKey{
 闲谈 = "聊天-下一个-网络商店",
 接近 = "访问控制",
 配置 = "应用程序配置",
 面具 = “面具商店”,
 提示 = "即时商店",
 更新 = "聊天-更新",
 同步 = "同步",
}

出口 常数 DEFAULT _侧栏_宽度 = 300;
出口 常数 最大侧边栏宽度 = 500;
出口 常数 最小_侧边栏_宽度 = 230;
出口 常数 窄边栏宽度 = 100;

出口 常数 访问代码前缀 = “NK——”;

出口 常数 最后输入键 = "最后一次输入";
出口 常数 未完成_输入 = (身份证明（identification）:字符串) => "未完成-输入-"+id；

出口 常数 存储密钥 = " chatgpt-next-web ";

出口 常数 请求超时毫秒 = 60000;

出口 常数 导出消息类别名称 = "出口降价";

出口 常数 OpenaiPath = {
  聊天路径: " v1/聊天/完成",
  用法路径: "仪表板/计费/使用",
  子路径: "仪表板/计费/订阅",
  ListModelPath: " v1/型号",
};

出口 常数 默认输入模板 = ` {{input}} `; //输入/时间/型号/语言
出口 常数 默认_系统_模板 = `
你是ChatGPT，OpenAI训练的大语言模型。
知识截止日期:2021-09
当前型号:{{model}}
当前时间:{{time}} `;

出口 常数 总结_模型 = " gpt-3.5涡轮增压";

出口 常数 默认_型号 = [
  {
    名字: " gpt-4 ",
    有空的: 真实的,
  },
  {
    名字: " gpt-4-0314 ",
    有空的: 真实的,
  },
  {
    名字: " gpt-4-0613 ",
    available: true,
  },
  {
    name: "gpt-4-32k",
    available: true,
  },
  {
    name: "gpt-4-32k-0314",
    available: true,
  },
  {
    name: "gpt-4-32k-0613",
    available: true,
  },
  {
    name: "gpt-3.5-turbo",
    available: true,
  },
  {
    name: "gpt-3.5-turbo-0301",
    available: true,
  },
  {
    name: "gpt-3.5-turbo-0613",
    available: true,
  },
  {
    name: "gpt-3.5-turbo-16k",
    available: true,
  },
  {
    name: "gpt-3.5-turbo-16k-0613",
    available: true,
  },
] as const;

export const CHAT_PAGE_SIZE = 15;
export const MAX_RENDER_MSG_COUNT = 45;
