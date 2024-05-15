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
        SubTitle: "使用自定义 Azure Key 绕过密码访问限制",
        Placeholder: "Azure API Key",
      },

      Endpoint: {
        Title: "接口地址",
        SubTitle: "样例：",
      },

      ApiVerion: {
        Title: "接口版本 (azure api version)",
        SubTitle: "选择指定的部分版本",
      },
    },
    en: {
      ApiKey: {
        Title: "Azure Api Key",
        SubTitle: "Check your api key from Azure console",
        Placeholder: "Azure Api Key",
      },

      Endpoint: {
        Title: "Azure Endpoint",
        SubTitle: "Example: ",
      },

      ApiVerion: {
        Title: "Azure Api Version",
        SubTitle: "Check your api version from azure console",
      },
    },
    pt: {
      ApiKey: {
        Title: "Chave API Azure",
        SubTitle: "Verifique sua chave API do console Azure",
        Placeholder: "Chave API Azure",
      },

      Endpoint: {
        Title: "Endpoint Azure",
        SubTitle: "Exemplo: ",
      },

      ApiVerion: {
        Title: "Versão API Azure",
        SubTitle: "Verifique sua versão API do console Azure",
      },
    },
    sk: {
      ApiKey: {
        Title: "API kľúč Azure",
        SubTitle: "Skontrolujte svoj API kľúč v Azure konzole",
        Placeholder: "API kľúč Azure",
      },

      Endpoint: {
        Title: "Koncový bod Azure",
        SubTitle: "Príklad: ",
      },

      ApiVerion: {
        Title: "Verzia API Azure",
        SubTitle: "Skontrolujte svoju verziu API v Azure konzole",
      },
    },
    tw: {
      ApiKey: {
        Title: "介面金鑰",
        SubTitle: "使用自定義 Azure Key 繞過密碼存取限制",
        Placeholder: "Azure API Key",
      },

      Endpoint: {
        Title: "介面(Endpoint) 地址",
        SubTitle: "樣例：",
      },

      ApiVerion: {
        Title: "介面版本 (azure api version)",
        SubTitle: "選擇指定的部分版本",
      },
    },
  },
  "en",
);
