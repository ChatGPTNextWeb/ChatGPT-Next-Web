<div align="center">
<img src="./docs/images/icon.svg" alt="icon"/>

<h1 align="center">ChatGPT Next Web</h1>

English / [简体中文](./README_CN.md)

One-Click to deploy well-designed ChatGPT web UI on Vercel.

一键免费部署你的私人 ChatGPT 网页应用。

[Demo](https://chat-gpt-next-web.vercel.app/) / [Issues](https://github.com/Yidadaa/ChatGPT-Next-Web/issues) / [Join Discord](https://discord.gg/zrhvHCr79N) / [Buy Me a Coffee](https://www.buymeacoffee.com/yidadaa)

[演示](https://chat-gpt-next-web.vercel.app/) / [反馈](https://github.com/Yidadaa/ChatGPT-Next-Web/issues) / [QQ 群](https://user-images.githubusercontent.com/16968934/231789746-41f34d05-6ef9-43f3-a1d1-ff109d4c3c14.jpg) / [打赏开发者](https://user-images.githubusercontent.com/16968934/227772541-5bcd52d8-61b7-488c-a203-0330d8006e2b.jpg)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYidadaa%2FChatGPT-Next-Web&env=OPENAI_API_KEY&env=CODE&project-name=chatgpt-next-web&repository-name=ChatGPT-Next-Web)

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/Yidadaa/ChatGPT-Next-Web)

![cover](./docs/images/cover.png)

</div>

## Features

- **Deploy for free with one-click** on Vercel in under 1 minute
- Privacy first, all data stored locally in the browser
- Responsive design, dark mode and PWA
- Fast first screen loading speed (~100kb), support streaming response
- Awesome prompts powered by [awesome-chatgpt-prompts-zh](https://github.com/PlexPt/awesome-chatgpt-prompts-zh) and [awesome-chatgpt-prompts](https://github.com/f/awesome-chatgpt-prompts)
- Automatically compresses chat history to support long conversations while also saving your tokens
- One-click export all chat history with full Markdown support
- I18n supported

## Roadmap

- [x] System Prompt: pin a user defined prompt as system prompt [#138](https://github.com/Yidadaa/ChatGPT-Next-Web/issues/138)
- [ ] User Prompt: user can edit and save custom prompts to prompt list
- [ ] Desktop App with tauri
- [ ] Self-host Model: support llama, alpaca, ChatGLM, BELLE etc.
- [ ] Plugins: support network search, caculator, any other apis etc. [#165](https://github.com/Yidadaa/ChatGPT-Next-Web/issues/165)

### Not in Plan

- User login, accounts, cloud sync
- UI text customize

## 主要功能

- 在 1 分钟内使用 Vercel **免费一键部署**
- 精心设计的 UI，响应式设计，支持深色模式，支持 PWA
- 极快的首屏加载速度（~100kb），支持流式响应
- 隐私安全，所有数据保存在用户浏览器本地
- 海量的内置 prompt 列表，来自[中文](https://github.com/PlexPt/awesome-chatgpt-prompts-zh)和[英文](https://github.com/f/awesome-chatgpt-prompts)
- 自动压缩上下文聊天记录，在节省 Token 的同时支持超长对话
- 一键导出聊天记录，完整的 Markdown 支持
- 拥有自己的域名？好上加好，绑定后即可在任何地方**无障碍**快速访问

## 开发计划

- [x] 为每个对话设置系统 Prompt [#138](https://github.com/Yidadaa/ChatGPT-Next-Web/issues/138)
- [ ] 允许用户自行编辑内置 Prompt 列表
- [ ] 使用 tauri 打包桌面应用
- [ ] 支持自部署的大语言模型
- [ ] 插件机制，支持联网搜索、计算器、调用其他平台 api [#165](https://github.com/Yidadaa/ChatGPT-Next-Web/issues/165)

### 不会开发的功能

- 界面文字自定义
- 用户登录、账号管理、消息云同步

## Get Started

> [简体中文 > 如何开始使用](./README_CN.md#开始使用)

1. Get [OpenAI API Key](https://platform.openai.com/account/api-keys);
2. Click
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYidadaa%2FChatGPT-Next-Web&env=OPENAI_API_KEY&env=CODE&project-name=chatgpt-next-web&repository-name=ChatGPT-Next-Web), remember that `CODE` is your page password;
3. Enjoy :)

## FAQ

[简体中文 > 常见问题](./docs/faq-cn.md)

[English > FAQ](./docs/faq-en.md)

## Keep Updated

> [简体中文 > 如何保持代码更新](./README_CN.md#保持更新)

If you have deployed your own project with just one click following the steps above, you may encounter the issue of "Updates Available" constantly showing up. This is because Vercel will create a new project for you by default instead of forking this project, resulting in the inability to detect updates correctly.

We recommend that you follow the steps below to re-deploy:

- Delete the original repository;
- Use the fork button in the upper right corner of the page to fork this project;
- Choose and deploy in Vercel again, [please see the detailed tutorial](./docs/vercel-cn.md).

### Enable Automatic Updates

After forking the project, due to the limitations imposed by Github, you need to manually enable Workflows and Upstream Sync Action on the Actions page of the forked project. Once enabled, automatic updates will be scheduled every hour:

![Automatic Updates](./docs/images/enable-actions.jpg)

![Enable Automatic Updates](./docs/images/enable-actions-sync.jpg)

### Manually Updating Code

If you want to update instantly, you can check out the [Github documentation](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork) to learn how to synchronize a forked project with upstream code.

You can star or watch this project or follow author to get release notifictions in time.

## Access Password

> [简体中文 > 如何增加访问密码](./README_CN.md#配置页面访问密码)

This project provides limited access control. Please add an environment variable named `CODE` on the vercel environment variables page. The value should be passwords separated by comma like this:

```
code1,code2,code3
```

After adding or modifying this environment variable, please redeploy the project for the changes to take effect.

## Environment Variables

> [简体中文 > 如何配置 api key、访问密码、接口代理](./README_CN.md#环境变量)

### `OPENAI_API_KEY` (required)

Your openai api key.

### `CODE` (optional)

Access passsword, separated by comma.

### `BASE_URL` (optional)

> Default: `https://api.openai.com`

> Examples: `http://your-openai-proxy.com`

Override openai api request base url.

## Development

> [简体中文 > 如何进行二次开发](./README_CN.md#开发)

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/Yidadaa/ChatGPT-Next-Web)

Before starting development, you must create a new `.env.local` file at project root, and place your api key into it:

```
OPENAI_API_KEY=<your api key here>
```

### Local Development

```shell
# 1. install nodejs and yarn first
# 2. config local env vars in `.env.local`
# 3. run
yarn install
yarn dev
```

## Deployment

> [简体中文 > 如何部署到私人服务器](./README_CN.md#部署)

### Docker (Recommended)

```shell
docker pull yidadaa/chatgpt-next-web

docker run -d -p 3000:3000 \
   -e OPENAI_API_KEY="sk-xxxx" \
   -e CODE="your-password" \
   yidadaa/chatgpt-next-web
```

You can start service behind a proxy:

```shell
docker run -d -p 3000:3000 \
   -e OPENAI_API_KEY="sk-xxxx" \
   -e CODE="your-password" \
   -e PROXY_URL="http://localhost:7890" \
   yidadaa/chatgpt-next-web
```

### Shell

```shell
bash <(curl -s https://raw.githubusercontent.com/Yidadaa/ChatGPT-Next-Web/main/scripts/setup.sh)
```

## Screenshots

![Settings](./docs/images/settings.png)

![More](./docs/images/more.png)

## Donation

[Buy Me a Coffee](https://www.buymeacoffee.com/yidadaa)

## Special Thanks

### Sponsor

> 仅列出捐赠金额 >= 100RMB 的用户。

[@mushan0x0](https://github.com/mushan0x0)
[@ClarenceDan](https://github.com/ClarenceDan)
[@zhangjia](https://github.com/zhangjia)
[@hoochanlon](https://github.com/hoochanlon)
[@relativequantum](https://github.com/relativequantum)
[@desenmeng](https://github.com/desenmeng)
[@webees](https://github.com/webees)
[@chazzhou](https://github.com/chazzhou)
[@hauy](https://github.com/hauy)
[@Corwin006](https://github.com/Corwin006)

### Contributor

[Contributors](https://github.com/Yidadaa/ChatGPT-Next-Web/graphs/contributors)

## LICENSE

[Anti 996 License](https://github.com/kattgu7/Anti-996-License/blob/master/LICENSE_CN_EN)
