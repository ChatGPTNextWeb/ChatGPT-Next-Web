# 常见问题

## 如何快速获得帮助？
1. 询问ChatGPT / Bing / 百度 / Google等。
2. 询问网友。请提供问题的背景信息和碰到问题的详细描述。高质量的提问容易获得有用的答案。

# 部署相关问题

各种部署方式详细教程参考：https://rptzik3toh.feishu.cn/docx/XtrdduHwXoSCGIxeFLlcEPsdn8b  

## 为什么 Docker 部署版本一直提示更新
Docker 版本相当于稳定版，latest Docker 总是与 latest release version 一致，目前我们的发版频率是一到两天发一次，所以 Docker 版本会总是落后最新的提交一到两天，这在预期内。

## 如何部署在Vercel上
1. 注册Github账号，fork该项目
2. 注册Vercel（需手机验证，可以用中国号码），连接你的Github账户
3. Vercel上新建项目，选择你在Github fork的项目，按需填写环境变量，开始部署。部署之后，你可以在有梯子的条件下，通过vercel提供的域名访问你的项目。
4. 如果需要在国内无墙访问：在你的域名管理网站，添加一条域名的CNAME记录，指向cname.vercel-dns.com。之后在Vercel上设置你的域名访问。

## 如何修改 Vercel 环境变量
- 进入 vercel 的控制台页面；
- 选中你的 chatgpt next web 项目；
- 点击页面头部的 Settings 选项；
- 找到侧边栏的 Environment Variables 选项；
- 修改对应的值即可。
  
## 环境变量CODE是什么？必须设置吗？
这是你自定义的访问密码，你可以选择：
1. 不设置，删除该环境变量即可。谨慎：此时任何人可以访问你的项目。
2. 部署项目时，设置环境变量CODE（支持多个密码逗号分隔）。设置访问密码后，用户需要在设置界面输入访问密码才可以使用。参见[相关说明](https://github.com/Yidadaa/ChatGPT-Next-Web/blob/main/README_CN.md#%E9%85%8D%E7%BD%AE%E9%A1%B5%E9%9D%A2%E8%AE%BF%E9%97%AE%E5%AF%86%E7%A0%81)

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

## 我部署好了，但是无法访问
请检查排除以下问题：
- 服务启动了吗？
- 端口正确映射了吗？
- 防火墙开放端口了吗？
- 到服务器的路由通吗？
- 域名正确解析了吗？

## 什么是代理，如何使用？
由于OpenAI的IP限制，中国和其他一些国家/地区无法直接连接OpenAI API，需要通过代理。你可以使用代理服务器（正向代理），或者已经设置好的OpenAI API反向代理。
- 正向代理例子：科学上网梯子。docker部署的情况下，设置环境变量HTTP_PROXY为你的代理地址（例如：10.10.10.10:8002）。
- 反向代理例子：可以用别人搭建的代理地址，或者通过Cloudflare免费设置。设置项目环境变量BASE_URL为你的代理地址。

## 国内服务器可以部署吗？
可以但需要解决的问题：
- 需要代理才能连接github和openAI等网站；
- 国内服务器要设置域名解析的话需要备案；
- 国内政策限制代理访问外网/ChatGPT相关应用，可能被封。


# 使用相关问题

## 为什么会一直提示“出错了，稍后重试吧”
原因可能有很多，请依次排查：
- 请先检查你的代码版本是否为最新版本，更新到最新版本后重试；
- 请检查 api key 是否设置正确，环境变量名称必须为全大写加下划线；
- 请检查 api key 是否可用；
- 如果经历了上述步骤依旧无法确定问题，请在 issue 区提交一个新 issue，并附上 vercel 的 runtime log 或者 docker 运行时的 log。

## 为什么 ChatGPT 的回复会乱码
设置界面 - 模型设置项中，有一项为 `temperature`，如果此值大于 1，那么就有可能造成回复乱码，将其调回 1 以内即可。

## 使用时提示“现在是未授权状态，请在设置页输入访问密码”？
项目通过环境变量CODE设置了访问密码。第一次使用时，需要到设置中，输入访问码才可以使用。

## 使用时提示"You exceeded your current quota, ..."
API KEY有问题。余额不足。

# 网络服务相关问题
## Cloudflare是什么？
Cloudflare（CF）是一个提供CDN，域名管理，静态页面托管，边缘计算函数部署等的网络服务供应商。常见的用途：购买和/或托管你的域名（解析、动态域名等），给你的服务器套上CDN（可以隐藏ip免被墙），部署网站（CF Pages）。CF免费提供大多数服务。

## Vercel是什么？
Vercel 是一个全球化的云平台，旨在帮助开发人员更快地构建和部署现代 Web 应用程序。本项目以及许多Web应用可以一键免费部署在Vercel上。无需懂代码，无需懂linux，无需服务器，无需付费，无需设置OpenAI API代理。缺点是需要绑定域名才可以在国内无墙访问。

## 如何获得一个域名？
1. 自己去域名供应商处注册，国外有Namesilo（支持支付宝）, Cloudflare等等，国内有万网等等；
2. 免费的域名供应商：eu.org(二级域名)等；
3. 问朋友要一个免费的二级域名。

## 如何获得一台服务器
- 国外服务器供应商举例：亚马逊云，谷歌云，Vultr，Bandwagon，Hostdare，等等；
国外服务器事项：服务器线路影响国内访问速度，推荐CN2 GIA和CN2线路的服务器。若服务器在国内访问困难（丢包严重等），可以尝试套CDN（Cloudflare等供应商）。
- 国内服务器供应商：阿里云，腾讯等；
国内服务器事项：解析域名需要备案；国内服务器带宽较贵；访问国外网站（Github, openAI等）需要代理。

## 什么情况下服务器要备案？
在中国大陆经营的网站按监管要求需要备案。实际操作中，服务器位于国内且有域名解析的情况下，服务器供应商会执行监管的备案要求，否则会关停服务。通常的规则如下：
|服务器位置|域名供应商|是否需要备案|
|---|---|---|
|国内|国内|是|
|国内|国外|是|
|国外|国外|否|
|国外|国内|通常否|

换服务器供应商后需要转备案。

# OpenAI相关问题
## 如何注册OpenAI账号？
去chat.openai.com注册。你需要：
- 一个良好的梯子（OpenAI支持地区原生IP地址）
- 一个支持的邮箱（例如Gmail或者公司/学校邮箱，非Outlook或qq邮箱）
- 接收短信认证的方式（例如SMS-activate网站）

## 怎么开通OpenAI API? 怎么查询API余额？
官网地址（需梯子）：https://platform.openai.com/account/usage
有网友搭建了无需梯子的余额查询代理，请询问网友获取。请鉴别来源是否可靠，以免API Key泄露。

## 我新注册的OpenAI账号怎么没有API余额？
（4月6日更新）新注册账号通常会在24小时后显示API余额。当前新注册账号赠送5美元余额。

## 如何给OpenAI API充值？
OpenAI只接受指定地区的信用卡（中国信用卡无法使用）。一些途径举例：
1. Depay虚拟信用卡
2. 申请国外信用卡
3. 网上找人代充

## 如何使用GPT-4的API访问？
- GPT-4的API访问需要单独申请。到以下地址填写你的信息进入申请队列waitlist（准备好你的OpenAI组织ID）：https://openai.com/waitlist/gpt-4-api
之后等待邮件消息。
- 开通 ChatGPT Plus 不代表有 GPT-4 权限，两者毫无关系。

## 如何使用 Azure OpenAI 接口
请参考：[#371](https://github.com/Yidadaa/ChatGPT-Next-Web/issues/371)

## 为什么我的 Token 消耗得这么快？
> 相关讨论：[#518](https://github.com/Yidadaa/ChatGPT-Next-Web/issues/518)
- 如果你有 GPT 4 的权限，并且日常在使用 GPT 4 api，那么由于 GPT 4 价格是 GPT 3.5 的 15 倍左右，你的账单金额会急速膨胀；
- 如果你在使用 GPT 3.5，并且使用频率并不高，仍然发现自己的账单金额在飞快增加，那么请马上按照以下步骤排查：
  - 去 openai 官网查看你的 api key 消费记录，如果你的 token 每小时都有消费，并且每次都消耗了上万 token，那你的 key 一定是泄露了，请立即删除重新生成。**不要在乱七八糟的网站上查余额。**
  - 如果你的密码设置很短，比如 5 位以内的字母，那么爆破成本是非常低的，建议你搜索一下 docker 的日志记录，确认是否有人大量尝试了密码组合，关键字：got access code
- 通过上述两个方法就可以定位到你的 token 被快速消耗的原因：
  - 如果 openai 消费记录异常，但是 docker 日志没有问题，那么说明是 api key 泄露；
  - 如果 docker 日志发现大量 got access code 爆破记录，那么就是密码被爆破了。
 
## API是怎么计费的？
OpenAI网站计费说明：https://openai.com/pricing#language-models  
OpenAI根据token数收费，1000个token通常可代表750个英文单词，或500个汉字。输入（Prompt）和输出（Completion）分别统计费用。  
|模型|用户输入（Prompt）计费|模型输出（Completion）计费|每次交互最大token数|
|----|----|----|----|
|gpt-3.5|$0.002 / 1千tokens|$0.002 / 1千tokens|4096|
|gpt-4|$0.03 / 1千tokens|$0.06 / 1千tokens|8192|
|gpt-4-32K|$0.06 / 1千tokens|$0.12 / 1千tokens|32768|

## gpt-3.5-turbo和gpt3.5-turbo-0301(或者gpt3.5-turbo-mmdd)模型有什么区别?
官方文档说明：https://platform.openai.com/docs/models/gpt-3-5  
- gpt-3.5-turbo是最新的模型，会不断得到更新。
- gpt-3.5-turbo-0301是3月1日定格的模型快照，不会变化，预期3个月后被新快照替代。
