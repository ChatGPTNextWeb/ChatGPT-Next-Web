import { getLocaleText } from "../../core/locale";

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
    };
    ApiVerion: {
      Title: string;
      SubTitle: string;
    };
  },
  "en"
>(
  {
    cn: {
      ApiKey: {
        Title: "接口密钥",
        SubTitle: "使用自定义 Anthropic Key 绕过密码访问限制",
        Placeholder: "Anthropic API Key",
      },

      Endpoint: {
        Title: "接口地址",
        SubTitle: "样例：",
      },

      ApiVerion: {
        Title: "接口版本 (claude api version)",
        SubTitle: "选择一个特定的 API 版本输入",
      },
    },
    en: {
      ApiKey: {
        Title: "Anthropic API Key",
        SubTitle:
          "Use a custom Anthropic Key to bypass password access restrictions",
        Placeholder: "Anthropic API Key",
      },

      Endpoint: {
        Title: "Endpoint Address",
        SubTitle: "Example:",
      },

      ApiVerion: {
        Title: "API Version (claude api version)",
        SubTitle: "Select and input a specific API version",
      },
    },
    pt: {
      ApiKey: {
        Title: "Chave API Anthropic",
        SubTitle: "Verifique sua chave API do console Anthropic",
        Placeholder: "Chave API Anthropic",
      },

      Endpoint: {
        Title: "Endpoint Address",
        SubTitle: "Exemplo: ",
      },

      ApiVerion: {
        Title: "Versão API (Versão api claude)",
        SubTitle: "Verifique sua versão API do console Anthropic",
      },
    },
    sk: {
      ApiKey: {
        Title: "API kľúč Anthropic",
        SubTitle: "Skontrolujte svoj API kľúč v Anthropic konzole",
        Placeholder: "API kľúč Anthropic",
      },

      Endpoint: {
        Title: "Adresa koncového bodu",
        SubTitle: "Príklad:",
      },

      ApiVerion: {
        Title: "Verzia API (claude verzia API)",
        SubTitle: "Vyberte špecifickú verziu časti",
      },
    },
    tw: {
      ApiKey: {
        Title: "API 金鑰",
        SubTitle: "從 Anthropic AI 取得您的 API 金鑰",
        Placeholder: "Anthropic API Key",
      },

      Endpoint: {
        Title: "終端地址",
        SubTitle: "範例：",
      },

      ApiVerion: {
        Title: "API 版本 (claude api version)",
        SubTitle: "選擇一個特定的 API 版本輸入",
      },
    },
  },
  "en",
);
