import { SubmitKey } from "../store/app";

const jp = {
  WIP: "この機能は開発中です……",
  Error: {
    Unauthorized: "現在は未承認の状態です。設定ページで認証コードを入力してください。",
  },
  ChatItem: {
    ChatItemCount: (count: number) => `${count} 件の会話`,
  },
  Chat: {
    SubTitle: (count: number) => `ChatGPTとの ${count} 件の会話`,
    Actions: {
      ChatList: "メッセージリストを表示",
      CompressedHistory: "圧縮された履歴 Prompt を表示",
      Export: "チャット履歴をエクスポート",
      Copy: "コピー",
      Stop: "停止",
      Retry: "再試行",
    },
    Rename: "会話の名前を変更",
    Typing: "入力中...",
    Input: (submitKey: string) => {
      var inputHints = `メッセージを入力し、${submitKey} で送信`;
      if (submitKey === String(SubmitKey.Enter)) {
        inputHints += "、Shift + Enter で改行";
      }
      return inputHints;
    },
    Send: "送信",
  },
  Export: {
    Title: "チャット履歴を Markdown にエクスポート",
    Copy: "すべてコピー",
    Download: "ファイルをダウンロード",
  },
  Memory: {
    Title: "履歴メモリ",
    EmptyContent: "まだ記憶されていません",
    Copy: "すべてコピー",
  },
  Home: {
    NewChat: "新しいチャット",
    DeleteChat: "選択した会話を削除してもよろしいですか？",
  },
  Settings: {
    Title: "設定",
    SubTitle: "設定オプション",
    Actions: {
      ClearAll: "すべてのデータをクリア",
      ResetAll: "すべてのオプションをリセット",
      Close: "閉じる",
    },
    Lang: {
      Name: "言語",
      Options: {
        cn: "简体中文",
        en: "English",
        tw: "繁體中文",
        es: "Español",
        it: "Italiano",
        jp: "日本語",
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
      CheckUpdate: "更新をチェック",
      IsChecking: "更新を確認中...",
      FoundUpdate: (x: string) => `新しいバージョンが見つかりました：${x}`,
      GoToUpdate: "更新に進む",
    },
    SendKey: "送信キー",
    Theme: "テーマ",
    TightBorder: "コンパクトなボーダー",
    SendPreviewBubble: "送信プレビューバブル",
    Prompt: {
      Disable: {
        Title: "プロンプトワードの自動補完を無効にする",
        SubTitle: "入力ボックスの先頭で / を入力すると自動補完がトリガーされます",
      },
      List: "カスタムプロンプトワードリスト",
      ListCount: (builtin: number, custom: number) =>
        組み込み ${ builtin } 件、ユーザー定義 ${ custom } 件,
  Edit: "編集",
    },
HistoryCount: {
  Title: "履歴メッセージ数を添付",
    SubTitle: "各リクエストで添付する履歴メッセージ数",
    },
CompressThreshold: {
  Title: "履歴メッセージ長の圧縮しきい値",
    SubTitle: "未圧縮の履歴メッセージがこの値を超える場合、圧縮が行われます",
    },
Token: {
  Title: "APIキー",
    SubTitle: "独自のキーを使用してアクセス制限を回避",
      Placeholder: "OpenAI APIキー",
    },
Usage: {
  Title: "アカウント残高",
    SubTitle(used: any) {
    return 今月はすでに $${ used } を使用しています;
  },
  IsChecking: "確認中...",
    Check: "再確認",
      NoAccess: "APIキーを入力して残高を表示",
    },
AccessCode: {
  Title: "認証コード",
    SubTitle: "現在は未承認アクセス状態です",
      Placeholder: "認証コードを入力してください",
    },
Model: "モデル (model)",
  Temperature: {
  Title: "ランダム性 (temperature)",
    SubTitle: "値が大きいほど、返信がランダムになります",
    },
MaxTokens: {
  Title: "一回あたりの回答制限 (max_tokens)",
    SubTitle: "一度のインタラクションで使用する最大トークン数",
    },
PresencePenlty: {
  Title: "トピックの新鮮さ (presence_penalty)",
    SubTitle: "値が大きいほど、新しいトピックに広がる可能性があります",
    },
    },
Store: {
  DefaultTopic: "新しいチャット",
    BotHello: "何かお手伝いできることはありますか",
      Error: "エラーが発生しました。後でもう一度お試しください。",
        Prompt: {
    History: (content: string) =>
      "これはaiとユーザーの過去のチャット履歴の要約で、事前の情報として提供されます：" + content,
      Topic:
    "4〜5文字でこの文章の簡潔な主題を直接返し、説明や句読点や感嘆詞や余分なテキストは使わないでください。主題がない場合は、「雑談」と直接返してください。",
      Summarize:
    "あなたとユーザーの会話を簡潔に要約し、後続のコンテキストプロンプトとして使用するために、200字以内に抑えてください。",
    },
  ConfirmClearAll: "すべてのチャットと設定データをクリアしてもよろしいですか？",
    },
Copy: {
  Success: "クリップボードに書き込まれました",
    Failed: "コピーに失敗しました。クリップボードへのアクセス権限を許可してください。",
    },
Context: {
  Toast: (x: any) => 前置きのコンテキストが ${ x } 件設定されました,
    Edit: "前置きのコンテキストと履歴メモリ",
      Add: "新しい項目を追加",
    },
    };


export default jp;
