import { getLocaleText } from "../../common/locale";

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
      };
    };
  },
  "en"
>(
  {
    cn: {
      ApiKey: {
        Title: "API Key",
        SubTitle: "使用自定义 OpenAI Key 绕过密码访问限制",
        Placeholder: "OpenAI API Key",
      },

      Endpoint: {
        Title: "接口地址",
        SubTitle: "除默认地址外，必须包含 http(s)://",
        Error: {
          EndWithBackslash: "不能以「/」结尾",
        },
      },
    },
    en: {
      ApiKey: {
        Title: "OpenAI API Key",
        SubTitle: "User custom OpenAI Api Key",
        Placeholder: "sk-xxx",
      },

      Endpoint: {
        Title: "OpenAI Endpoint",
        SubTitle: "Must starts with http(s):// or use /api/openai as default",
        Error: {
          EndWithBackslash: "Cannot end with '/'",
        },
      },
    },
    pt: {
      ApiKey: {
        Title: "Chave API OpenAI",
        SubTitle: "Usar Chave API OpenAI personalizada",
        Placeholder: "sk-xxx",
      },

      Endpoint: {
        Title: "Endpoint OpenAI",
        SubTitle: "Deve começar com http(s):// ou usar /api/openai como padrão",
        Error: {
          EndWithBackslash: "Não é possível terminar com '/'",
        },
      },
    },
    sk: {
      ApiKey: {
        Title: "API kľúč OpenAI",
        SubTitle: "Použiť vlastný API kľúč OpenAI",
        Placeholder: "sk-xxx",
      },

      Endpoint: {
        Title: "Koncový bod OpenAI",
        SubTitle:
          "Musí začínať http(s):// alebo použiť /api/openai ako predvolený",
        Error: {
          EndWithBackslash: "Nemôže končiť znakom „/“",
        },
      },
    },
    tw: {
      ApiKey: {
        Title: "API Key",
        SubTitle: "使用自定義 OpenAI Key 繞過密碼存取限制",
        Placeholder: "OpenAI API Key",
      },

      Endpoint: {
        Title: "介面(Endpoint) 地址",
        SubTitle: "除預設地址外，必須包含 http(s)://",
        Error: {
          EndWithBackslash: "不能以「/」結尾",
        },
      },
    },
  },
  "en",
);
