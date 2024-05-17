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
        Error: {
          EndWithBackslash: "不能以「/」结尾",
          IllegalURL: "请输入一个完整可用的url",
        },
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
        Error: {
          EndWithBackslash: "Cannot end with '/'",
          IllegalURL: "Please enter a complete available url",
        },
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
        Error: {
          EndWithBackslash: "Não é possível terminar com '/'",
          IllegalURL: "Insira um URL completo disponível",
        },
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
        Error: {
          EndWithBackslash: "Nemôže končiť znakom „/“",
          IllegalURL: "Zadajte úplnú dostupnú adresu URL",
        },
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
        Error: {
          EndWithBackslash: "不能以「/」結尾",
          IllegalURL: "請輸入一個完整可用的url",
        },
      },

      ApiVerion: {
        Title: "API 版本 (claude api version)",
        SubTitle: "選擇一個特定的 API 版本輸入",
      },
    },
  },
  "en",
);
