# UpStashを使用してチャットログを同期する
## 事前準備
- GitHubアカウント
- 自分自身でChatGPT-Next-Webのサーバーをセットアップしていること
- [UpStash](https://upstash.com)

## 始める
1. UpStashアカウントを登録します。
2. データベースを作成します。

    ![登録とログイン](./images/upstash-1.png)

    ![データベースの作成](./images/upstash-2.png)

    ![サーバーの選択](./images/upstash-3.png)

3. REST APIを見つけ、UPSTASH_REDIS_REST_URLとUPSTASH_REDIS_REST_TOKENをコピーします（⚠重要⚠：トークンを共有しないでください！）

   ![コピー](./images/upstash-4.png)

4. UPSTASH_REDIS_REST_URLとUPSTASH_REDIS_REST_TOKENを同期設定にコピーし、次に「可用性を確認」をクリックします。

    ![同期1](./images/upstash-5.png)

    すべてが正常であれば、このステップは成功です。

    ![同期可用性チェックが完了しました](./images/upstash-6.png)

5. 成功！

   ![お疲れ様でした~！](./images/upstash-7.png)