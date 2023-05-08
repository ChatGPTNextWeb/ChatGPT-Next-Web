# Vercel 的使用说明

## 如何新建项目
当你从 Github fork 本项目之后，需要重新在 Vercel 创建一个全新的 Vercel 项目来重新部署，你需要按照下列步骤进行。

![vercel-create-1](./images/vercel/vercel-create-1.jpg)
1. 进入 Vercel 控制台首页；
2. 点击 Add New；
3. 选择 Project。

![vercel-create-2](./images/vercel/vercel-create-2.jpg)
1. 在 Import Git Repository 处，搜索 chatgpt-next-web；
2. 选中新 fork 的项目，点击 Import。

![vercel-create-3](./images/vercel/vercel-create-3.jpg)
1. 在项目配置页，点开 Environmane Variables 开始配置环境变量；
2. 依次新增名为 OPENAI_API_KEY 和 CODE 的环境变量；
3. 填入环境变量对应的值；
4. 点击 Add 确认增加环境变量；
5. 请确保你添加了 OPENAI_API_KEY，否则无法使用；
6. 点击 Deploy，创建完成，耐心等待 5 分钟左右部署完成。

## 如何增加自定义域名
[TODO]

## 如何更改环境变量
![vercel-env-edit](./images/vercel/vercel-env-edit.jpg)
1. 进去 Vercel 项目内部控制台，点击顶部的 Settings 按钮；
2. 点击左侧的 Environment Variables；
3. 点击已有条目的右侧按钮；
4. 选择 Edit 进行编辑，然后保存即可。

⚠️️ 注意：每次修改完环境变量，你都需要[重新部署项目](#如何重新部署)来让改动生效！

## 如何重新部署
![vercel-redeploy](./images/vercel/vercel-redeploy.jpg)
1. 进入 Vercel 项目内部控制台，点击顶部的 Deployments 按钮；
2. 选择列表最顶部一条的右侧按钮；
3. 点击 Redeploy 即可重新部署。