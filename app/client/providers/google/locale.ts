import { getLocaleText } from "../../common";

export default getLocaleText<
  {
    ApiKey: {
      Title: string;
      SubTitle: string;
      Placeholder: string;
    };
    Endpoint: {
      Title: string;
      SubTitle: string;
      Error: {
        EndWithBackslash: string;
        IllegalURL: string;
      };
    };
    ApiVersion: {
      Title: string;
      SubTitle: string;
    };
  },
  "en"
>(
  {
    cn: {
      ApiKey: {
        Title: "API 密钥",
        SubTitle: "从 Google AI 获取您的 API 密钥",
        Placeholder: "输入您的 Google AI Studio API 密钥",
      },

      Endpoint: {
        Title: "终端地址",
        SubTitle: "示例：",
        Error: {
          EndWithBackslash: "不能以「/」结尾",
          IllegalURL: "请输入一个完整可用的url",
        },
      },

      ApiVersion: {
        Title: "API 版本（仅适用于 gemini-pro）",
        SubTitle: "选择一个特定的 API 版本",
      },
    },
    en: {
      ApiKey: {
        Title: "API Key",
        SubTitle: "Obtain your API Key from Google AI",
        Placeholder: "Enter your Google AI Studio API Key",
      },

      Endpoint: {
        Title: "Endpoint Address",
        SubTitle: "Example:",
        Error: {
          EndWithBackslash: "Cannot end with '/'",
          IllegalURL: "Please enter a complete available url",
        },
      },

      ApiVersion: {
        Title: "API Version (specific to gemini-pro)",
        SubTitle: "Select a specific API version",
      },
    },
    sk: {
      ApiKey: {
        Title: "API kľúč",
        SubTitle:
          "Obísť obmedzenia prístupu heslom pomocou vlastného API kľúča Google AI Studio",
        Placeholder: "API kľúč Google AI Studio",
      },

      Endpoint: {
        Title: "Adresa koncového bodu",
        SubTitle: "Príklad:",
        Error: {
          EndWithBackslash: "Nemôže končiť znakom „/“",
          IllegalURL: "Zadajte úplnú dostupnú adresu URL",
        },
      },

      ApiVersion: {
        Title: "Verzia API (gemini-pro verzia API)",
        SubTitle: "Vyberte špecifickú verziu časti",
      },
    },
    tw: {
      ApiKey: {
        Title: "API 金鑰",
        SubTitle: "從 Google AI 取得您的 API 金鑰",
        Placeholder: "輸入您的 Google AI Studio API 金鑰",
      },

      Endpoint: {
        Title: "終端地址",
        SubTitle: "範例：",
        Error: {
          EndWithBackslash: "不能以「/」結尾",
          IllegalURL: "請輸入一個完整可用的url",
        },
      },

      ApiVersion: {
        Title: "API 版本（僅適用於 gemini-pro）",
        SubTitle: "選擇一個特定的 API 版本",
      },
    },
  },
  "en",
);
