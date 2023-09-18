# Cloudflare R2 服务配置指南

## 如何配置 R2 服务
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