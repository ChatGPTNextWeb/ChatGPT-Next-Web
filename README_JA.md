<div align="center">
<img src="./docs/images/ent.svg" alt="プレビュー"/>

<h1 align="center">NextChat</h1>

ワンクリックで無料であなた専用の ChatGPT ウェブアプリをデプロイ。GPT3、GPT4 & Gemini Pro モデルをサポート。

[企業版](#企業版) / [デモ](https://chat-gpt-next-web.vercel.app/) / [フィードバック](https://github.com/Yidadaa/ChatGPT-Next-Web/issues) / [Discordに参加](https://discord.gg/zrhvHCr79N)

[<img src="https://vercel.com/button" alt="Zeaburでデプロイ" height="30">](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FChatGPTNextWeb%2FChatGPT-Next-Web&env=OPENAI_API_KEY&env=CODE&project-name=nextchat&repository-name=NextChat) [<img src="https://zeabur.com/button.svg" alt="Zeaburでデプロイ" height="30">](https://zeabur.com/templates/ZBUEFA)  [<img src="https://gitpod.io/button/open-in-gitpod.svg" alt="Gitpodで開く" height="30">](https://gitpod.io/#https://github.com/Yidadaa/ChatGPT-Next-Web)


</div>

## 企業版

あなたの会社のプライベートデプロイとカスタマイズのニーズに応える
- **ブランドカスタマイズ**：企業向けに特別に設計された VI/UI、企業ブランドイメージとシームレスにマッチ
- **リソース統合**：企業管理者が数十種類のAIリソースを統一管理、チームメンバーはすぐに使用可能
- **権限管理**：メンバーの権限、リソースの権限、ナレッジベースの権限を明確にし、企業レベルのAdmin Panelで統一管理
- **知識の統合**：企業内部のナレッジベースとAI機能を結びつけ、汎用AIよりも企業自身の業務ニーズに近づける
- **セキュリティ監査**：機密質問を自動的にブロックし、すべての履歴対話を追跡可能にし、AIも企業の情報セキュリティ基準に従わせる
- **プライベートデプロイ**：企業レベルのプライベートデプロイ、主要なプライベートクラウドデプロイをサポートし、データのセキュリティとプライバシーを保護
- **継続的な更新**：マルチモーダル、エージェントなどの最先端機能を継続的に更新し、常に最新であり続ける

企業版のお問い合わせ: **business@nextchat.dev**


## 开始使用

1. 准备好你的 [OpenAI API Key](https://platform.openai.com/account/api-keys);
2. 点击右侧按钮开始部署：
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYidadaa%2FChatGPT-Next-Web&env=OPENAI_API_KEY&env=CODE&env=GOOGLE_API_KEY&project-name=chatgpt-next-web&repository-name=ChatGPT-Next-Web)，直接使用 Github 账号登录即可，记得在环境变量页填入 API Key 和[页面访问密码](#配置页面访问密码) CODE；
3. 部署完毕后，即可开始使用；
4. （可选）[绑定自定义域名](https://vercel.com/docs/concepts/projects/domains/add-a-domain)：Vercel 分配的域名 DNS 在某些区域被污染了，绑定自定义域名即可直连。


## 始めに

1. [OpenAI API Key](https://platform.openai.com/account/api-keys)を準備する;
2. 右側のボタンをクリックしてデプロイを開始：
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYidadaa%2FChatGPT-Next-Web&env=OPENAI_API_KEY&env=CODE&env=GOOGLE_API_KEY&project-name=chatgpt-next-web&repository-name=ChatGPT-Next-Web) 、GitHubアカウントで直接ログインし、環境変数ページにAPI Keyと[ページアクセスパスワード](#設定ページアクセスパスワード) CODEを入力してください;
3. デプロイが完了したら、すぐに使用を開始できます;
4. （オプション）[カスタムドメインをバインド](https://vercel.com/docs/concepts/projects/domains/add-a-domain)：Vercelが割り当てたドメインDNSは一部の地域で汚染されているため、カスタムドメインをバインドすると直接接続できます。

<div align="center">
   
![メインインターフェース](./docs/images/cover.png)

</div>


## 保持更新

如果你按照上述步骤一键部署了自己的项目，可能会发现总是提示“存在更新”的问题，这是由于 Vercel 会默认为你创建一个新项目而不是 fork 本项目，这会导致无法正确地检测更新。
推荐你按照下列步骤重新部署：

- 删除掉原先的仓库；
- 使用页面右上角的 fork 按钮，fork 本项目；
- 在 Vercel 重新选择并部署，[请查看详细教程](./docs/vercel-cn.md#如何新建项目)。



## 更新を維持する

もし上記の手順に従ってワンクリックでプロジェクトをデプロイした場合、「更新があります」というメッセージが常に表示されることがあります。これは、Vercel がデフォルトで新しいプロジェクトを作成するためで、本プロジェクトをフォークしていないことが原因です。そのため、正しく更新を検出できません。

以下の手順に従って再デプロイすることをお勧めします：

- 元のリポジトリを削除する
- ページ右上のフォークボタンを使って、本プロジェクトをフォークする
- Vercel で再度選択してデプロイする、[詳細な手順はこちらを参照してください](./docs/vercel-ja.md)。




### 打开自动更新

> 如果你遇到了 Upstream Sync 执行错误，请手动 Sync Fork 一次！

当你 fork 项目之后，由于 Github 的限制，需要手动去你 fork 后的项目的 Actions 页面启用 Workflows，并启用 Upstream Sync Action，启用之后即可开启每小时定时自动更新：

![自动更新](./docs/images/enable-actions.jpg)

![启用自动更新](./docs/images/enable-actions-sync.jpg)



### 自動更新を開く

> Upstream Sync の実行エラーが発生した場合は、手動でフォークを同期してください！

プロジェクトをフォークした後、GitHub の制限により、フォーク後のプロジェクトの Actions ページで Workflows を手動で有効にし、Upstream Sync Action を有効にする必要があります。有効化後、毎時の定期自動更新が可能になります：

![自動更新](./docs/images/enable-actions.jpg)

![自動更新を有効にする](./docs/images/enable-actions-sync.jpg)


### 手动更新代码

如果你想让手动立即更新，可以查看 [Github 的文档](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork) 了解如何让 fork 的项目与上游代码同步。

你可以 star/watch 本项目或者 follow 作者来及时获得新功能更新通知。


### 手動でコードを更新する

手動で即座に更新したい場合は、[GitHub のドキュメント](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork)を参照して、フォークしたプロジェクトを上流のコードと同期する方法を確認してください。

このプロジェクトをスターまたはウォッチしたり、作者をフォローすることで、新機能の更新通知をすぐに受け取ることができます。


## 配置页面访问密码

> 配置密码后，用户需要在设置页手动填写访问码才可以正常聊天，否则会通过消息提示未授权状态。

> **警告**：请务必将密码的位数设置得足够长，最好 7 位以上，否则[会被爆破](https://github.com/Yidadaa/ChatGPT-Next-Web/issues/518)。

本项目提供有限的权限控制功能，请在 Vercel 项目控制面板的环境变量页增加名为 `CODE` 的环境变量，值为用英文逗号分隔的自定义密码：

```
code1,code2,code3
```

增加或修改该环境变量后，请**重新部署**项目使改动生效。




## ページアクセスパスワードを設定する

> パスワードを設定すると、ユーザーは設定ページでアクセスコードを手動で入力しない限り、通常のチャットができず、未承認の状態であることを示すメッセージが表示されます。

> **警告**：パスワードの桁数は十分に長く設定してください。7桁以上が望ましいです。さもないと、[ブルートフォース攻撃を受ける可能性があります](https://github.com/Yidadaa/ChatGPT-Next-Web/issues/518)。

このプロジェクトは限られた権限管理機能を提供しています。Vercel プロジェクトのコントロールパネルで、環境変数ページに `CODE` という名前の環境変数を追加し、値をカンマで区切ったカスタムパスワードに設定してください：

```
code1,code2,code3
```

この環境変数を追加または変更した後、**プロジェクトを再デプロイ**して変更を有効にしてください。



## 环境变量

> 本项目大多数配置项都通过环境变量来设置，教程：[如何修改 Vercel 环境变量](./docs/vercel-cn.md)。

### `OPENAI_API_KEY` （必填项）

OpanAI 密钥，你在 openai 账户页面申请的 api key，使用英文逗号隔开多个 key，这样可以随机轮询这些 key。

### `CODE` （可选）

访问密码，可选，可以使用逗号隔开多个密码。

**警告**：如果不填写此项，则任何人都可以直接使用你部署后的网站，可能会导致你的 token 被急速消耗完毕，建议填写此选项。

### `BASE_URL` （可选）

> Default: `https://api.openai.com`

> Examples: `http://your-openai-proxy.com`

OpenAI 接口代理 URL，如果你手动配置了 openai 接口代理，请填写此选项。

> 如果遇到 ssl 证书问题，请将 `BASE_URL` 的协议设置为 http。

### `OPENAI_ORG_ID` （可选）

指定 OpenAI 中的组织 ID。

### `AZURE_URL` （可选）

> 形如：https://{azure-resource-url}/openai/deployments/{deploy-name}
> 如果你已经在`CUSTOM_MODELS`中参考`displayName`的方式配置了{deploy-name}，那么可以从`AZURE_URL`中移除`{deploy-name}`

Azure 部署地址。

### `AZURE_API_KEY` （可选）

Azure 密钥。

### `AZURE_API_VERSION` （可选）

Azure Api 版本，你可以在这里找到：[Azure 文档](https://learn.microsoft.com/en-us/azure/ai-services/openai/reference#chat-completions)。

### `GOOGLE_API_KEY` (可选)

Google Gemini Pro 密钥.

### `GOOGLE_URL` (可选)

Google Gemini Pro Api Url.

### `ANTHROPIC_API_KEY` (可选)

anthropic claude Api Key.

### `ANTHROPIC_API_VERSION` (可选)

anthropic claude Api version.

### `ANTHROPIC_URL` (可选)

anthropic claude Api Url.

### `BAIDU_API_KEY` (可选)

Baidu Api Key.

### `BAIDU_SECRET_KEY` (可选)

Baidu Secret Key.

### `BAIDU_URL` (可选)

Baidu Api Url.

### `BYTEDANCE_API_KEY` (可选)

ByteDance Api Key.

### `BYTEDANCE_URL` (可选)

ByteDance Api Url.

### `ALIBABA_API_KEY` (可选)

阿里云（千问）Api Key.

### `ALIBABA_URL` (可选)

阿里云（千问）Api Url.

### `HIDE_USER_API_KEY` （可选）

如果你不想让用户自行填入 API Key，将此环境变量设置为 1 即可。

### `DISABLE_GPT4` （可选）

如果你不想让用户使用 GPT-4，将此环境变量设置为 1 即可。

### `ENABLE_BALANCE_QUERY` （可选）

如果你想启用余额查询功能，将此环境变量设置为 1 即可。

### `DISABLE_FAST_LINK` （可选）

如果你想禁用从链接解析预制设置，将此环境变量设置为 1 即可。

### `WHITE_WEBDEV_ENDPOINTS` (可选)

如果你想增加允许访问的webdav服务地址，可以使用该选项，格式要求：
- 每一个地址必须是一个完整的 endpoint
> `https://xxxx/xxx`
- 多个地址以`,`相连

### `CUSTOM_MODELS` （可选）

> 示例：`+qwen-7b-chat,+glm-6b,-gpt-3.5-turbo,gpt-4-1106-preview=gpt-4-turbo` 表示增加 `qwen-7b-chat` 和 `glm-6b` 到模型列表，而从列表中删除 `gpt-3.5-turbo`，并将 `gpt-4-1106-preview` 模型名字展示为 `gpt-4-turbo`。
> 如果你想先禁用所有模型，再启用指定模型，可以使用 `-all,+gpt-3.5-turbo`，则表示仅启用 `gpt-3.5-turbo`

用来控制模型列表，使用 `+` 增加一个模型，使用 `-` 来隐藏一个模型，使用 `模型名=展示名` 来自定义模型的展示名，用英文逗号隔开。

在Azure的模式下，支持使用`modelName@azure=deploymentName`的方式配置模型名称和部署名称(deploy-name)
> 示例：`+gpt-3.5-turbo@azure=gpt35`这个配置会在模型列表显示一个`gpt35(Azure)`的选项

在ByteDance的模式下，支持使用`modelName@bytedance=deploymentName`的方式配置模型名称和部署名称(deploy-name)
> 示例: `+Doubao-lite-4k@bytedance=ep-xxxxx-xxx`这个配置会在模型列表显示一个`Doubao-lite-4k(ByteDance)`的选项


### `DEFAULT_MODEL` （可选）

更改默认模型

### `DEFAULT_INPUT_TEMPLATE` （可选）

自定义默认的 template，用于初始化『设置』中的『用户输入预处理』配置项



## 環境変数

> 本プロジェクトのほとんどの設定は環境変数で行います。チュートリアル：[Vercel の環境変数を変更する方法](./docs/vercel-cn.md)。

### `OPENAI_API_KEY` （必須）

OpenAI の API キー。OpenAI アカウントページで申請したキーをカンマで区切って複数設定できます。これにより、ランダムにキーが選択されます。

### `CODE` （オプション）

アクセスパスワード。カンマで区切って複数設定可能。

**警告**：この項目を設定しないと、誰でもデプロイしたウェブサイトを利用でき、トークンが急速に消耗する可能性があるため、設定をお勧めします。

### `BASE_URL` （オプション）

> デフォルト: `https://api.openai.com`

> 例: `http://your-openai-proxy.com`

OpenAI API のプロキシ URL。手動で OpenAI API のプロキシを設定している場合はこのオプションを設定してください。

> SSL 証明書の問題がある場合は、`BASE_URL` のプロトコルを http に設定してください。

### `OPENAI_ORG_ID` （オプション）

OpenAI の組織 ID を指定します。

### `AZURE_URL` （オプション）

> 形式: https://{azure-resource-url}/openai/deployments/{deploy-name}
> `CUSTOM_MODELS` で `displayName` 形式で {deploy-name} を設定した場合、`AZURE_URL` から {deploy-name} を省略できます。

Azure のデプロイ URL。

### `AZURE_API_KEY` （オプション）

Azure の API キー。

### `AZURE_API_VERSION` （オプション）

Azure API バージョン。[Azure ドキュメント](https://learn.microsoft.com/en-us/azure/ai-services/openai/reference#chat-completions)で確認できます。

### `GOOGLE_API_KEY` (オプション)

Google Gemini Pro API キー。

### `GOOGLE_URL` (オプション)

Google Gemini Pro API の URL。

### `ANTHROPIC_API_KEY` (オプション)

Anthropic Claude API キー。

### `ANTHROPIC_API_VERSION` (オプション)

Anthropic Claude API バージョン。

### `ANTHROPIC_URL` (オプション)

Anthropic Claude API の URL。

### `BAIDU_API_KEY` (オプション)

Baidu API キー。

### `BAIDU_SECRET_KEY` (オプション)

Baidu シークレットキー。

### `BAIDU_URL` (オプション)

Baidu API の URL。

### `BYTEDANCE_API_KEY` (オプション)

ByteDance API キー。

### `BYTEDANCE_URL` (オプション)

ByteDance API の URL。

### `ALIBABA_API_KEY` (オプション)

アリババ（千问）API キー。

### `ALIBABA_URL` (オプション)

アリババ（千问）API の URL。

### `HIDE_USER_API_KEY` （オプション）

ユーザーが API キーを入力できないようにしたい場合は、この環境変数を 1 に設定します。

### `DISABLE_GPT4` （オプション）

ユーザーが GPT-4 を使用できないようにしたい場合は、この環境変数を 1 に設定します。

### `ENABLE_BALANCE_QUERY` （オプション）

バランスクエリ機能を有効にしたい場合は、この環境変数を 1 に設定します。

### `DISABLE_FAST_LINK` （オプション）

リンクからのプリセット設定解析を無効にしたい場合は、この環境変数を 1 に設定します。

### `WHITE_WEBDEV_ENDPOINTS` (オプション)

アクセス許可を与える WebDAV サービスのアドレスを追加したい場合、このオプションを使用します。フォーマット要件：
- 各アドレスは完全なエンドポイントでなければなりません。
> `https://xxxx/xxx`
- 複数のアドレスは `,` で接続します。

### `CUSTOM_MODELS` （オプション）

> 例：`+qwen-7b-chat,+glm-6b,-gpt-3.5-turbo,gpt-4-1106-preview=gpt-4-turbo` は `qwen-7b-chat` と `glm-6b` をモデルリストに追加し、`gpt-3.5-turbo` を削除し、`gpt-4-1106-preview` のモデル名を `gpt-4-turbo` として表示します。
> すべてのモデルを無効にし、特定のモデルを有効にしたい場合は、`-all,+gpt-3.5-turbo` を使用します。これは `gpt-3.5-turbo` のみを有効にすることを意味します。

モデルリストを管理します。`+` でモデルを追加し、`-` でモデルを非表示にし、`モデル名=表示名` でモデルの表示名をカスタマイズし、カンマで区切ります。

Azure モードでは、`modelName@azure=deploymentName` 形式でモデル名とデプロイ名（deploy-name）を設定できます。
> 例：`+gpt-3.5-turbo@azure=gpt35` この設定でモデルリストに `gpt35(Azure)` のオプションが表示されます。

ByteDance モードでは、`modelName@bytedance=deploymentName` 形式でモデル名とデプロイ名（deploy-name）を設定できます。
> 例: `+Doubao-lite-4k@bytedance=ep-xxxxx-xxx` この設定でモデルリストに `Doubao-lite-4k(ByteDance)` のオプションが表示されます。

### `DEFAULT_MODEL` （オプション）

デフォルトのモデルを変更します。

### `DEFAULT_INPUT_TEMPLATE` （オプション）

『設定』の『ユーザー入力前処理』の初期設定に使用するテンプレートをカスタマイズします。




## 开发

点击下方按钮，开始二次开发：

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/Yidadaa/ChatGPT-Next-Web)

在开始写代码之前，需要在项目根目录新建一个 `.env.local` 文件，里面填入环境变量：

```
OPENAI_API_KEY=<your api key here>

# 中国大陆用户，可以使用本项目自带的代理进行开发，你也可以自由选择其他代理地址
BASE_URL=https://b.nextweb.fun/api/proxy
```

## 開発

下のボタンをクリックして二次開発を開始してください：

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/Yidadaa/ChatGPT-Next-Web)

コードを書く前に、プロジェクトのルートディレクトリに `.env.local` ファイルを新規作成し、環境変数を記入します：

```
OPENAI_API_KEY=<your api key here>
```

### 本地开发

1. 安装 nodejs 18 和 yarn，具体细节请询问 ChatGPT；
2. 执行 `yarn install && yarn dev` 即可。⚠️ 注意：此命令仅用于本地开发，不要用于部署！
3. 如果你想本地部署，请使用 `yarn install && yarn build && yarn start` 命令，你可以配合 pm2 来守护进程，防止被杀死，详情询问 ChatGPT。

### ローカル開発

1. Node.js 18 と Yarn をインストールします。具体的な方法は ChatGPT にお尋ねください。
2. `yarn install && yarn dev` を実行します。⚠️ 注意：このコマンドはローカル開発用であり、デプロイには使用しないでください。
3. ローカルでデプロイしたい場合は、`yarn install && yarn build && yarn start` コマンドを使用してください。プロセスを守るために pm2 を使用することもできます。詳細は ChatGPT にお尋ねください。


## 部署

### 容器部署 （推荐）

> Docker 版本需要在 20 及其以上，否则会提示找不到镜像。

> ⚠️ 注意：docker 版本在大多数时间都会落后最新的版本 1 到 2 天，所以部署后会持续出现“存在更新”的提示，属于正常现象。

```shell
docker pull yidadaa/chatgpt-next-web

docker run -d -p 3000:3000 \
   -e OPENAI_API_KEY=sk-xxxx \
   -e CODE=页面访问密码 \
   yidadaa/chatgpt-next-web
```

你也可以指定 proxy：

```shell
docker run -d -p 3000:3000 \
   -e OPENAI_API_KEY=sk-xxxx \
   -e CODE=页面访问密码 \
   --net=host \
   -e PROXY_URL=http://127.0.0.1:7890 \
   yidadaa/chatgpt-next-web
```

如果你的本地代理需要账号密码，可以使用：

```shell
-e PROXY_URL="http://127.0.0.1:7890 user password"
```

如果你需要指定其他环境变量，请自行在上述命令中增加 `-e 环境变量=环境变量值` 来指定。




## デプロイ

### コンテナデプロイ（推奨）

> Docker バージョンは 20 以上が必要です。それ以下だとイメージが見つからないというエラーが出ます。

> ⚠️ 注意：Docker バージョンは最新バージョンより 1～2 日遅れることが多いため、デプロイ後に「更新があります」の通知が出続けることがありますが、正常です。

```shell
docker pull yidadaa/chatgpt-next-web

docker run -d -p 3000:3000 \
   -e OPENAI_API_KEY=sk-xxxx \
   -e CODE=ページアクセスパスワード \
   yidadaa/chatgpt-next-web
```

プロキシを指定することもできます：

```shell
docker run -d -p 3000:3000 \
   -e OPENAI_API_KEY=sk-xxxx \
   -e CODE=ページアクセスパスワード \
   --net=host \
   -e PROXY_URL=http://127.0.0.1:7890 \
   yidadaa/chatgpt-next-web
```

ローカルプロキシがアカウントとパスワードを必要とする場合は、以下を使用できます：

```shell
-e PROXY_URL="http://127.0.0.1:7890 user password"
```

他の環境変数を指定する必要がある場合は、上記のコマンドに `-e 環境変数=環境変数値` を追加して指定してください。




### 本地部署

在控制台运行下方命令：

```shell
bash <(curl -s https://raw.githubusercontent.com/Yidadaa/ChatGPT-Next-Web/main/scripts/setup.sh)
```

⚠️ 注意：如果你安装过程中遇到了问题，请使用 docker 部署。



### ローカルデプロイ

コンソールで以下のコマンドを実行します：

```shell
bash <(curl -s https://raw.githubusercontent.com/Yidadaa/ChatGPT-Next-Web/main/scripts/setup.sh)
```

⚠️ 注意：インストール中に問題が発生した場合は、Docker を使用してデプロイしてください。



## 鸣谢

### 捐赠者

> 见英文版。

### 贡献者

[见项目贡献者列表](https://github.com/Yidadaa/ChatGPT-Next-Web/graphs/contributors)

### 相关项目

- [one-api](https://github.com/songquanpeng/one-api): 一站式大模型额度管理平台，支持市面上所有主流大语言模型



## 謝辞

### 寄付者

> 英語版をご覧ください。

### 貢献者

[プロジェクトの貢献者リストはこちら](https://github.com/Yidadaa/ChatGPT-Next-Web/graphs/contributors)

### 関連プロジェクト

- [one-api](https://github.com/songquanpeng/one-api): 一つのプラットフォームで大規模モデルのクォータ管理を提供し、市場に出回っているすべての主要な大規模言語モデルをサポートします。




## 开源协议

[MIT](https://opensource.org/license/mit/)


## オープンソースライセンス

[MIT](https://opensource.org/license/mit/)
