import { SubmitKey } from "../store/app";
import type { LocaleType } from "./index";

const tw: LocaleType = {
  WIP: "該功能仍在開發中……",
  Error: {
    Unauthorized: "目前您的狀態是未授權，請前往設定頁面輸入授權碼。",
  },
  ChatItem: {
    ChatItemCount: (count: number) => `${count} 條對話`,
  },
  Chat: {
    SubTitle: (count: number) => `您已經與 ChatGPT 進行了 ${count} 條對話`,
    Actions: {
      ChatList: "查看消息列表",
      CompressedHistory: "查看壓縮後的歷史 Prompt",
      Export: "匯出聊天紀錄",
      Copy: "複製",
      Stop: "停止",
      Retry: "重試",
    },
    Rename: "重命名對話",
    Typing: "正在輸入…",
    Input: (submitKey: string) => {
      var inputHints = `輸入訊息後，按下 ${submitKey} 鍵即可發送`;
      if (submitKey === String(SubmitKey.Enter)) {
        inputHints += "，Shift + Enter 鍵換行";
      }
      return inputHints;
    },
    Send: "發送",
  },
  Export: {
    Title: "匯出聊天記錄為 Markdown",
    Copy: "複製全部",
    Download: "下載檔案",
    MessageFromYou: "來自你的訊息",
    MessageFromChatGPT: "來自 ChatGPT 的訊息",
  },
  Memory: {
    Title: "上下文記憶 Prompt",
    EmptyContent: "尚未記憶",
    Copy: "複製全部",
    Send: "發送記憶",
    Reset: "重置對話",
    ResetConfirm: "重置後將清空當前對話記錄以及歷史記憶，確認重置？",
  },
  Home: {
    NewChat: "新的對話",
    DeleteChat: "確定要刪除選取的對話嗎？",
    DeleteToast: "已刪除對話",
    Revert: "撤銷",
  },
  Settings: {
    Title: "設定",
    SubTitle: "設定選項",
    Actions: {
      ClearAll: "清除所有數據",
      ResetAll: "重置所有設定",
      Close: "關閉",
      ConfirmResetAll: {
        Confirm: "Are you sure you want to reset all configurations?",
      },
      ConfirmClearAll: {
        Confirm: "Are you sure you want to reset all chat?",
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
      },
    },
    Avatar: "大頭貼",
    FontSize: {
      Title: "字型大小",
      SubTitle: "聊天內容的字型大小",
    },
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
    SendPreviewBubble: "發送預覽氣泡",
    Prompt: {
      Disable: {
        Title: "停用提示詞自動補全",
        SubTitle: "在輸入框開頭輸入 / 即可觸發自動補全",
      },
      List: "自定義提示詞列表",
      ListCount: (builtin: number, custom: number) =>
        `內置 ${builtin} 條，用戶定義 ${custom} 條`,
      Edit: "編輯",
    },
    HistoryCount: {
      Title: "附帶歷史訊息數",
      SubTitle: "每次請求附帶的歷史訊息數",
    },
    CompressThreshold: {
      Title: "歷史訊息長度壓縮閾值",
      SubTitle: "當未壓縮的歷史訊息超過該值時，將進行壓縮",
    },
    Token: {
      Title: "API Key",
      SubTitle: "使用自己的 Key 可規避授權訪問限制",
      Placeholder: "OpenAI API Key",
    },
    Usage: {
      Title: "帳戶餘額",
      SubTitle(used: any, total: any) {
        return `本月已使用 $${used}，订阅总额 $${total}`;
      },
      IsChecking: "正在檢查…",
      Check: "重新檢查",
      NoAccess: "輸入API Key查看餘額",
    },
    AccessCode: {
      Title: "授權碼",
      SubTitle: "現在是未授權訪問狀態",
      Placeholder: "請輸入授權碼",
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
      Title: "話題新穎度 (presence_penalty)",
      SubTitle: "值越大，越有可能擴展到新話題",
    },
  },
  Store: {
    DefaultTopic: "新的對話",
    BotHello: "請問需要我的協助嗎？",
    Error: "出錯了，請稍後再嘗試",
    Prompt: {
      History: (content: string) =>
        "這是 AI 與用戶的歷史聊天總結，作為前情提要：" + content,
      Topic: "Summarise the conversation in a short and concise eye-catching title that instantly conveys the main topic. Use as few words as possible. Use the language used in the enquiry, e.g. use English for English enquiry, use zh-hant for traditional chinese enquiry. Don't use quotation marks at the beginning and the end.",
      Summarize:
        "Summarise the conversation in at most 250 tokens for continuing the conversation in future. Use the language used in the conversation, e.g. use English for English conversation, use zh-hant for traditional chinese conversation.",
    },
    ConfirmClearAll: "確認清除所有對話、設定數據？",
  },
  Copy: {
    Success: "已複製到剪貼簿中",
    Failed: "複製失敗，請賦予剪貼簿權限",
  },
  Context: {
    Toast: (x: any) => `已設置 ${x} 條前置上下文`,
    Edit: "前置上下文和歷史記憶",
    Add: "新增壹條",
  },
};

export default tw;
