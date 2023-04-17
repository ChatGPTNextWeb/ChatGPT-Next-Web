import { SubmitKey } from "../store/app";

const jp = {
  WIP: "この機能は開発中です……",
  Error: {
    Unauthorized:
      "現在は未承認状態です。左下の設定ボタンをクリックし、アクセスパスワードを入力してください。",
  },
  ChatItem: {
    ChatItemCount: (count: number) => `${count} 通のチャット`,
  },
  Chat: {
    SubTitle: (count: number) => `ChatGPTとの ${count} 通のチャット`,
    Actions: {
      ChatList: "メッセージリストを表示",
      CompressedHistory: "圧縮された履歴プロンプトを表示",
      Export: "チャット履歴をエクスポート",
      Copy: "コピー",
      Stop: "停止",
      Retry: "リトライ",
      Delete: "Delete",
    },
    Rename: "チャットの名前を変更",
    Typing: "入力中…",
    Input: (submitKey: string) => {
      var inputHints = `${submitKey} で送信`;
      if (submitKey === String(SubmitKey.Enter)) {
        inputHints += "，Shift + Enter で改行";
      }
      return inputHints + "，/ で自動補完をトリガー";
    },
    Send: "送信",
  },
  Export: {
    Title: "チャット履歴をMarkdown形式でエクスポート",
    Copy: "すべてコピー",
    Download: "ファイルをダウンロード",
    MessageFromYou: "あなたからのメッセージ",
    MessageFromChatGPT: "ChatGPTからのメッセージ",
  },
  Memory: {
    Title: "履歴メモリ",
    EmptyContent: "まだ記憶されていません",
    Send: "メモリを送信",
    Copy: "メモリをコピー",
    Reset: "チャットをリセット",
    ResetConfirm:
      "リセット後、現在のチャット履歴と過去のメモリがクリアされます。リセットしてもよろしいですか？",
  },
  Home: {
    NewChat: "新しいチャット",
    DeleteChat: "選択したチャットを削除してもよろしいですか？",
    DeleteToast: "チャットが削除されました",
    Revert: "元に戻す",
  },
  Settings: {
    Title: "設定",
    SubTitle: "設定オプション",
    Actions: {
      ClearAll: "すべてのデータをクリア",
      ResetAll: "すべてのオプションをリセット",
      Close: "閉じる",
      ConfirmResetAll: {
        Confirm: "すべての設定をリセットしてもよろしいですか？",
      },
      ConfirmClearAll: {
        Confirm: "すべてのチャットをリセットしてもよろしいですか？",
      },
    },
    Lang: {
      Name: "Language",
      Options: {
        cn: "简体中文",
        en: "English",
        tw: "繁體中文",
        es: "Español",
        it: "Italiano",
        tr: "Türkçe",
        jp: "日本語",
        de: "Deutsch",
      },
    },
    Avatar: "アバター",
    FontSize: {
      Title: "フォントサイズ",
      SubTitle: "チャット内容のフォントサイズ",
    },

    Update: {
      Version: (x: string) => `現在のバージョン：${x}`,
      IsLatest: "最新バージョンです",
      CheckUpdate: "アップデートを確認",
      IsChecking: "アップデートを確認しています...",
      FoundUpdate: (x: string) => `新しいバージョンが見つかりました：${x}`,
      GoToUpdate: "更新する",
    },
    SendKey: "送信キー",
    Theme: "テーマ",
    TightBorder: "ボーダーレスモード",
    SendPreviewBubble: "プレビューバブルの送信",
    Prompt: {
      Disable: {
        Title: "プロンプトの自動補完を無効にする",
        SubTitle:
          "入力フィールドの先頭に / を入力すると、自動補完がトリガーされます。",
      },
      List: "カスタムプロンプトリスト",
      ListCount: (builtin: number, custom: number) =>
        `組み込み ${builtin} 件、ユーザー定義 ${custom} 件`,
      Edit: "編集",
      Modal: {
        Title: "提示词列表",
        Add: "增加一条",
        Search: "搜尋提示詞",
      },
    },
    HistoryCount: {
      Title: "履歴メッセージ数を添付",
      SubTitle: "リクエストごとに添付する履歴メッセージ数",
    },
    CompressThreshold: {
      Title: "履歴メッセージの長さ圧縮しきい値",
      SubTitle:
        "圧縮されていない履歴メッセージがこの値を超えた場合、圧縮が行われます。",
    },
    Token: {
      Title: "APIキー",
      SubTitle: "自分のキーを使用してパスワードアクセス制限を迂回する",
      Placeholder: "OpenAI APIキー",
    },
    Usage: {
      Title: "残高照会",
      SubTitle(used: any, total: any) {
        return `今月は $${used} を使用しました。総額は $${total} です。`;
      },
      IsChecking: "確認中...",
      Check: "再確認",
      NoAccess: "APIキーまたはアクセスパスワードを入力して残高を表示",
    },
    AccessCode: {
      Title: "アクセスパスワード",
      SubTitle: "暗号化アクセスが有効になっています",
      Placeholder: "アクセスパスワードを入力してください",
    },
    Model: "モデル (model)",
    Temperature: {
      Title: "ランダム性 (temperature)",
      SubTitle:
        "値が大きいほど、回答がランダムになります。1以上の値には文字化けが含まれる可能性があります。",
    },
    MaxTokens: {
      Title: "シングルレスポンス制限 (max_tokens)",
      SubTitle: "1回のインタラクションで使用される最大トークン数",
    },
    PresencePenlty: {
      Title: "トピックの新鮮度 (presence_penalty)",
      SubTitle: "値が大きいほど、新しいトピックへの展開が可能になります。",
    },
  },
  Store: {
    DefaultTopic: "新しいチャット",
    BotHello: "何かお手伝いできることはありますか",
    Error: "エラーが発生しました。しばらくしてからやり直してください。",
    Prompt: {
      History: (content: string) =>
        "これは、AI とユーザの過去のチャットを要約した前提となるストーリーです：" +
        content,
      Topic:
        "4～5文字でこの文章の簡潔な主題を返してください。説明、句読点、感嘆詞、余分なテキストは無しで。もし主題がない場合は、「おしゃべり」を返してください",
      Summarize:
        "あなたとユーザの会話を簡潔にまとめて、後続のコンテキストプロンプトとして使ってください。200字以内に抑えてください。",
    },
    ConfirmClearAll:
      "すべてのチャット、設定データをクリアしてもよろしいですか？",
  },
  Copy: {
    Success: "クリップボードに書き込みました",
    Failed: "コピーに失敗しました。クリップボード許可を与えてください。",
  },
  Context: {
    Toast: (x: any) => `前置コンテキストが ${x} 件設定されました`,
    Edit: "前置コンテキストと履歴メモリ",
    Add: "新規追加",
  },
};

export default jp;
