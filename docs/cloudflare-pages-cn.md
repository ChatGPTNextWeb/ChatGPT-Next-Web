# Cloudflare Pages 的部署说明

## 如何新建项目
从Github fork 本项目，然后登录dash.cloudflare.com，进入pages。


1. 点击 Create a project；
2. 选择 Connect to Git；
3. 关联Cloudlfare Pages和你的GitHub账号;
4. 选中你fork的此项目;
5. 点击 Begin setup;
6. Project name, Production branch，默认即可，有需要按实际改动;
7. Build Settings下的Framework prsets要选Next.js;
8. Build command 暂时不要用默认的命令，因为有node:buffer的bug，写我给的这个：
```
npx https://prerelease-registry.devprod.cloudflare.dev/next-on-pages/runs/4930842298/npm-package-next-on-pages-230 --experimental-minify
```
9. Build output directory 用系统默认，不要改动；
10. Root Directory 不要改动；
11. Environment variables ，点击>，然后Add variable，按如下填写：

    - NODE_VERSION=20.1
    - NEXT_TELEMETRY_DISABLE=1
    - OPENAI_API_KEY=你自己的API Key
    - YARN_VERSION=1.22.19
    - PHP_VERSION=7.4

    下面的根据实际需要选填：

    - CODE= 可选填，访问密码，可以使用逗号隔开多个密码
    - OPENAI_ORG_ID= 可选填，指定 OpenAI 中的组织 ID
    - HIDE_USER_API_KEY=1 可选，不让用户自行填入 API Key
    - DISABLE_GPT4=1 可选，不让用户使用 GPT-4
12. Save and Deploy;
13. 点Cancel deployment，因为要填 Compatibility flags;
14. 去Build settings, Functions, 找到Compatibility flags；
15. Configure Production compatibility flag 填 nodejs_compat；
16. Configure Preview compatibility flag 填 nodejs_compat；
17. 去 Deployments，点Retry depolyment.
18. Enjoy.
