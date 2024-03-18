import { SubmitKey } from "../store/config";
import type { PartialLocaleType } from "./index";

const isApp = !!getClientConfig()?.isApp;
const ru: PartialLocaleType = {
  WIP: "Скоро...",
  Error: {
    Unauthorized: isApp
      ? "Неверный ключ API, пожалуйста, проверьте его на странице [Настройки](/#/settings)."
      : "Несанкционированный доступ, пожалуйста, введите код доступа на странице [auth](/#/auth), или введите свой ключ API OpenAI.",
  },
  Auth: {
    Title: "Нужен Код Доступа",
    Tips: "Пожалуйста, введите код доступа ниже",
    SubTips: "Или введите свой API-ключ OpenAI или Google",
    Input: "код доступа",
    Confirm: "Подтвердить",
    Later: "Позже",
  },
  ChatItem: {
    ChatItemCount: (count: number) => `${count} сообщений`,
  },
  Chat: {
    SubTitle: (count: number) => `${count} сообщений`,
    EditMessage: {
      Title: "Редактировать все сообщения",
      Topic: {
        Title: "Тема",
        SubTitle: "Изменить текущую тему",
      },
    },
    Actions: {
      ChatList: "Перейти к списку чатов",
      CompressedHistory: "Сжатая история памяти",
      Export: "Экспортировать все сообщения в формате Markdown",
      Copy: "Копировать",
      Stop: "Стоп",
      Retry: "Повторить",
      Pin: "Закрепить",
      PinToastContent: "Закреплено 1 сообщение для контекстных подсказок",
      PinToastAction: "Просмотр",
      Delete: "Удалить",
      Edit: "Редактировать",
    },
    Commands: {
      new: "Начать новый чат",
      newm: "Начать новый чат с маской",
      next: "Следующий чат",
      prev: "Предыдущий чат",
      clear: "Очистить контекст",
      del: "Удалить чат",
    },
    InputActions: {
      Stop: "Стоп",
      ToBottom: "К последнему",
      Theme: {
        auto: "Авто",
        light: "Светлая тема",
        dark: "Темная тема",
      },
      Prompt: "Подсказки",
      Masks: "Маски",
      Clear: "Очистить контекст",
      Settings: "Настройки",
      UploadImage: "Загрузить изображения",
    },
    Rename: "Переименовать чат",
    Typing: "Печатает…",
    Input: (submitKey: string) => {
      var inputHints = `${submitKey} для отправки`;
      if (submitKey === String(SubmitKey.Enter)) {
        inputHints += ", Shift + Enter для переноса строки";
      }
      return inputHints + ", / для поиска подсказок, : для использования команд";
    },
    Send: "Отправить",
    Config: {
      Reset: "Сбросить настройки",
      SaveAs: "Сохранить как маску",
    },
    IsContext: "Контекстная подсказка",
  },
  Export: {
    Title: "Экспорт сообщений",
    Copy: "Копировать все",
    Download: "Скачать",
    MessageFromYou: "Сообщение от вас",
    MessageFromChatGPT: "Сообщение от ChatGPT",
    Share: "Поделиться с ShareGPT",
    Format: {
      Title: "Формат экспорта",
      SubTitle: "Markdown или изображение PNG",
    },
    IncludeContext: {
      Title: "Включая контекст",
      SubTitle: "Экспортировать контекстные подсказки в маске или нет",
    },
    Steps: {
      Select: "Выбрать",
      Preview: "Просмотр",
    },
    Image: {
      Toast: "Захват изображения...",
      Modal: "Удерживайте нажатой кнопку или щелкните правой кнопкой мыши, чтобы сохранить изображение",
    },
  },
  Select: {
    Search: "Поиск",
    All: "Выбрать все",
    Latest: "Выбрать последнее",
    Clear: "Очистить",
  },
  Memory: {
    Title: "Памятная подсказка",
    EmptyContent: "Пока ничего.",
    Send: "Отправить память",
    Copy: "Скопировать память",
    Reset: "Сброс сессии",
    ResetConfirm:
      "Сброс очистит текущую историю разговора и историческую память. Вы уверены, что хотите сбросить?",
  },
  Home: {
    NewChat: "Новый чат",
    DeleteChat: "Подтвердите удаление выбранного разговора?",
    DeleteToast: "Чат удален",
    Revert: "Вернуть",
  },
  Settings: {
    Title: "Настройки",
    SubTitle: "Все настройки",
    Danger: {
      Reset: {
        Title: "Сброс всех настроек",
        SubTitle: "Сбросить все настройки по умолчанию",
        Action: "Сбросить",
        Confirm: "Подтвердить сброс всех настроек на значения по умолчанию?",
      },
      Clear: {
        Title: "Очистить все данные",
        SubTitle: "Очистить все сообщения и настройки",
        Action: "Очистить",
        Confirm: "Подтвердить очистку всех сообщений и настроек?",
      },
    },
    Lang: {
      Name: "Language", // ВНИМАНИЕ: если вы хотите добавить новый перевод, пожалуйста, не переводите это значение, оставьте его как `Language`
      All: "Все языки",
    },
    Avatar: "Аватар",
    FontSize: {
      Title: "Размер шрифта",
      SubTitle: "Настройка размера шрифта чата",
    },
    InjectSystemPrompts: {
      Title: "Внедрить системные подсказки",
      SubTitle: "Внедрить глобальную системную подсказку для каждого запроса",
    },
    InputTemplate: {
      Title: "Шаблон ввода",
      SubTitle: "Новейшее сообщение будет заполнено этим шаблоном",
    },

    Update: {
      Version: (x: string) => `Версия: ${x}`,
      IsLatest: "Последняя версия",
      CheckUpdate: "Проверить обновление",
      IsChecking: "Проверка обновления...",
      FoundUpdate: (x: string) => `Найдена новая версия: ${x}`,
      GoToUpdate: "Обновить",
    },
    SendKey: "Отправить ключ",
    Theme: "Тема",
    TightBorder: "Узкая граница",
    SendPreviewBubble: {
      Title: "Отправить предпросмотрное окно",
      SubTitle: "Предпросмотр markdown в пузыре",
    },
    AutoGenerateTitle: {
      Title: "Автоматическое создание заголовка",
      SubTitle: "Создание подходящего заголовка на основе содержания разговора",
    },
    Sync: {
      CloudState: "Последнее обновление",
      NotSyncYet: "Еще не синхронизировано",
      Success: "Успешная синхронизация",
      Fail: "Сбой синхронизации",

      Config: {
        Modal: {
          Title: "Синхронизация конфигурации",
          Check: "Проверить подключение",
        },
        SyncType: {
          Title: "Тип синхронизации",
          SubTitle: "Выберите предпочтительный сервис синхронизации",
        },
        Proxy: {
          Title: "Включить прокси CORS",
          SubTitle: "Включить прокси, чтобы избежать ограничений на кросс-доменные запросы",
        },
        ProxyUrl: {
          Title: "Конечная точка прокси",
          SubTitle:
            "Применимо только к встроенному прокси CORS для этого проекта",
        },

        WebDav: {
          Endpoint: "Конечная точка WebDAV",
          UserName: "Имя пользователя",
          Password: "Пароль",
        },

        UpStash: {
          Endpoint: "URL UpStash Redis REST",
          UserName: "Имя резервной копии",
          Password: "Токен UpStash Redis REST",
        },
      },

      LocalState: "Локальные данные",
      Overview: (overview: any) => {
        return `${overview.chat} чатов, ${overview.message} сообщений, ${overview.prompt} подсказок, ${overview.mask} масок`;
      },
      ImportFailed: "Не удалось импортировать из файла",
    },
    Mask: {
      Splash: {
        Title: "Заставка маски",
        SubTitle: "Показать заставку маски перед началом нового чата",
      },
      Builtin: {
        Title: "Скрыть встроенные маски",
        SubTitle: "Скрыть встроенные маски в списке масок",
      },
    },
    Prompt: {
      Disable: {
        Title: "Отключить автодополнение",
        SubTitle: "Введите / для вызова автодополнения",
      },
      List: "Список подсказок",
      ListCount: (builtin: number, custom: number) =>
        `${builtin} встроенных, ${custom} пользовательских`,
      Edit: "Редактировать",
      Modal: {
        Title: "Список подсказок",
        Add: "Добавить",
        Search: "Поиск подсказок",
      },
      EditModal: {
        Title: "Редактировать подсказку",
      },
    },
    HistoryCount: {
      Title: "Количество прикрепленных сообщений",
      SubTitle: "Количество отправленных сообщений, прикрепленных к каждому запросу",
    },
    CompressThreshold: {
      Title: "Порог сжатия истории",
      SubTitle:
        "Будет произведено сжатие, если длина несжатых сообщений превысит это значение",
    },

    Usage: {
      Title: "Баланс аккаунта",
      SubTitle(used: any, total: any) {
        return `Использовано в этом месяце $${used}, подписка $${total}`;
      },
      IsChecking: "Проверка...",
      Check: "Проверить",
      NoAccess: "Введите API-ключ для проверки баланса",
    },
    Access: {
      AccessCode: {
        Title: "Код доступа",
        SubTitle: "Управление доступом включено",
        Placeholder: "Введите код",
      },
      CustomEndpoint: {
        Title: "Пользовательский конечный пункт",
        SubTitle: "Используйте пользовательский сервис Azure или OpenAI",
      },
      Provider: {
        Title: "Поставщик модели",
        SubTitle: "Выберите Azure или OpenAI",
      },
      OpenAI: {
        ApiKey: {
          Title: "Ключ API OpenAI",
          SubTitle: "Пользовательский ключ API OpenAI",
          Placeholder: "sk-xxx",
        },

        Endpoint: {
          Title: "Конечная точка OpenAI",
          SubTitle: "Должна начинаться с http(s):// или использовать /api/openai по умолчанию",
        },
      },
      Azure: {
        ApiKey: {
          Title: "Ключ API Azure",
          SubTitle: "Проверьте свой ключ API в консоли Azure",
          Placeholder: "Ключ API Azure",
        },

        Endpoint: {
          Title: "Конечная точка Azure",
         

 SubTitle: "Пример: ",
        },

        ApiVerion: {
          Title: "Версия API Azure",
          SubTitle: "Проверьте версию API в консоли Azure",
        },
      },
      CustomModel: {
        Title: "Пользовательские модели",
        SubTitle: "Опции пользовательских моделей, разделенные запятой",
      },
      Google: {
        ApiKey: {
          Title: "Ключ API",
          SubTitle: "Получите свой API-ключ от Google AI",
          Placeholder: "Введите свой API-ключ Google AI Studio",
        },

        Endpoint: {
          Title: "Адрес конечной точки",
          SubTitle: "Пример:",
        },

        ApiVersion: {
          Title: "Версия API (специфично для gemini-pro)",
          SubTitle: "Выберите конкретную версию API",
        },
      },
    },

    Model: "Модель",
    Temperature: {
      Title: "Температура",
      SubTitle: "Большее значение делает вывод более случайным",
    },
    TopP: {
      Title: "Top P",
      SubTitle: "Не изменяйте это значение вместе с температурой",
    },
    MaxTokens: {
      Title: "Максимальное количество токенов",
      SubTitle: "Максимальная длина входных и сгенерированных токенов",
    },
    PresencePenalty: {
      Title: "Штраф за присутствие",
      SubTitle:
        "Большее значение увеличивает вероятность говорить о новых темах",
    },
    FrequencyPenalty: {
      Title: "Штраф за частоту",
      SubTitle:
        "Большее значение уменьшает вероятность повторения одной и той же строки",
    },
  },
  Store: {
    DefaultTopic: "Новый разговор",
    BotHello: "Привет! Чем я могу вам помочь сегодня?",
    Error: "Что-то пошло не так, попробуйте позже.",
    Prompt: {
      History: (content: string) =>
        "Это краткое изложение истории чата: " + content,
      Topic:
        "Пожалуйста, создайте заголовок из четырех или пяти слов, кратко описывающий наш разговор без предисловия, знаков препинания, кавычек, точек, символов, полужирного текста или дополнительного текста. Уберите кавычки.",
      Summarize:
        "Кратко изложите дискуссию в 200 словах или менее, чтобы использовать в качестве подсказки для будущего контекста.",
    },
  },
  Copy: {
    Success: "Скопировано в буфер обмена",
    Failed: "Копирование не удалось, пожалуйста, предоставьте разрешение на доступ к буферу обмена",
  },
  Download: {
    Success: "Содержимое загружено в вашу директорию.",
    Failed: "Сбой загрузки.",
  },
  Context: {
    Toast: (x: any) => `С ${x} контекстными подсказками`,
    Edit: "Текущие настройки чата",
    Add: "Добавить подсказку",
    Clear: "Очистить контекст",
    Revert: "Вернуть",
  },
  Plugin: {
    Name: "Плагин",
  },
  FineTuned: {
    Sysmessage: "Вы помощник, который",
  },
  Mask: {
    Name: "Маска",
    Page: {
      Title: "Шаблон подсказки",
      SubTitle: (count: number) => `${count} шаблонов подсказок`,
      Search: "Поиск шаблонов",
      Create: "Создать",
    },
    Item: {
      Info: (count: number) => `${count} подсказок`,
      Chat: "Чат",
      View: "Просмотр",
      Edit: "Редактировать",
      Delete: "Удалить",
      DeleteConfirm: "Подтвердить удаление?",
    },
    EditModal: {
      Title: (readonly: boolean) =>
        `Редактировать шаблон подсказки ${readonly ? "(только чтение)" : ""}`,
      Download: "Скачать",
      Clone: "Клонировать",
    },
    Config: {
      Avatar: "Аватар бота",
      Name: "Имя бота",
      Sync: {
        Title: "Использовать глобальную конфигурацию",
        SubTitle: "Использовать глобальную конфигурацию в этом чате",
        Confirm: "Подтвердить замену пользовательской конфигурации глобальной?",
      },
      HideContext: {
        Title: "Скрыть контекстные подсказки",
        SubTitle: "Не показывать контекстные подсказки в чате",
      },
      Share: {
        Title: "Поделиться этой маской",
        SubTitle: "Создать ссылку на эту маску",
        Action: "Скопировать ссылку",
      },
    },
  },
  NewChat: {
    Return: "Вернуться",
    Skip: "Начать",
    Title: "Выберите маску",
    SubTitle: "Общайтесь с Душой за маской",
    More: "Найти больше",
    NotShow: "Не показывать снова",
    ConfirmNoShow: "Подтвердите отключение? Вы можете включить его позже в настройках.",
  },

  UI: {
    Confirm: "Подтвердить",
    Cancel: "Отмена",
    Close: "Закрыть",
    Create: "Создать",
    Edit: "Редактировать",
    Export: "Экспорт",
    Import: "Импорт",
    Sync: "Синхронизация",
    Config: "Настройка",
  },
  Exporter: {
    Description: {
      Title: "Отображаются только сообщения после очистки контекста",
    },
    Model: "Модель",
    Messages: "Сообщения",
    Topic: "Тема",
    Time: "Время",
  },

  URLCommand: {
    Code: "Обнаружен код доступа из URL, подтвердить применение?",
    Settings: "Обнаружены настройки из URL, подтвердить применение?",
  },
};

export default ru;
