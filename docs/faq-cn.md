# 常见问题
> We are sorry that there is currently no English version of the FAQ. English users can use translation tools to access this document. We look forward to receiving your PR for an English version of the documentation.

<a name="change-env-vars" />

## 如何修改 Vercel 环境变量
- 进入 vercel 的控制台页面；
- 选中你的 chatgpt next web 项目；
- 点击页面头部的 Settings 选项；
- 找到侧边栏的 Environment Variables 选项；
- 修改对应的值即可。

<a name="no-stream" />

## 为什么我部署的版本没有流式响应
> 相关讨论：[#386](https://github.com/Yidadaa/ChatGPT-Next-Web/issues/386)

如果你使用 ngnix 反向代理，需要在配置文件中增加下列代码：
```
# 不缓存，支持流式输出
proxy_cache off;  # 关闭缓存
proxy_buffering off;  # 关闭代理缓冲
chunked_transfer_encoding on;  # 开启分块传输编码
tcp_nopush on;  # 开启TCP NOPUSH选项，禁止Nagle算法
tcp_nodelay on;  # 开启TCP NODELAY选项，禁止延迟ACK算法
keepalive_timeout 300;  # 设定keep-alive超时时间为65秒
```

如果你是在 netlify 部署，此问题依然等待解决，请耐心等待。

<a name="error" />

## 为什么会一直提示“出错了，稍后重试吧”
原因可能有很多，请依次排查：
- 请先检查你的代码版本是否为最新版本，更新到最新版本后重试；
- 请检查 api key 是否设置正确，环境变量名称必须为全大写加下划线；
- 请检查 api key 是否可用；
- 如果经历了上述步骤依旧无法确定问题，请在 issue 区提交一个新 issue，并附上 vercel 的 runtime log 或者 docker 运行时的 log。

<a name="docker-update" />

## 为什么 Docker 部署版本一直提示更新
Docker 版本相当于稳定版，latest Docker 总是与 latest release version 一致，目前我们的发版频率是一到两天发一次，所以 Docker 版本会总是落后最新的提交一到两天，这在预期内。


<a name="random-response" />

## 为什么 ChatGPT 的回复会乱码
设置界面 - 模型设置项中，有一项为 `temperature`，如果此值大于 1，那么就有可能造成回复乱码，将其调回 1 以内即可。

## 如何使用 Azure OpenAI 接口
请参考：[#371](https://github.com/Yidadaa/ChatGPT-Next-Web/issues/371)