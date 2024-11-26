<div align="center">
<img src="./docs/images/ent.svg" alt="プレビュー"/>

<h1 align="center">NextChat</h1>

[English](./README.md) / [简体中文](./README_CN.md) / 日本語

ワンクリックで無料であなた専用の ChatGPT ウェブアプリをデプロイ。GPT3、GPT4 & Gemini Pro モデルをサポート。

[NextChatAI](https://nextchat.dev/chat?utm_source=readme) / [企業版](#企業版) / [デモ](https://chat-gpt-next-web.vercel.app/) / [フィードバック](https://github.com/Yidadaa/ChatGPT-Next-Web/issues) / [Discordに参加](https://discord.gg/zrhvHCr79N)

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


## 始めに

1. [OpenAI API Key](https://platform.openai.com/account/api-keys)を準備する;
2. 右側のボタンをクリックしてデプロイを開始：
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYidadaa%2FChatGPT-Next-Web&env=OPENAI_API_KEY&env=CODE&env=GOOGLE_API_KEY&project-name=chatgpt-next-web&repository-name=ChatGPT-Next-Web) 、GitHubアカウントで直接ログインし、環境変数ページにAPI Keyと[ページアクセスパスワード](#設定ページアクセスパスワード) CODEを入力してください;
3. デプロイが完了したら、すぐに使用を開始できます;
4. （オプション）[カスタムドメインをバインド](https://vercel.com/docs/concepts/projects/domains/add-a-domain)：Vercelが割り当てたドメインDNSは一部の地域で汚染されているため、カスタムドメインをバインドすると直接接続できます。

<div align="center">
   
![メインインターフェース](./docs/images/cover.png)

</div>


## 更新を維持する

もし上記の手順に従ってワンクリックでプロジェクトをデプロイした場合、「更新があります」というメッセージが常に表示されることがあります。これは、Vercel がデフォルトで新しいプロジェクトを作成するためで、本プロジェクトを fork していないことが原因です。そのため、正しく更新を検出できません。

以下の手順に従って再デプロイすることをお勧めします：

- 元のリポジトリを削除する
- ページ右上の fork ボタンを使って、本プロジェクトを fork する
- Vercel で再度選択してデプロイする、[詳細な手順はこちらを参照してください](./docs/vercel-ja.md)。


### 自動更新を開く

> Upstream Sync の実行エラーが発生した場合は、[手動で Sync Fork](./README_JA.md#手動でコードを更新する) してください！

プロジェクトを fork した後、GitHub の制限により、fork 後のプロジェクトの Actions ページで Workflows を手動で有効にし、Upstream Sync Action を有効にする必要があります。有効化後、毎時の定期自動更新が可能になります：

![自動更新](./docs/images/enable-actions.jpg)

![自動更新を有効にする](./docs/images/enable-actions-sync.jpg)


### 手動でコードを更新する

手動で即座に更新したい場合は、[GitHub のドキュメント](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork)を参照して、fork したプロジェクトを上流のコードと同期する方法を確認してください。

このプロジェクトをスターまたはウォッチしたり、作者をフォローすることで、新機能の更新通知をすぐに受け取ることができます。



## ページアクセスパスワードを設定する

> パスワードを設定すると、ユーザーは設定ページでアクセスコードを手動で入力しない限り、通常のチャットができず、未承認の状態であることを示すメッセージが表示されます。

> **警告**：パスワードの桁数は十分に長く設定してください。7桁以上が望ましいです。さもないと、[ブルートフォース攻撃を受ける可能性があります](https://github.com/Yidadaa/ChatGPT-Next-Web/issues/518)。

このプロジェクトは限られた権限管理機能を提供しています。Vercel プロジェクトのコントロールパネルで、環境変数ページに `CODE` という名前の環境変数を追加し、値をカンマで区切ったカスタムパスワードに設定してください：

```
code1,code2,code3
```

この環境変数を追加または変更した後、**プロジェクトを再デプロイ**して変更を有効にしてください。


## 環境変数

> 本プロジェクトのほとんどの設定は環境変数で行います。チュートリアル：[Vercel の環境変数を変更する方法](./docs/vercel-ja.md)。

### 基本設定

#### `OPENAI_API_KEY` （必須）

OpenAI の API キー。複数のキーをカンマで区切って設定でき、ランダムに選択されます。

#### `CODE` （オプション）

> デフォルト値: 空

アクセスパスワード。カンマで区切って複数設定可能。

**警告**：この項目を設定しないと、誰でもデプロイしたウェブサイトを利用でき、トークンが急速に消耗する可能性があるため、設定をお勧めします。

#### `PROXY_URL` (オプション)

> 例：`http://127.0.0.1:7890`

プロキシサーバーの URL。HTTP および SOCKS プロキシをサポートしています。

プロキシサーバーで認証が必要な場合は、以下の形式を使用できます：
```bash
http://username:password@127.0.0.1:7890
```

注意：この設定は Docker でデプロイする場合のみ有効です。

### モデル設定

#### `BASE_URL` （オプション）

> デフォルト値: `https://api.openai.com`

> 例: `http://your-openai-proxy.com`

OpenAI API のプロキシ URL。手動で OpenAI API のプロキシを設定している場合はこのオプションを設定してください。

> SSL 証明書の問題がある場合は、`BASE_URL` のプロトコルを http に設定してください。

#### `OPENAI_ORG_ID` （オプション）

> デフォルト値: 空

OpenAI の組織 ID を指定します。

#### `AZURE_URL` （オプション）

> 形式: https://{azure-resource-url}/openai/deployments/{deploy-name}

Azure のデプロイ URL。

#### `AZURE_API_KEY` （オプション）

Azure の API キー。

#### `AZURE_API_VERSION` （オプション）

Azure API バージョン。[Azure ドキュメント](https://learn.microsoft.com/en-us/azure/ai-services/openai/reference#chat-completions)で確認できます。

### その他のモデルプロバイダー

#### `GOOGLE_API_KEY` (オプション)

Google Gemini Pro API キー。

#### `GOOGLE_URL` (オプション)

> デフォルト値: "https://generativelanguage.googleapis.com/"

Google Gemini Pro API の URL。

#### `ANTHROPIC_API_KEY` (オプション)

Anthropic Claude API キー。

#### `ANTHROPIC_API_VERSION` (オプション)

Anthropic Claude API バージョン。

#### `ANTHROPIC_URL` (オプション)

> デフォルト値: "https://api.anthropic.com"

Anthropic Claude API の URL。

#### `BAIDU_API_KEY` (オプション)

Baidu API キー。

#### `BAIDU_SECRET_KEY` (オプション)

Baidu シークレットキー。

#### `BAIDU_URL` (オプション)

> デフォルト値: "https://aip.baidubce.com"

Baidu API の URL。

#### `BYTEDANCE_API_KEY` (オプション)

ByteDance API キー。

#### `BYTEDANCE_URL` (オプション)

> デフォルト値: "https://ark.cn-beijing.volces.com/api/"

ByteDance API の URL。

#### `ALIBABA_API_KEY` (オプション)

アリババ（千问）API キー。

#### `ALIBABA_URL` (オプション)

> デフォルト値: "https://dashscope.aliyuncs.com/api/"

アリババ（千问）API の URL。

#### `IFLYTEK_API_KEY` (オプション)

讯飞星火 API キー。

#### `IFLYTEK_API_SECRET` (オプション)

讯飞星火 API シークレット。

#### `IFLYTEK_URL` (オプション)

> デフォルト値: "https://spark-api-open.xf-yun.com"

讯飞星火 API の URL。

#### `MOONSHOT_API_KEY` (オプション)

Moonshot API キー。

#### `MOONSHOT_URL` (オプション)

> デフォルト値: "https://api.moonshot.cn"

Moonshot API の URL。

#### `XAI_API_KEY` (オプション)

XAI API キー。

#### `XAI_URL` (オプション)

> デフォルト値: "https://api.x.ai"

XAI API の URL。

#### `CHATGLM_API_KEY` (オプション)

ChatGLM API キー。

#### `CHATGLM_URL` (オプション)

> デフォルト値: "https://open.bigmodel.cn"

ChatGLM API の URL。

#### `TENCENT_SECRET_ID` (オプション)

Tencent Cloud シークレット ID。

#### `TENCENT_SECRET_KEY` (オプション)

Tencent Cloud シークレットキー。

#### `TENCENT_URL` (オプション)

> デフォルト値: "https://hunyuan.tencentcloudapi.com"

Tencent Cloud API の URL。

#### `CUSTOM_MODELS` （オプション）

> 例：`+llama,+claude-2,-gpt-3.5-turbo,gpt-4-1106-preview=gpt-4-turbo` は `llama, claude-2` をモデルリストに追加し、`gpt-3.5-turbo` を削除し、`gpt-4-1106-preview` のモデル名を `gpt-4-turbo` として表示します。

モデルリストを管理します。`+` でモデルを追加し、`-` でモデルを非表示にし、`モデル名=表示名` でモデルの表示名をカスタマイズし、カンマで区切ります。

`-all` ですべてのデフォルトモデルを無効にし、`+all` ですべてのデフォルトモデルを有効にします。

Azure モードでは、`modelName@Azure=deploymentName` 形式でモデル名とデプロイ名を設定できます。
> 例：`+gpt-3.5-turbo@Azure=gpt35` この設定でモデルリストに `gpt35(Azure)` のオプションが表示されます。
> Azure モデルのみを使用する場合は、`-all,+gpt-3.5-turbo@Azure=gpt35` を設定すると `gpt35(Azure)` のみが選択可能になります。

ByteDance モードでは、`modelName@bytedance=deploymentName` 形式でモデル名とデプロイ名を設定できます。
> 例: `+Doubao-lite-4k@bytedance=ep-xxxxx-xxx` この設定でモデルリストに `Doubao-lite-4k(ByteDance)` のオプションが表示されます。

#### `DEFAULT_MODEL` （オプション）

> デフォルト値: 空

デフォルトのモデルを変更します。

### 機能関連

#### `HIDE_USER_API_KEY` （オプション）

> デフォルト値: 空

ユーザーが API キーを入力できないようにしたい場合は、この環境変数を 1 に設定します。

#### `DISABLE_GPT4` （オプション）

> デフォルト値：空

ユーザーが GPT-4 を使用できないようにしたい場合は、この環境変数を 1 に設定します。これにより、モデルリストから GPT-4 関連のすべてのモデルが非表示になります。

#### `ENABLE_BALANCE_QUERY` （オプション）

> デフォルト値: 空

バランスクエリ機能を有効にしたい場合は、この環境変数を 1 に設定します。

#### `DISABLE_FAST_LINK` （オプション）

> デフォルト値: 空

リンクからのプリセット設定解析を無効にしたい場合は、この環境変数を 1 に設定します。

#### `CHAT_PAGE_SIZE` (オプション)

> デフォルト値: 15

1ページあたりのチャットメッセージ数。

#### `MAX_RENDER_MSG_COUNT` (オプション)

> デフォルト値: 45

チャットウィンドウに表示できるメッセージの最大数。

#### `DEFAULT_INPUT_TEMPLATE` （オプション）

> デフォルト値: "{{input}}"

『設定』の『ユーザー入力前処理』の初期設定に使用するテンプレート。

### TTS 関連

#### `DEFAULT_TTS_ENGINE` (オプション)

> デフォルト値: `OpenAI-TTS`

デフォルトの音声合成エンジン。

#### `DEFAULT_TTS_ENGINES` (オプション)

> デフォルト値: `["OpenAI-TTS", "Edge-TTS"]`

利用可能な音声合成エンジンのリスト。

#### `DEFAULT_TTS_MODEL` (オプション)

> デフォルト値: `tts-1`

デフォルトの OpenAI TTS モデル。

#### `DEFAULT_TTS_VOICE` (オプション)

> デフォルト値: `alloy`

デフォルトの音声。

#### `DEFAULT_TTS_MODELS` (オプション)

> デフォルト値: `["tts-1", "tts-1-hd"]`

利用可能な OpenAI TTS モデルのリスト。

#### `DEFAULT_TTS_VOICES` (オプション)

> デフォルト値: `["alloy", "echo", "fable", "onyx", "nova", "shimmer"]`

利用可能な音声のリスト。

### その他のサービス

#### `WHITE_WEBDAV_ENDPOINTS` (オプション)

アクセスを許可する WebDAV サービスのアドレスを追加する場合に使用します。フォーマット要件：
- 各アドレスは完全なエンドポイントである必要があります
> `https://xxxx/xxx`
- 複数のアドレスは `,` で接続します

#### `STABILITY_API_KEY` (オプション)

> デフォルト値: 空

Stability API キー。

#### `STABILITY_URL` (オプション)

> デフォルト値: "https://api.stability.ai"

カスタム Stability API の URL。

#### `CLOUDFLARE_ACCOUNT_ID` (オプション)

> デフォルト値: 空

Cloudflare アカウント ID。

#### `CLOUDFLARE_KV_NAMESPACE_ID` (オプション)

> デフォルト値: 空

Cloudflare KV ネームスペース ID。

#### `CLOUDFLARE_KV_API_KEY` (オプション)

> デフォルト値: 空

Cloudflare KV API キー。

#### `CLOUDFLARE_KV_TTL` (オプション)

> デフォルト値: 空

Cloudflare KV キャッシュの有効期限。

#### `GTM_ID` (オプション)

> デフォルト値: 空

Google Tag Manager ID。

#### `GA_ID` (オプション)

> デフォルト値: "G-89WN60ZK2E"

Google Analytics ID。設定されていない場合はデフォルト値を使用します。

#### `SAAS_CHAT_URL` (オプション)

> デフォルト値: "https://nextchat.dev/chat"

SaaS チャット URL。

#### `SAAS_CHAT_UTM_URL` (オプション)

> デフォルト値: "https://nextchat.dev/chat?utm=github"

UTM パラメータ付きの SaaS チャット URL。


## 開発

下のボタンをクリックして二次開発を開始してください：

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/Yidadaa/ChatGPT-Next-Web)

コードを書く前に、プロジェクトのルートディレクトリに `.env.local` ファイルを新規作成し、環境変数を記入します：

```
OPENAI_API_KEY=<your api key here>
```


### ローカル開発

1. Node.js 18 と Yarn をインストールします。具体的な方法は ChatGPT にお尋ねください。
2. `yarn install && yarn dev` を実行します。⚠️ 注意：このコマンドはローカル開発用であり、デプロイには使用しないでください。
3. ローカルでデプロイしたい場合は、`yarn install && yarn build && yarn start` コマンドを使用してください。プロセスを守るために pm2 を使用することもできます。詳細は ChatGPT にお尋ねください。


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


### ローカルデプロイ

コンソールで以下のコマンドを実行します：

```shell
bash <(curl -s https://raw.githubusercontent.com/Yidadaa/ChatGPT-Next-Web/main/scripts/setup.sh)
```

⚠️ 注意：インストール中に問題が発生した場合は、Docker を使用してデプロイしてください。


## 謝辞

### 寄付者

> 英語版をご覧ください。

### 貢献者

[プロジェクトの貢献者リストはこちら](https://github.com/Yidadaa/ChatGPT-Next-Web/graphs/contributors)

### 関連プロジェクト

- [one-api](https://github.com/songquanpeng/one-api): 一つのプラットフォームで大規模モデルのクォータ管理を提供し、市場に出回っているすべての主要な大規模言語モデルをサポートします。


## オープンソースライセンス

[MIT](https://opensource.org/license/mit/)
