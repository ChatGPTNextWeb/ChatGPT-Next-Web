# 对象存储服务配置指南

请根据自身网络情况，选择 S3 或 R2 来作为对象存储服务，两个服务配置其一即可。

由于国内网络使用 R2 经常抽风，这边推荐选择一家支持 S3 协议的对象存储服务提供商。

## 配置 S3 对象存储服务

这边以 `又拍云` 做为演示，其它运营商请查询对应文档。

参考: https://help.upyun.com/knowledge-base/aws-s3%E5%85%BC%E5%AE%B9/#e585bce5aeb9e5b7a5e585b7e7a4bae4be8b

1. 登录 [又拍云 - 加速在线业务 - CDN加速 - 云存储 (upyun.com)](https://www.upyun.com/)
2. 注册账户
3. 进入"云存储"控制台[又拍云控制台 (upyun.com)](https://console.upyun.com/services/file/)
4. 创建一个服务，记录你的服务名
5. 进入"用户管理"，"操作员"创建一个"操作员"并赋予相应权限
6. 编辑"操作员"复制"AccessKey"和"SecretAccessKey"
7. 如果读写权限未勾选则选中后确定
8. 回到 ChatGPT-Next-Web-LangChain 项目修改环境变量。按照以下信息填写：
   - `S3_ENDPOINT=http://s3.api.upyun.com`
   - `S3_ACCESS_KEY_ID=AccessKey`
   - `S3_SECRET_ACCESS_KEY=SecretAccessKey`
   - `S3_BUCKET=服务名`
9. Enjoy.

## 配置 R2 服务
登录到 dash.cloudflare.com 并在左侧菜单进入 R2。

1. 复制右侧 "账户ID"

2. 点击 "创建存储桶"。

3. 自定义配置一个存储桶名称，记录下来用于后面配置环境变量，点击 "创建存储桶"。

4. 进入 "设置"，点击 "添加 CORS 策略"，将下面内容粘贴上去并点击 "保存"。

   ```json
   [
     {
       "AllowedOrigins": [
         "*"
       ],
       "AllowedMethods": [
         "PUT",
         "DELETE",
         "GET"
       ],
       "AllowedHeaders": [
         "content-type"
       ],
       "MaxAgeSeconds": 3000
     }
   ]
   ```

5. 回到 R2 主菜单，点击右侧 "管理 R2 API 令牌"。

6. 点击 "创建 API 令牌"，权限选择为 "管理员读和写"，TTL 选择为 "永久"，点击 "创建 API 令牌"。

7. 复制 "访问密钥 ID" 和 "机密访问密钥"，点击 "完成"。

8. 回到 ChatGPT-Next-Web-LangChain 项目修改环境变量。按照以下信息填写：

   - `R2_ACCOUNT_ID=账户ID`
   - `R2_ACCESS_KEY_ID=访问密钥 ID`
   - `R2_SECRET_ACCESS_KEY=机密访问密钥`
   - `R2_BUCKET=存储桶名称`

9. Enjoy.