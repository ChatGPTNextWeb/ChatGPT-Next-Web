import type { LocaleType } from "./index";

const tw: LocaleType = {
  WIP: "該功能仍在開發中……",
  Error: {
    Unauthorized: "現在是未授權狀態，請在設置頁填寫授權碼。",
  },
  ChatItem: {
    ChatItemCount: (count: number) => `${count} 條對話`,
  },
  Chat: {
    SubTitle: (count: number) => `與 ChatGPT 的 ${count} 條對話`,
    Actions: {
      ChatList: "查看消息列表",
      CompressedHistory: "查看壓縮後的歷史 Prompt",
      Export: "導出聊天記錄",
      Copy: "複製",
      Stop: "停止",
      Retry: "重試",
    },
    Typing: "正在輸入…",
    Input: (submitKey: string) => `輸入消息，${submitKey} 發送`,
    Send: "發送",
  },
  Export: {
    Title: "導出聊天記錄為 Markdown",
    Copy: "全部複製",
    Download: "下載文件",
  },
  Memory: {
    Title: "上下文記憶 Prompt",
    EmptyContent: "尚未記憶",
    Copy: "全部複製",
  },
  Home: {
    NewChat: "新的聊天",
    DeleteChat: "確認刪除選中的對話？",
  },
  Settings: {
    Title: "設置",
    SubTitle: "設置選項",
    Actions: {
      ClearAll: "清除所有數據",
      ResetAll: "重置所有選項",
      Close: "關閉",
    },
    Lang: {
      Name: "語言",
      Options: {
        cn: "简体中文",
        en: "English",
        tw: "繁體中文",
      },
    },
    Avatar: "頭像",
    Update: {
      Version: (x: string) => `當前版本：${x}`,
      IsLatest: "已是最新版本",
      CheckUpdate: "檢查更新",
      IsChecking: "正在檢查更新...",
      FoundUpdate: (x: string) => `發現新版本：${x}`,
      GoToUpdate: "前往更新",
    },
    SendKey: "發送鍵",
    Theme: "主題",
    TightBorder: "緊湊邊框",
    Prompt: {
      Disable: {
        Title: "禁用提示詞自動補全",
        SubTitle: "禁用後將無法自動根據輸入補全",
      },
      List: "自定義提示詞列表",
      ListCount: (builtin: number, custom: number) =>
        `內置 ${builtin} 條，用戶定義 ${custom} 條`,
      Edit: "編輯",
    },
    HistoryCount: {
      Title: "附帶歷史消息數",
      SubTitle: "每次請求攜帶的歷史消息數",
    },
    CompressThreshold: {
      Title: "歷史消息長度壓縮閾值",
      SubTitle: "當未壓縮的歷史消息超過該值時，將進行壓縮",
    },
    Token: {
      Title: "API Key",
      SubTitle: "使用自己的 Key 可繞過受控訪問限制",
      Placeholder: "OpenAI API Key",
    },
    AccessCode: {
      Title: "訪問碼",
      SubTitle: "現在是受控訪問狀態",
      Placeholder: "請輸入訪問碼",
    },
    Model: "模型 (model)",
    Temperature: {
      Title: "隨機性 (temperature)",
      SubTitle: "值越大，回復越隨機",
    },
    MaxTokens: {
      Title: "單次回復限制 (max_tokens)",
      SubTitle: "單次交互所用的最大 Token 數",
    },
    PresencePenlty: {
      Title: "話題新鮮度 (presence_penalty)",
      SubTitle: "值越大，越有可能擴展到新話題",
    },
  },
  Store: {
    DefaultTopic: "新的聊天",
    BotHello: "有什麼可以幫你的嗎",
    Error: "出錯了，稍後重試吧",
    Prompt: {
      History: (content: string) =>
        "這是 ai 和用戶的歷史聊天總結作為前情提要：" + content,
      Topic:
        "直接返回這句話的簡要主題，不要解釋，如果沒有主題，請直接返回「閒聊」",
      Summarize:
        "簡要總結一下你和用戶的對話，用作後續的上下文提示 prompt，控制在 50 字以內",
    },
    ConfirmClearAll: "確認清除所有聊天、設置數據？",
  },
  Copy: {
    Success: "已寫入剪切板",
    Failed: "複製失敗，請賦予剪切板權限",
  },
};

export default tw;
