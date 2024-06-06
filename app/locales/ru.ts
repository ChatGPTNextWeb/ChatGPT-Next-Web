import { getClientConfig } from "../config/client";
import { SubmitKey } from "../store/config";
import { LocaleType } from "./index";

// Если вы добавляете новый перевод, используйте PartialLocaleType вместо LocaleType

const isApp = !!getClientConfig()?.isApp;
const ru: LocaleType = {
  WIP: "В разработке...", // Скоро будет...
  Error: {
    Unauthorized: isApp
      ? "Неверный API ключ, проверьте его на странице [Настройки](/#/settings)."
      : "Неавторизованный доступ, введите код доступа на странице [авторизации](/#/auth) или введите свой OpenAI API ключ.",
  },
  Auth: {
    Title: "Требуется код доступа",
    Tips: "Пожалуйста, введите код доступа ниже",
    SubTips: "Или введите свой OpenAI или Google API ключ",
    Input: "код доступа",
    Confirm: "Подтвердить",
    Later: "Позже",
  },
  ChatItem: {
    ChatItemCount: (count: number) => `${count} сообщений`, // ${count} сообщений
  },
  Chat: {
    SubTitle: (count: number) => `${count} сообщений`, // ${count} сообщений
    EditMessage: {
      Title: "Редактировать все сообщения",
      Topic: {
        Title: "Тема",
        SubTitle: "Изменить текущую тему",
      },
    },
    Actions: {
      ChatList: "Перейти к списку чатов",
      CompressedHistory: "Сжатая история контекста", // Сжатый исторический контекст
      Export: "Экспортировать все сообщения в Markdown",
      Copy: "Копировать",
      Stop: "Остановить",
      Retry: "Повторить",
      Pin: "Закрепить",
      PinToastContent: "1 сообщение закреплено в контекстных подсказках", // 1 сообщение закреплено в контекстных подсказках
      PinToastAction: "Посмотреть",
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
      Stop: "Остановить",
      ToBottom: "К последнему", // К последнему сообщению
      Theme: {
        auto: "Авто",
        light: "Светлая тема",
        dark: "Темная тема",
      },
      Prompt: "Подсказки", // Шаблоны
      Masks: "Маски",
      Clear: "Очистить контекст",
      Settings: "Настройки",
      UploadImage: "Загрузить изображения",
    },
    Rename: "Переименовать чат",
    Typing: "Печатает...",
    Input: (submitKey: string) => {
      var inputHints = `${submitKey} отправить`; // ${submitKey} для отправки
      if (submitKey === String(SubmitKey.Enter)) {
        inputHints += ", Shift + Enter для переноса строки";
      }
      return inputHints + ", / для поиска подсказок, : для использования команд";
    },
    Send: "Отправить",
    Config: {
      Reset: "Сбросить по умолчанию",
      SaveAs: "Сохранить как маску",
    },
    IsContext: "Контекстная подсказка",
  },
  Export: {
    Title: "Экспорт сообщений",
    Copy: "Скопировать все",
    Download: "Скачать",
    MessageFromYou: "Сообщение от вас",
    MessageFromChatGPT: "Сообщение от ChatGPT",
    Share: "Поделиться в ShareGPT",
    Format: {
      Title: "Формат экспорта",
      SubTitle: "Markdown или PNG изображение",
    },
    IncludeContext: {
      Title: "Включая контекст",
      SubTitle: "Экспортировать контекстные подсказки в маске или нет",
    },
    Steps: {
      Select: "Выбрать",
      Preview: "Предварительный просмотр",
    },
    Image: {
      Toast: "Создание снимка экрана...", // Захват изображения...
      Modal: "Нажмите и удерживайте или щелкните правой кнопкой мыши, чтобы сохранить изображение",
    },
  },
  Select: {
    Search: "Поиск",
    All: "Выбрать все",
    Latest: "Выбрать последние",
    Clear: "Очистить",
  },
  Memory: {
    Title: "Контекстная подсказка",
    EmptyContent: "Пока ничего нет.",
    Send: "Отправить контекст",
    Copy: "Копировать контекст",
    Reset: "Сбросить сеанс",
    ResetConfirm:
      "Сброс очистит текущую историю разговора и историю памяти. Вы уверены, что хотите сбросить?",
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
        Title: "Сбросить все настройки",
        SubTitle: "Сбросить все элементы настроек по умолчанию",
        Action: "Сбросить",
        Confirm: "Подтвердите сброс всех настроек по умолчанию?",
      },
      Clear: {
        Title: "Очистить все данные",
        SubTitle: "Очистить все сообщения и настройки",
        Action: "Очистить",
        Confirm: "Подтвердите очистку всех сообщений и настроек?",
      },
    },
    Lang: {
      Name: "Language", // ВНИМАНИЕ: если вы хотите добавить новый перевод, не переводите это значение, оставьте его как `Language`
      All: "Все языки",
    },
    Avatar: "Аватар",
    FontSize: {
      Title: "Размер шрифта",
      SubTitle: "Настроить размер шрифта содержимого чата",
    },
    InjectSystemPrompts: {
      Title: "Внедрить системные подсказки",
      SubTitle: "Внедрить глобальную системную подсказку для каждого запроса",
    },
    InputTemplate: {
      Title: "Шаблон ввода",
      SubTitle: "Новое сообщение будет заполнено по этому шаблону",
    },

    Update: {
      Version: (x: string) => `Версия: ${x}`,
      IsLatest: "Последняя версия",
      CheckUpdate: "Проверить обновление",
      IsChecking: "Проверка обновления...",
      FoundUpdate: (x: string) => `Найдена новая версия: ${x}`,
      GoToUpdate: "Обновить",
    },
    SendKey: "Клавиша отправки",
    Theme: "Тема",
    TightBorder: "Узкая рамка", // Плотная граница
    SendPreviewBubble: {
      Title: "Предварительный просмотр отправки", // Пузырь предварительного просмотра отправки
      SubTitle: "Предварительный просмотр markdown в пузыре",
    },
    AutoGenerateTitle: {
      Title: "Автоматически генерировать заголовок",
      SubTitle: "Сгенерировать подходящий заголовок на основе содержимого разговора",
    },
    Sync: {
      CloudState: "Последнее обновление",
      NotSyncYet: "Еще не синхронизировано",
      Success: "Синхронизация прошла успешно",
      Fail: "Ошибка синхронизации",

      Config: {
        Modal: {
          Title: "Настройки синхронизации",
          Check: "Проверить соединение",
        },
        SyncType: {
          Title: "Тип синхронизации",
          SubTitle: "Выберите предпочитаемый сервис синхронизации",
        },
        Proxy: {
          Title: "Включить CORS прокси",
          SubTitle: "Включить прокси, чтобы избежать ограничений междоменных запросов",
        },
        ProxyUrl: {
          Title: "Конечная точка прокси",
          SubTitle:
            "Применимо только к встроенному CORS прокси для этого проекта",
        },

        WebDav: {
          Endpoint: "Конечная точка WebDAV",
          UserName: "Имя пользователя",
          Password: "Пароль",
        },

        UpStash: {
          Endpoint: "UpStash Redis REST Url",
          UserName: "Имя резервной копии",
          Password: "UpStash Redis REST токен",
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
        Title: "За splash screen маски", // Всплывающее окно маски
        SubTitle: "Показывать splash screen маски перед началом нового чата",
      },
      Builtin: {
        Title: "Скрыть встроенные маски",
        SubTitle: "Скрыть встроенные маски в списке масок",
      },
    },
    Prompt: {
      Disable: {
        Title: "Отключить автодополнение",
        SubTitle: "Введите / для запуска автодополнения",
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
        "Будет сжимать, если длина несжатых сообщений превышает значение",
    },

    Usage: {
      Title: "Баланс аккаунта",
      SubTitle(used: any, total: any) {
        return `Использовано в этом месяце $${used}, подписка $${total}`;
      },
      IsChecking: "Проверка...",
      Check: "Проверить",
      NoAccess: "Введите API ключ для проверки баланса",
    },
    Access: {
      AccessCode: {
        Title: "Код доступа",
        SubTitle: "Включен контроль доступа",
        Placeholder: "Введите код",
      },
      CustomEndpoint: {
        Title: "Пользовательская конечная точка",
        SubTitle: "Использовать пользовательский сервис Azure или OpenAI",
      },
      Provider: {
        Title: "Поставщик модели",
        SubTitle: "Выберите Azure или OpenAI",
      },
      OpenAI: {
        ApiKey: {
          Title: "OpenAI API ключ",
          SubTitle: "Пользовательский OpenAI API ключ",
          Placeholder: "sk-xxx",
        },

        Endpoint: {
          Title: "OpenAI конечная точка",
          SubTitle: "Должно начинаться с http(s):// или использовать /api/openai по умолчанию",
        },
      },
      Azure: {
        ApiKey: {
          Title: "Azure API ключ",
          SubTitle: "Проверьте свой API ключ в консоли Azure",
          Placeholder: "Azure API ключ",
        },

        Endpoint: {
          Title: "Azure конечная точка",
          SubTitle: "Пример: ",
        },

        ApiVerion: {
          Title: "Azure API версия",
          SubTitle: "Проверьте свою версию API в консоли Azure",
        },
      },
      Anthropic: {
        ApiKey: {
          Title: "Anthropic API ключ",
          SubTitle:
            "Используйте пользовательский ключ Anthropic, чтобы обойти ограничения доступа по паролю",
          Placeholder: "Anthropic API ключ",
        },

        Endpoint: {
          Title: "Адрес конечной точки",
          SubTitle: "Пример:",
        },

        ApiVerion: {
          Title: "API версия (версия API Claude)",
          SubTitle: "Выберите и введите конкретную версию API",
        },
      },
      CustomModel: {
        Title: "Пользовательские модели",
        SubTitle: "Параметры пользовательской модели, разделенные запятой",
      },
      Google: {
        ApiKey: {
          Title: "API ключ",
          SubTitle: "Получите свой API ключ в Google AI",
          Placeholder: "Введите свой API ключ Google AI Studio",
        },

        Endpoint: {
          Title: "Адрес конечной точки",
          SubTitle: "Пример:",
        },

        ApiVersion: {
          Title: "API версия (специфичная для gemini-pro)",
          SubTitle: "Выберите конкретную версию API",
        },
      },
    },

    Model: "Модель",
    Temperature: {
      Title: "Temperature",
      SubTitle: "Большее значение делает вывод более случайным",
    },
    TopP: {
      Title: "Top P",
      SubTitle: "Не изменяйте это значение вместе с температурой",
    },
    MaxTokens: {
      Title: "Максимальное количество токенов",
      SubTitle: "Максимальная длина входных токенов и сгенерированных токенов",
    },
    PresencePenalty: {
      Title: "Штраф за наличие", // Presence Penalty
      SubTitle:
        "Большее значение увеличивает вероятность разговора на новые темы",
    },
    FrequencyPenalty: {
      Title: "Штраф за частоту", // Frequency Penalty
      SubTitle:
        "Большее значение уменьшает вероятность повторения одной и той же строки",
    },
  },
  Store: {
    DefaultTopic: "Новый разговор",
    BotHello: "Привет! Чем я могу вам помочь сегодня?",
    Error: "Что-то пошло не так, повторите попытку позже.",
    Prompt: {
      History: (content: string) =>
        "Это краткое изложение истории чата: " + content,
      Topic:
        "Пожалуйста, сгенерируйте заголовок из четырех-пяти слов, суммирующий наш разговор, без вводных слов, знаков препинания, кавычек, точек, символов, полужирного текста или дополнительного текста. Удалите заключительные кавычки.",
      Summarize:
        "Кратко изложите обсуждение в 200 словах или меньше, чтобы использовать его в качестве подсказки для будущего контекста.",
    },
  },
  Copy: {
    Success: "Скопировано в буфер обмена",
    Failed: "Не удалось скопировать, пожалуйста, предоставьте разрешение на доступ к буферу обмена",
  },
  Download: {
    Success: "Содержимое загружено в ваш каталог.",
    Failed: "Не удалось загрузить.",
  },
  Context: {
    Toast: (x: any) => `С ${x} контекстными подсказками`,
    Edit: "Настройки текущего чата",
    Add: "Добавить подсказку",
    Clear: "Контекст очищен",
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
      DeleteConfirm: "Подтвердите удаление?",
    },
    EditModal: {
      Title: (readonly: boolean) =>
        `Редактировать шаблон подсказки ${readonly ? "(только для чтения)" : ""}`,
      Download: "Скачать",
      Clone: "Клонировать",
    },
    Config: {
      Avatar: "Аватар бота",
      Name: "Имя бота",
      Sync: {
        Title: "Использовать глобальные настройки",
        SubTitle: "Использовать глобальные настройки в этом чате",
        Confirm: "Подтвердите перезапись пользовательских настроек глобальными настройками?",
      },
      HideContext: {
        Title: "Скрыть контекстные подсказки",
        SubTitle: "Не показывать контекстные подсказки в чате",
      },
      Share: {
        Title: "Поделиться этой маской",
        SubTitle: "Сгенерировать ссылку на эту маску",
        Action: "Скопировать ссылку",
      },
    },
  },
  NewChat: {
    Return: "Вернуться",
    Skip: "Просто начать",
    Title: "Выберите маску",
    SubTitle: "Поговорите с душой за маской",
    More: "Найти больше",
    NotShow: "Больше не показывать",
    ConfirmNoShow: "Подтвердите отключение? Вы можете включить его позже в настройках.",
  },

  UI: {
    Confirm: "Подтвердить",
    Cancel: "Отмена",
    Close: "Закрыть",
    Create: "Создать",
    Edit: "Редактировать",
    Export: "Экспортировать",
    Import: "Импортировать",
    Sync: "Синхронизировать",
    Config: "Настройки", // Конфигурация
  },
  Exporter: {
    Description: {
      Title: "Будут отображаться только сообщения после очистки контекста",
    },
    Model: "Модель",
    Messages: "Сообщения",
    Topic: "Тема",
    Time: "Время",
  },

  URLCommand: {
    Code: "Обнаружен код доступа из URL, подтвердите применение? ",
    Settings: "Обнаружены настройки из URL, подтвердите применение?",
  },
};

export default ru;
