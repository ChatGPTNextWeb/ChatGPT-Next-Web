<div align="center">
<img src="./docs/images/icon.svg" alt="icon"/>

<h1 align="center">ChatGPT Next Web</h1>

[English](./README.md) / [简体中文](./README_CN.md) / 日本語

ワンクリックで、クロスプラットフォーム ChatGPT ウェブ UI が表示されます。

[![Web][Web-image]][web-url]
[![Windows][Windows-image]][download-url]
[![MacOS][MacOS-image]][download-url]
[![Linux][Linux-image]][download-url]

[Web App](https://chatgpt.nextweb.fun/) / [Desktop App](https://github.com/Yidadaa/ChatGPT-Next-Web/releases) / [Issues](https://github.com/Yidadaa/ChatGPT-Next-Web/issues) / [Discord](https://discord.gg/YCkeafCafC) / [コーヒーをおごる](https://www.buymeacoffee.com/yidadaa) / [QQ グループ](https://github.com/Yidadaa/ChatGPT-Next-Web/discussions/1724) / [開発者への報酬](https://user-images.githubusercontent.com/16968934/227772541-5bcd52d8-61b7-488c-a203-0330d8006e2b.jpg)

[web-url]: https://chatgpt.nextweb.fun
[download-url]: https://github.com/Yidadaa/ChatGPT-Next-Web/releases
[Web-image]: https://img.shields.io/badge/Web-PWA-orange?logo=microsoftedge
[Windows-image]: https://img.shields.io/badge/-Windows-blue?logo=windows
[MacOS-image]: https://img.shields.io/badge/-MacOS-black?logo=apple
[Linux-image]: https://img.shields.io/badge/-Linux-333?logo=ubuntu

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYidadaa%2FChatGPT-Next-Web&env=OPENAI_API_KEY&env=CODE&project-name=chatgpt-next-web&repository-name=ChatGPT-Next-Web)

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/Yidadaa/ChatGPT-Next-Web)

![cover](./docs/images/cover.png)

</div>

## 特徴

- Vercel で 1 分以内に**ワンクリックで無料デプロイ**。
- コンパクトなクライアント (~5MB) on Linux/Windows/MacOS、[今すぐダウンロード](https://github.com/Yidadaa/ChatGPT-Next-Web/releases)
- [RWKV-Runner](https://github.com/josStorer/RWKV-Runner) または [LocalAI](https://github.com/go-skynet/LocalAI) との使用をお勧めします
- プライバシー第一、すべてのデータはブラウザにローカルに保存されます
- マークダウンのサポート: LaTex、マーメイド、コードハイライトなど
- レスポンシブデザイン、ダークモード、PWA
- 最初の画面読み込み速度が速い(~100kb)、ストリーミングレスポンスをサポート
- v2 の新機能：プロンプトテンプレート（マスク）でチャットツールを作成、共有、デバッグ
- [awesome-chatgpt-prompts-zh](https://github.com/PlexPt/awesome-chatgpt-prompts-zh) と [awesome-chatgpt-prompts](https://github.com/f/awesome-chatgpt-prompts) による素晴らしいプロンプト
- トークンを保存しながら、長い会話をサポートするために自動的にチャット履歴を圧縮します
- 国際化： English、简体中文、繁体中文、日本語、Français、Español、Italiano、Türkçe、Deutsch、Tiếng Việt、Русский、Čeština、한국어

## ロードマップ

- [x] システムプロンプト: ユーザー定義のプロンプトをシステムプロンプトとして固定 [#138](https://github.com/Yidadaa/ChatGPT-Next-Web/issues/138)
- [x] ユーザープロンプト: ユーザはカスタムプロンプトを編集し、プロンプトリストに保存することができます。
- [x] プロンプトテンプレート: 事前に定義されたインコンテキストプロンプトで新しいチャットを作成 [#993](https://github.com/Yidadaa/ChatGPT-Next-Web/issues/993)
- [x] イメージとして共有、ShareGPT への共有 [#1741](https://github.com/Yidadaa/ChatGPT-Next-Web/pull/1741)
- [x] tauri を使ったデスクトップアプリ
- [x] セルフホストモデル: [RWKV-Runner](https://github.com/josStorer/RWKV-Runner) と完全に互換性があり、[LocalAI](https://github.com/go-skynet/LocalAI) のサーバーデプロイも可能です: llama/gpt4all/rwkv/vicuna/koala/gpt4all-j/cerebras/falcon/dolly など
- [ ] プラグイン: ネットワーク検索、計算機、その他のAPIなどをサポート [#165](https://github.com/Yidadaa/ChatGPT-Next-Web/issues/165)

## 新機能

- 🚀 v2.0 がリリースされ、プロンプト・テンプレートが作成できるようになりました！こちらをお読みください: [ChatGPT プロンプトエンジニアリング Tips: ゼロ、一発、数発プロンプト](https://www.allabtai.com/prompt-engineering-tips-zero-one-and-few-shot-prompting/)。
- 💡 このプロジェクトをいつでもどこでも簡単に使いたいですか？このデスクトッププラグインをお試しください: https://github.com/mushan0x0/AI0x0.com
- 🚀 v2.7 では、会話を画像として共有したり、ShareGPT に共有することができます！
- 🚀 v2.8 全てのプラットフォームで動作するクライアントができました！

## 始める

> [簡体字中国語 > 始め方](./README_CN.md#开始使用)

1. [OpenAI API Key](https://platform.openai.com/account/api-keys) を取得する;
2. クリック
   [![Vercel でデプロイ](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYidadaa%2FChatGPT-Next-Web&env=OPENAI_API_KEY&env=CODE&project-name=chatgpt-next-web&repository-name=ChatGPT-Next-Web)をクリックします。`CODE` はあなたのページのパスワードであることを忘れないでください;
3. お楽しみください :)

## FAQ

[簡体字中国語 > よくある質問](./docs/faq-cn.md)

[English > FAQ](./docs/faq-en.md)

## 更新を継続する

> [簡体字中国語 > コードを最新の状態に保つ方法](./README_CN.md#保持更新)

上記の手順に沿ってワンクリックで自分のプロジェクトをデプロイした場合、"Updates Available" が常に表示される問題に遭遇するかもしれません。これは、Vercel がこのプロジェクトをフォークする代わりに、デフォルトで新しいプロジェクトを作成するため、アップデートを正しく検出できないためです。

以下の手順で再デプロイすることをお勧めします:

- 元のリポジトリを削除してください;
- ページの右上にあるフォークボタンを使って、このプロジェクトをフォークする;
- Vercel を選択し、再度デプロイする。[詳しいチュートリアルを参照](./docs/vercel-cn.md)。

### 自動アップデートを有効にする

> Upstream Sync の実行に失敗した場合は、手動で一度フォークしてください。

プロジェクトをフォークした後、GitHub の制限により、フォークしたプロジェクトの Actions ページで Workflows と Upstream Sync Action を手動で有効にする必要があります。有効にすると、1 時間ごとに自動更新がスケジュールされます:

![Automatic Updates](./docs/images/enable-actions.jpg)

![Enable Automatic Updates](./docs/images/enable-actions-sync.jpg)

### 手動でコードを更新する

すぐに更新したい場合は、[GitHub ドキュメント](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork) をチェックして、フォークしたプロジェクトを上流のコードと同期させる方法を学んでください。

このプロジェクトにスターをつけたり、ウォッチしたり、作者をフォローすることで、リリースの通知を受け取ることができます。

## アクセスパスワード

> [簡体字中国語 > アクセスパスワードを増やす方法](./README_CN.md#配置页面访问密码)

このプロジェクトではアクセス制御を制限しています。vercel の環境変数のページに `CODE` という環境変数を追加してください。その値は次のようにカンマで区切られたパスワードでなければなりません:

```
code1,code2,code3
```

この環境変数を追加または変更した後は、変更を有効にするためにプロジェクトを再デプロイしてください。

## 環境変数

> [簡体字中国語 > API キー、アクセスパスワード、インターフェイスプロキシ設定方法](./README_CN.md#环境变量)

### `OPENAI_API_KEY` (必須)

OpenAI の api キー。

### `CODE` (オプション)

カンマで区切られたアクセスパスワード。

### `BASE_URL` (オプション)

> デフォルト: `https://api.openai.com`

> 例: `http://your-openai-proxy.com`

OpenAI api のリクエストベースの url をオーバーライドします。

### `OPENAI_ORG_ID` (オプション)

OpenAI の組織 ID を指定します。

### `HIDE_USER_API_KEY` (オプション)

> デフォルト: 空

ユーザーに自分の API キーを入力させたくない場合は、この値を 1 に設定する。

### `DISABLE_GPT4` (オプション)

> デフォルト: 空

ユーザーに GPT-4 を使用させたくない場合は、この値を 1 に設定する。

### `HIDE_BALANCE_QUERY` (オプション)

> デフォルト: 空

ユーザーに残高を照会させたくない場合は、この値を 1 に設定する。

## 必要条件

NodeJS >= 18、Docker >= 20

## Development

> [簡体字中国語 > 二次開発の進め方](./README_CN.md#开发)

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/Yidadaa/ChatGPT-Next-Web)

開発を始める前に、プロジェクトのルートに新しい `.env.local` ファイルを作成し、そこに api キーを置く必要があります:

```
OPENAI_API_KEY=<your api key here>

# OpenAI サービスにアクセスできない場合は、この BASE_URL を使用してください
BASE_URL=https://chatgpt1.nextweb.fun/api/proxy
```

### ローカルデプロイ

```shell
# 1. nodejs と yarn をまずインストールする
# 2. `.env.local` にローカルの env vars を設定する
# 3. 実行
yarn install
yarn dev
```

## デプロイ

> [簡体字中国語 > プライベートサーバーへのデプロイ方法](./README_CN.md#部署)

### Docker (推奨)

```shell
docker pull yidadaa/chatgpt-next-web

docker run -d -p 3000:3000 \
   -e OPENAI_API_KEY="sk-xxxx" \
   -e CODE="your-password" \
   yidadaa/chatgpt-next-web
```

プロキシの後ろでサービスを開始することができる:

```shell
docker run -d -p 3000:3000 \
   -e OPENAI_API_KEY="sk-xxxx" \
   -e CODE="your-password" \
   -e PROXY_URL="http://localhost:7890" \
   yidadaa/chatgpt-next-web
```

プロキシにパスワードが必要な場合:

```shell
-e PROXY_URL="http://127.0.0.1:7890 user pass"
```

### シェル

```shell
bash <(curl -s https://raw.githubusercontent.com/Yidadaa/ChatGPT-Next-Web/main/scripts/setup.sh)
```

## スクリーンショット

![Settings](./docs/images/settings.png)

![More](./docs/images/more.png)

## 翻訳

新しい翻訳を追加したい場合は、この[ドキュメント](./docs/translation.md)をお読みください。

## 寄付

[コーヒーをおごる](https://www.buymeacoffee.com/yidadaa)

## スペシャルサンクス

### スポンサー

> 寄付金額が 100 元以上のユーザーのみリストアップしています

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
[@yankunsong](https://github.com/yankunsong)
[@ypwhs](https://github.com/ypwhs)
[@fxxxchao](https://github.com/fxxxchao)
[@hotic](https://github.com/hotic)
[@WingCH](https://github.com/WingCH)
[@jtung4](https://github.com/jtung4)
[@micozhu](https://github.com/micozhu)
[@jhansion](https://github.com/jhansion)
[@Sha1rholder](https://github.com/Sha1rholder)
[@AnsonHyq](https://github.com/AnsonHyq)
[@synwith](https://github.com/synwith)
[@piksonGit](https://github.com/piksonGit)

### コントリビューター

[コントリビューター達](https://github.com/Yidadaa/ChatGPT-Next-Web/graphs/contributors)

## ライセンス

[MIT](https://opensource.org/license/mit/)
