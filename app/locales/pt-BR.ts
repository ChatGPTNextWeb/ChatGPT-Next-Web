import { getClientConfig } from "../config/client";
import { SubmitKey } from "../store/config";
import { PartialLocaleType } from "./index";

// if you are adding a new translation, please use PartialLocaleType instead of LocaleType

const isApp = !!getClientConfig()?.isApp;
const ptBR: PartialLocaleType = {
  WIP: "Em breve...",
  Error: {
    Unauthorized: isApp
      ? "have da API inválida, por favor verifique-a na página de [Configurações](/#/settings)."
      : "Acesso não autorizado, por favor insira o código de acesso na página de [autenticação](/#/auth) ou digite sua Chave da API do OpenAI.",
  },
  Auth: {
    Title: "Necessário Código de Acesso.",
    Tips: "Por favor, insira o código de acesso abaixo.",
    Input: "código de acesso",
    Confirm: "Confirmar",
    Later: "Depois",
  },
  ChatItem: {
    ChatItemCount: (count: number) => `${count} mensagens`,
  },
  Chat: {
    SubTitle: (count: number) => `${count} mensagens`,
    EditMessage: {
      Title: "Editar Todas as Mensagens",
      Topic: {
        Title: "Tópico",
        SubTitle: "Alterar o tópico atual",
      },
    },
    Actions: {
      ChatList: "Ir para Lista de Conversas",
      CompressedHistory: "Prompt de Histórico de Memória Compactado",
      Export: "Exportar Todas as Mensagens como Markdown",
      Copy: "Copiar",
      Stop: "Parar",
      Retry: "Gerar Novamente",
      Pin: "Fixar",
      PinToastContent: "Fixou 1 mensagem para prompts contextuais.",
      PinToastAction: "Ver",
      Delete: "Deletar",
      Edit: "Editar",
    },
    Commands: {
      new: "Iniciar uma nova conversa",
      newm: "Iniciar uma nova conversa com máscara",
      next: "Próxima Conversa",
      prev: "Conversa Anterior",
      clear: "Limpar Contexto",
      del: "Excluir Conversa",
    },
    InputActions: {
      Stop: "Parar",
      ToBottom: "Para o Mais Recente",
      Theme: {
        auto: "Auto",
        light: "Tema Claro",
        dark: "Tema Escuro",
      },
      Prompt: "Prompts",
      Masks: "Máscaras",
      Clear: "Limpar Contexto",
      Settings: "Configurações",
    },
    Rename: "Renomear Chat",
    Typing: "Digitando…",
    Input: (submitKey: string) => {
      var inputHints = `${submitKey} para enviar`;
      if (submitKey === String(SubmitKey.Enter)) {
        inputHints += ", Shift + Enter para quebrar a linha";
      }
      return inputHints + ", / para pesquisar prompts, : para usar comandos";
    },
    Send: "Enviar",
    Config: {
      Reset: "Redefinir para Padrão",
      SaveAs: "Salvar como Máscara",
    },
    IsContext: "Prompt Contextual",
  },
  Export: {
    Title: "Exportar Mensagens",
    Copy: "Copiar Tudo",
    Download: "Download",
    MessageFromYou: "Mensagem para Você",
    MessageFromChatGPT: "Mensagem do ChatGPT",
    Share: "Compartilhar no ShareGPT",
    Format: {
      Title: "Formato de Exportação",
      SubTitle: "Markdown ou Imagem PNG",
    },
    IncludeContext: {
      Title: "Incluir Contexto",
      SubTitle: "Exportar prompts contextuais com máscara ou não",
    },
    Steps: {
      Select: "Selecionar",
      Preview: "Pré-visualização",
    },
    Image: {
      Toast: "Capturando Imagem...",
      Modal: "Clique longo ou clique com o botão direito para salvar a imagem.",
    },
  },
  Select: {
    Search: "Buscar",
    All: "Selecionar Tudo",
    Latest: "Selecionar Mais Recente",
    Clear: "Limpar",
  },
  Memory: {
    Title: "Prompt de Memória",
    EmptyContent: "Nada ainda.",
    Send: "Enviar para a Memória",
    Copy: "Copiar Memória",
    Reset: "Reiniciar Sessão",
    ResetConfirm:
      "Redefinir irá limpar o histórico da conversa atual e a memória histórica. Tem certeza de que deseja redefinir?",
  },
  Home: {
    NewChat: "Nova Conversa",
    DeleteChat: "Confirma a exclusão da conversa selecionada?",
    DeleteToast: "Conversa Excluida!",
    Revert: "Reverter",
  },
  Settings: {
    Title: "Configurações",
    SubTitle: "Todas as Configurações",
    Danger: {
      Reset: {
        Title: "Reiniciar todas as Configurações",
        SubTitle: "Reiniciar todas as configurações para o padrão",
        Action: "Reiniciar",
        Confirm: "Confima que deseja reiniciar todas as configurações?",
      },
      Clear: {
        Title: "Limpar todos os Dados",
        SubTitle: "Limpar todas as mensagems e configurações",
        Action: "Limpar",
        Confirm: "Confirma limpar todas as mensagens e configurações?",
      },
    },

















    Lang: {
      Name: "Language", // ATTENTION: if you wanna add a new translation, please do not translate this value, leave it as `Language`
      All: "Todos os Idiomas",
    },
    Avatar: "Avatar",
    FontSize: {
      Title: "Tamanho da Fonte",
      SubTitle: "Ajustar o tamanho da fonte do conteúdo da conversa",
    },
    InjectSystemPrompts: {
      Title: "Inserir Prompts do Sistema",
      SubTitle: "Inserir um prompt de sistema global para cada solicitação",
    },
    InputTemplate: {
      Title: "Modelo de Entrada",
      SubTitle: "A mensagem mais recente será preenchida neste modelo.",
    },

    Update: {
      Version: (x: string) => `Versão: ${x}`,
      IsLatest: "Ultima Versão",
      CheckUpdate: "Verificar Atualizações",
      IsChecking: "Verificando atualizações...",
      FoundUpdate: (x: string) => `Nova Versão Encontrada: ${x}`,
      GoToUpdate: "Atualizar",
    },
    SendKey: "Enviar Tecla",
    Theme: "Tema",
    TightBorder: "Borda Ajustada",
    SendPreviewBubble: {
      Title: "Enviar Bolha de Pré-visualização",
      SubTitle: "Pré-visualizar markdown na bolha",
    },
    AutoGenerateTitle: {
      Title: "Gerar Título Automaticamente",
      SubTitle: "Gerar um título adequado com base no conteúdo da conversa.",
    },
    Mask: {
      Splash: {
        Title: "Mascára da Tela de Carregamento",
        SubTitle: "Exibir uma tela de carregamento antes de iniciar uma nova conversa.",
      },
      Builtin: {
        Title: "Ocultar Máscaras Internas.",
        SubTitle: "Ocultar máscaras internas na lista de máscaras.",
      },
    },
    Prompt: {
      Disable: {
        Title: "Desativar a auto-completar.",
        SubTitle: "Digite / para acionar a auto-completar.",
      },
      List: "Lista de prompts.",
      ListCount: (builtin: number, custom: number) =>
        `${builtin} incorporado, ${custom} definido pelo usuário.`,
      Edit: "Editar",
      Modal: {
        Title: "Lista de prompts",
        Add: "Adicionar",
        Search: "Buscar Prompts",
      },
      EditModal: {
        Title: "Editar Prompt",
      },
    },
    HistoryCount: {
      Title: "Contagem de Mensagens Anexadas",
      SubTitle: "Número de mensagens enviadas anexadas por solicitação.",
    },
    CompressThreshold: {
      Title: "Limiar de Compressão do Histórico",
      SubTitle:
        "Comprimirá se o comprimento das mensagens não comprimidas exceder o valor",
    },
    Token: {
      Title: "Chave da API",
      SubTitle: "Use sua chave para ignorar o limite de código de acesso",
      Placeholder: "Chave da API da OpenAI",
    },
    Usage: {
      Title: "Saldo da Conta",
      SubTitle(used: any, total: any) {
        return `Em uso este mês $${used}, total $${total}`;
      },
      IsChecking: "Verificando...",
      Check: "Verificar",
      NoAccess: "Digite a Chave da API para verificar o saldo.",
    },
    AccessCode: {
      Title: "Código de Acesso",
      SubTitle: "Controle de Acesso Habilitado",
      Placeholder: "Necessário um Código de Acesso",
    },
    Endpoint: {
      Title: "Ponto de Extermidade",
      SubTitle: "O ponto de extremidade personalizado deve começar com http(s)://.",
    },
    CustomModel: {
      Title: "Modelos Personalizados",
      SubTitle: "Adicione opções de modelo adicionais, separadas por vírgula.",
    },
    Model: "Modelo",
    Temperature: {
      Title: "Temperatura",
      SubTitle: "Um valor maior torna a saída mais aleatória",
    },
    TopP: {
      Title: "P Maior",
      SubTitle: "Não altere este valor junto com a temperatura.",
    },
    MaxTokens: {
      Title: "Máximo de Tokens",
      SubTitle: "Comprimento máximo dos tokens de entrada e dos tokens gerados",
    },
    PresencePenalty: {
      Title: "Penalidade de Presença",
      SubTitle:
        "Um valor maior aumenta a probabilidade de falar sobre novos tópicos.",
    },
    FrequencyPenalty: {
      Title: "Penalidade de Frequência",
      SubTitle:
        "Um valor maior reduz a probabilidade de repetir a mesma linha",
    },
  },
  Store: {
    DefaultTopic: "Nova Conversa",
    BotHello: "Olá! Como posso ajudar você hoje?",
    Error: "Algo deu errado, por favor, tente novamente mais tarde.",
    Prompt: {
      History: (content: string) =>
        "Isso é um resumo do histórico da conversa até agora: " + content,
      Topic:
        "Por favor gere um título de quatro a cinco palavras resumindo nossa conversa sem qualquer introdução, pontuação, aspas, pontos, símbolos ou texto adicional. Remova as aspas envolventes.",
      Summarize:
        "Resuma toda a discussão em no máximo 200 palavras ou menos para ser usada commo um prompt em um contexto futuro.",
    },
  },
  Copy: {
    Success: "Copiado para a área de transferência.",
    Failed: "A copia falhou, por favor adicione permissão de acesso ao clipboard",
  },
  Context: {
    Toast: (x: any) => `Com ${x} prompts contextuais`,
    Edit: "Configurações da Conversa Atual",
    Add: "Adicionar Prompt",
    Clear: "Contexto Esvaziado",
    Revert: "Reverter",
  },
  Plugin: {
    Name: "Plugin",
  },
  FineTuned: {
    Sysmessage: "Você é um assistente que",
  },
  Mask: {
    Name: "Máscara",
    Page: {
      Title: "Modelo de Prompt",
      SubTitle: (count: number) => `${count} modelos de prompts`,
      Search: "Buscar modelos",
      Create: "Criar",
    },
    Item: {
      Info: (count: number) => `${count} prompts`,
      Chat: "Conversa",
      View: "Ver",
      Edit: "Editar",
      Delete: "Deletar",
      DeleteConfirm: "Deseja realmente deletar?",
    },
    EditModal: {
      Title: (readonly: boolean) =>
        `Editar Modelo de Prompt ${readonly ? "(somente leitura)" : ""}`,
      Download: "Download",
      Clone: "Clonar",
    },
    Config: {
      Avatar: "Avatar do Bot",
      Name: "Nome do Bot",
      Sync: {
        Title: "Usar Configurações Globais",
        SubTitle: "Usar configurações globais neste chat",
        Confirm: "Confirme para sobreescrever as configurações personalizadas com as configurações globais?",
      },
      HideContext: {
        Title: "Ocultar Prompts de Contexto",
        SubTitle: "Não exibir prompts de contexto na conversa",
      },
      Share: {
        Title: "Compartilhar essa máscara",
        SubTitle: "Gerar link para essa Máscara",
        Action: "Copiar Link",
      },
    },
  },
  NewChat: {
    Return: "Retornar",
    Skip: "Apenas Inicie",
    Title: "Selecionar a Máscara",
    SubTitle: "Converse com o espírito por traz da Máscara",
    More: "Buscar Mais",
    NotShow: "Não mostrar novamente",
    ConfirmNoShow: "Confirma que deseja ocultar？ Você pode modificar isso nas configurações depois.",
  },

  UI: {
    Confirm: "Confirmar",
    Cancel: "Cancelar",
    Close: "Fechar",
    Create: "Criar",
    Edit: "Editar",
  },
  Exporter: {
    Model: "Modelo",
    Messages: "Mensagens",
    Topic: "Tópico",
    Time: "Tempo",
  },

  URLCommand: {
    Code: "Código de Acesso detectado na URL, deseja aplicar?",
    Settings: "Configurações detectadas na URL, deseja aplicar?",
  },
};

export default ptBR;
