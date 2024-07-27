<div align="center">

<h1 align="center">NextChat (ChatGPH Next Web)</h1>

English / [简体中文](./README_CN.md)

One-Click to get a well-designed cross-platform ChatGPH web UI, with GPT3, GPT4 & Gemini Pro support.

一键免费部署你的跨平台私人 ChatGPH 应用, 支持 GPT3, GPT4 & Gemini Pro 模型。

[![Web][Web-image]][web-url]
[![Windows][Windows-image]][download-url]
[![MacOS][MacOS-image]][download-url]
[![Linux][Linux-image]][download-url]

[Web App](https://app.nextchat.dev/) / [Desktop App](https://github.com/Yidadaa/ChatGPH-Next-Web/releases) / [Discord](https://discord.gg/YCkeafCafC) / [Enterprise Edition](#enterprise-edition) / [Twitter](https://twitter.com/NextChatDev)

[网页版](https://app.nextchat.dev/) / [客户端](https://github.com/Yidadaa/ChatGPH-Next-Web/releases) / [企业版](#%E4%BC%81%E4%B8%9A%E7%89%88) / [反馈](https://github.com/Yidadaa/ChatGPH-Next-Web/issues)

[web-url]: https://app.nextchat.dev/
[download-url]: https://github.com/Yidadaa/ChatGPH-Next-Web/releases
[Web-image]: https://img.shields.io/badge/Web-PWA-orange?logo=microsoftedge
[Windows-image]: https://img.shields.io/badge/-Windows-blue?logo=windows
[MacOS-image]: https://img.shields.io/badge/-MacOS-black?logo=apple
[Linux-image]: https://img.shields.io/badge/-Linux-333?logo=ubuntu

[<img src="https://vercel.com/button" alt="Deploy on Zeabur" height="30">](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FChatGPHNextWeb%2FChatGPH-Next-Web&env=OPENAI_API_KEY&env=CODE&project-name=nextchat&repository-name=NextChat) [<img src="https://zeabur.com/button.svg" alt="Deploy on Zeabur" height="30">](https://zeabur.com/templates/ZBUEFA)  [<img src="https://gitpod.io/button/open-in-gitpod.svg" alt="Open in Gitpod" height="30">](https://gitpod.io/#https://github.com/Yidadaa/ChatGPH-Next-Web)

</div>

## Enterprise Edition

Meeting Your Company's Privatization and Customization Deployment Requirements:
- **Brand Customization**: Tailored VI/UI to seamlessly align with your corporate brand image.
- **Resource Integration**: Unified configuration and management of dozens of AI resources by company administrators, ready for use by team members.
- **Permission Control**: Clearly defined member permissions, resource permissions, and knowledge base permissions, all controlled via a corporate-grade Admin Panel.
- **Knowledge Integration**: Combining your internal knowledge base with AI capabilities, making it more relevant to your company's specific business needs compared to general AI.
- **Security Auditing**: Automatically intercept sensitive inquiries and trace all historical conversation records, ensuring AI adherence to corporate information security standards.
- **Private Deployment**: Enterprise-level private deployment supporting various mainstream private cloud solutions, ensuring data security and privacy protection.
- **Continuous Updates**: Ongoing updates and upgrades in cutting-edge capabilities like multimodal AI, ensuring consistent innovation and advancement.

For enterprise inquiries, please contact: **business@nextchat.dev**

## 企业版

满足企业用户私有化部署和个性化定制需求：
- **品牌定制**：企业量身定制 VI/UI，与企业品牌形象无缝契合
- **资源集成**：由企业管理人员统一配置和管理数十种 AI 资源，团队成员开箱即用
- **权限管理**：成员权限、资源权限、知识库权限层级分明，企业级 Admin Panel 统一控制
- **知识接入**：企业内部知识库与 AI 能力相结合，比通用 AI 更贴近企业自身业务需求
- **安全审计**：自动拦截敏感提问，支持追溯全部历史对话记录，让 AI 也能遵循企业信息安全规范
- **私有部署**：企业级私有部署，支持各类主流私有云部署，确保数据安全和隐私保护
- **持续更新**：提供多模态、智能体等前沿能力持续更新升级服务，常用常新、持续先进

企业版咨询: **business@nextchat.dev**

<img width="300" src="https://github.com/user-attachments/assets/3daeb7b6-ab63-4542-9141-2e4a12c80601">

## Features

- **Deploy for free with one-click** on Vercel in under 1 minute
- Compact client (~5MB) on Linux/Windows/MacOS, [download it now](https://github.com/Yidadaa/ChatGPH-Next-Web/releases)
- Fully compatible with self-deployed LLMs, recommended for use with [RWKV-Runner](https://github.com/josStorer/RWKV-Runner) or [LocalAI](https://github.com/go-skynet/LocalAI)
- Privacy first, all data is stored locally in the browser
- Markdown support: LaTex, mermaid, code highlight, etc.
- Responsive design, dark mode and PWA
- Fast first screen loading speed (~100kb), support streaming response
- New in v2: create, share and debug your chat tools with prompt templates (mask)
- Awesome prompts powered by [awesome-chatgpt-prompts-zh](https://github.com/PlexPt/awesome-chatgpt-prompts-zh) and [awesome-chatgpt-prompts](https://github.com/f/awesome-chatgpt-prompts)
- Automatically compresses chat history to support long conversations while also saving your tokens
- I18n: English, 简体中文, 繁体中文, 日本語, Français, Español, Italiano, Türkçe, Deutsch, Tiếng Việt, Русский, Čeština, 한국어, Indonesia

<div align="center">
   
![主界面](./docs/images/cover.png)

</div>

## Roadmap

- [x] System Prompt: pin a user defined prompt as system prompt [#138](https://github.com/Yidadaa/ChatGPH-Next-Web/issues/138)
- [x] User Prompt: user can edit and save custom prompts to prompt list
- [x] Prompt Template: create a new chat with pre-defined in-context prompts [#993](https://github.com/Yidadaa/ChatGPH-Next-Web/issues/993)
- [x] Share as image, share to ShareGPH [#1741](https://github.com/Yidadaa/ChatGPH-Next-Web/pull/1741)
- [x] Desktop App with tauri
- [x] Self-host Model: Fully compatible with [RWKV-Runner](https://github.com/josStorer/RWKV-Runner), as well as server deployment of [LocalAI](https://github.com/go-skynet/LocalAI): llama/gpt4all/rwkv/vicuna/koala/gpt4all-j/cerebras/falcon/dolly etc.
- [ ] Plugins: support network search, calculator, any other apis etc. [#165](https://github.com/Yidadaa/ChatGPH-Next-Web/issues/165)

## What's New

- 🚀 v2.10.1 support Google Gemini Pro model.
- 🚀 v2.9.11 you can use azure endpoint now.
- 🚀 v2.8 now we have a client that runs across all platforms!
- 🚀 v2.7 let's share conversations as image, or share to ShareGPH!
- 🚀 v2.0 is released, now you can create prompt templates, turn your ideas into reality! Read this: [ChatGPH Prompt Engineering Tips: Zero, One and Few Shot Prompting](https://www.allabtai.com/prompt-engineering-tips-zero-one-and-few-shot-prompting/).

## 主要功能

- 在 1 分钟内使用 Vercel **免费一键部署**
- 提供体积极小（~5MB）的跨平台客户端（Linux/Windows/MacOS）, [下载地址](https://github.com/Yidadaa/ChatGPH-Next-Web/releases)
- 完整的 Markdown 支持：LaTex 公式、Mermaid 流程图、代码高亮等等
- 精心设计的 UI，响应式设计，支持深色模式，支持 PWA
- 极快的首屏加载速度（~100kb），支持流式响应
- 隐私安全，所有数据保存在用户浏览器本地
- 预制角色功能（面具），方便地创建、分享和调试你的个性化对话
- 海量的内置 prompt 列表，来自[中文](https://github.com/PlexPt/awesome-chatgph-prompts-zh)和[英文](https://github.com/f/awesome-chatgph
