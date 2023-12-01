import { getClientConfig } from "../config/client";
import { SubmitKey } from "../store/config";
import { LocaleType } from "./index";

// if you are adding a new translation, please use PartialLocaleType instead of LocaleType

const isApp = !!getClientConfig()?.isApp;
const fa: LocaleType = {
  WIP: "بزودی برمی‌گردیم",
  Error: {
    Unauthorized: isApp
      ? "کلید API نامعتبر است، لطفاً آن را در صفحه [تنظیمات](/#/settings) بررسی کنید."
      : "دسترسی غیرمجاز، لطفاً کد دسترسی را در صفحه [احراز هویت](/#/auth) وارد کنید یا کلید OpenAI API خود را وارد کنید.",
  },
  Auth: {
    Title: "به کد دسترسی نیاز هست",
    Tips: "لطفاً کد دسترسی را در کادر پایین وارد کنید",
    SubTips: "یا کلید OpenAI API خود را وارد کنید",
    Input: "کد دسترسی",
    Confirm: "تأیید",
    Later: "بعداً",
  },
  ChatItem: {
    ChatItemCount: (count: number) => `${count} messages`,
  },
  Chat: {
    SubTitle: (count: number) => `${count} messages`,
    EditMessage: {
      Title: "ویرایش همه پیام ها",
      Topic: {
        Title: "موضوع",
        SubTitle: "موضوع فعلی را تغییر دهید",
      },
    },
    Actions: {
      ChatList: "به فهرست گفتگو بروید",
      CompressedHistory: "درخواست حافظه تاریخچه فشرده",
      Export: "استخراج همه پیام‌ها به عنوان Markdown",
      Copy: "رونوشت",
      Stop: "توقف",
      Retry: "دوباره",
      Pin: "سنجاق",
      PinToastContent: "۱ پیام در دستور‌های متنی سنجاق شد",
      PinToastAction: "مشاهده",
      Delete: "حذف",
      Edit: "ویرایش",
    },
    Commands: {
      new: "شروع گفتگو جدید",
      newm: "یک گفتگو جدید با نقاب شروع کنید",
      next: "گفتگو بعدی",
      prev: "گفتگو قبلی",
      clear: "پاک کردن متن",
      del: "پاک کردن گفتگو",
    },
    InputActions: {
      Stop: "توقف",
      ToBottom: "رفتن به آخرین",
      Theme: {
        auto: "خودکار",
        light: "قالب کاربری روشن",
        dark: "قالب کاربری تاریک",
      },
      Prompt: "دستور‌ها",
      Masks: "نقاب‌ها",
      Clear: "پاک کردن محتوا",
      Settings: "تنظیمات",
    },
    Rename: "تغییر نام گفتگو",
    Typing: "درحال نوشتن...",
    Input: (submitKey: string) => {
      var inputHints = `${submitKey} to send`;
      if (submitKey === String(SubmitKey.Enter)) {
        inputHints += ", Shift + Enter برای رفتن به خط بعد";
      }
      return inputHints + ", / برای جست‌وجوی دستور‌ها, : برای استفاده از دستور‌ها";
    },
    Send: "ارسال",
    Config: {
      Reset: "تنظیم مجدد به حالت پیش‌فرض",
      SaveAs: "ذخیره به عنوان نقاب",
    },
    IsContext: "درخواست متنی",
  },
  Export: {
    Title: "استخراج پیام‌ها",
    Copy: "رونوشت همه",
    Download: "دانلود",
    MessageFromYou: "پیام از طرف شما",
    MessageFromChatGPT: "پیام از طرف ChatGPT",
    Share: "اشتراک گذاری با ShareGPT",
    Format: {
      Title: "قالب استخراج",
      SubTitle: "Markdown یا عکس PNG",
    },
    IncludeContext: {
      Title: "درحال وارد کردن متن",
      SubTitle: "استخراج کردن دستور‌های متنی در نقاب یا نه",
    },
    Steps: {
      Select: "انتخاب",
      Preview: "پیش‌نمایش",
    },
    Image: {
      Toast: "گرفتن تصویر...",
      Modal: "برای ذخیره تصویر، طولانی فشار دهید یا کلیک راست کنید",
    },
  },
  Select: {
    Search: "جست‌وجو",
    All: "انتخاب همه",
    Latest: "انتخاب آخرین",
    Clear: "پاک کردن",
  },
  Memory: {
    Title: "اعلان حافظه",
    EmptyContent: "چیزی وجود ندارد",
    Send: "ارسال حافظه",
    Copy: "رونوشت حافظه",
    Reset: "بازنشانی جلسه",
    ResetConfirm:
      "بازنشانی، تاریخچه مکالمه فعلی و حافظه تاریخی را پاک می کند. آیا مطمئن هستید که می خواهید این کار را انجام دهید؟",
  },
  Home: {
    NewChat: "گفتگو جدید",
    DeleteChat: "آیا تأیید می‌کنید که گفتگو انتخابی حذف شود؟",
    DeleteToast: "گفتگو حذف شد",
    Revert: "برگشت",
  },
  Settings: {
    Title: "تنظیمات",
    SubTitle: "همهٔ تنظیمات",
    Danger: {
      Reset: {
        Title: "بازنشانی همهٔ تنظیمات",
        SubTitle: "همهٔ موارد تنظیمات را به حالت پیش‌فرض بازنشانی کنید",
        Action: "بازنشانی",
        Confirm: "آیا تأیید می‌کنید که همهٔ تنظیمات به حالت پیش‌فرض بازنشانی شود؟",
      },
      Clear: {
        Title: "پاک کردن همهٔ داده‌ها",
        SubTitle: "پاک کردن همهٔ پیام‌ها و تنظیمات",
        Action: "پاک کردن",
        Confirm: "تأیید می‌کنید که همهٔ پیام‌ها و تنظیمات پاک شوند؟",
      },
    },
    Lang: {
      Name: "Language", // ATTENTION: if you wanna add a new translation, please do not translate this value, leave it as `Language`
      All: "All Languages",
    },
    Avatar: "چهره",
    FontSize: {
      Title: "اندازهٔ قلم",
      SubTitle: "اندازه قلم محتوای گفتگو را تنظیم کنید",
    },
    InjectSystemPrompts: {
      Title: "دستورات سیستمی را تزریق کنید",
      SubTitle: "تزریق کردن دستورات سیستمی سراسری برای همهٔ درخواست‌ها",
    },
    InputTemplate: {
      Title: "قالب ورودی",
      SubTitle: "جدیدترین پیام به این الگو پر می شود",
    },

    Update: {
      Version: (x: string) => `نسخه: ${x}`,
      IsLatest: "آخرین نسخه",
      CheckUpdate: "بررسی بروزرسانی",
      IsChecking: "درحال بررسی کردن بروزرسانی...",
      FoundUpdate: (x: string) => `یک نسخهٔ جدید پیدا شد: ${x}`,
      GoToUpdate: "بروزرسانی",
    },
    SendKey: "کلید ارسال",
    Theme: "قالب کاربری",
    TightBorder: "Tight Border",
    SendPreviewBubble: {
      Title: "ارسال حباب پیش نمایش",
      SubTitle: "پیش‌نمایش markdown در حباب",
    },
    AutoGenerateTitle: {
      Title: "تولید خودکار عنوان",
      SubTitle: "یک عنوان مناسب بر اساس محتوای گفتگو ایجاد کنید",
    },
    Sync: {
      CloudState: "آخرین بروزرسانی",
      NotSyncYet: "هنوز همگام‌سازی نشده است",
      Success: "با موفقیت همگام‌سازی شد",
      Fail: "همگام‌سازی انجام نشد",

      Config: {
        Modal: {
          Title: "همگام سازی پیکربندی",
          Check: "اتصال را بررسی کنید",
        },
        SyncType: {
          Title: "نوع همگام سازی",
          SubTitle: "سرویس همگام سازی مورد علاقه خود را انتخاب کنید",
        },
        Proxy: {
          Title: "CORS Proxy را فعال کنید",
          SubTitle: "برای جلوگیری از محدودیت‌های cross-origin، یک پروکسی را فعال کنید",
        },
        ProxyUrl: {
          Title: "پایانهٔ پراکسی",
          SubTitle:
            "فقط برای پراکسی CORS داخلی این پروژه قابل استفاده است",
        },

        WebDav: {
          Endpoint: "پایانهٔ WebDAV",
          UserName: "نام‌کاربری",
          Password: "رمزعبور",
        },

        UpStash: {
          Endpoint: "آدرس UpStash Redis REST",
          UserName: "نام پشتیبان",
          Password: "توکن UpStash Redis REST",
        },
      },

      LocalState: "داده‌های محلی",
      Overview: (overview: any) => {
        return `${overview.chat} 'گفتگو，${overview.message} پیام，${overview.prompt} دستور，${overview.mask} نقاب`;
      },
      ImportFailed: "وارد کردن از فایل انجام نشد",
    },
    Mask: {
      Splash: {
        Title: "نقاب صفحهٔ شروع",
        SubTitle: "قبل از شروع گفتگو جدید، یک صفحه شروع با نقاب نشان دهید",
      },
      Builtin: {
        Title: "نقاب‌های توکار را مخفی کنید",
        SubTitle: "نقاب‌های توکار را در لیست نقاب‌ها پنهان کنید",
      },
    },
    Prompt: {
      Disable: {
        Title: "تکمیل خودکار را غیرفعال کنید",
        SubTitle: "/ را وارد کنید تا تکمیل خودکار را خاموش و روشن کنید",
      },
      List: "لیست دستورات",
      ListCount: (builtin: number, custom: number) =>
        `${builtin} توکار, ${custom} تعریف شده توسط کاربر`,
      Edit: "ویرایش",
      Modal: {
        Title: "لیست دستورات",
        Add: "یکی اضافه کنید",
        Search: "جست‌وجو دستورات",
      },
      EditModal: {
        Title: "ویرایش دستور",
      },
    },
    HistoryCount: {
      Title: "تعداد پیام‌های پیوست شده",
      SubTitle: "تعداد پیام‌های ارسال شده در هردرخواست پیوست شده است",
    },
    CompressThreshold: {
      Title: "آستانه فشرده سازی تاریخچه",
      SubTitle:
        "اگر طول پیام های فشرده نشده بیشتر از مقدار باشد، فشرده می شود",
    },

    Usage: {
      Title: "موجودی حساب",
      SubTitle(used: any, total: any) {
        return `$${used} در این ماه استفاده شده از $${total}`;
      },
      IsChecking: "درحال بررسی کردن...,
      Check: "بررسی",
      NoAccess: "برای بررسی موجودی، کلید API را وارد کنید",
    },
    Access: {
      AccessCode: {
        Title: "کلید دسترسی",
        SubTitle: "کنترل دسترسی فعال شد",
        Placeholder: "کلید را وارد کنید",
      },
      CustomEndpoint: {
        Title: "پایانهٔ سفارشی",
        SubTitle: "از سرویس سفارشی Azure یا OpenAI استفاده کنید",
      },
      Provider: {
        Title: "ارائه دهنده مدل",
        SubTitle: "Azure یا OpenAI را انتخاب کنید",
      },
      OpenAI: {
        ApiKey: {
          Title: "کلید OpenAI API",
          SubTitle: "کلید OpenAI Api سفارشی کاربر",
          Placeholder: "sk-xxx",
        },

        Endpoint: {
          Title: "پایانهٔ OpenAI",
          SubTitle: "باید با http(s):// شروع شود یا از /api/openai به عنوان پیش فرض استفاده کنید",
        },
      },
      Azure: {
        ApiKey: {
          Title: "کلید Azure Api",
          SubTitle: "کلید api خود را از کنسول Azure بررسی کنید",
          Placeholder: "کلید Azure Api",
        },

        Endpoint: {
          Title: "پایانهٔ Azure",
          SubTitle: "مثال: ",
        },

        ApiVerion: {
          Title: "نسخهٔ Azure Api",
          SubTitle: "نسخه api خود را از کنسول azure بررسی کنید",
        },
      },
      CustomModel: {
        Title: "مدل‌های سفارشی",
        SubTitle: "گزینه‌های مدل سفارشی که با کاما از هم جدا شده اند",
      },
    },

    Model: "مدل",
    Temperature: {
      Title: "درجه حرارت",
      SubTitle: "مقدار بزرگتر باعث می شود خروجی تصادفی‌تر باشد",
    },
    TopP: {
      Title: "Top P",
      SubTitle: "این مقدار را همراه با دما تغییر ندهید",
    },
    MaxTokens: {
      Title: "حداکثر توکن‌ها",
      SubTitle: "حداکثر طول توکن‌های ورودی و توکن‌های تولید شده",
    },
    PresencePenalty: {
      Title: "جریمهٔ حضور",
      SubTitle:
        "مقدار بزرگتر احتمال صحبت در مورد موضوعات جدید را افزایش می دهد",
    },
    FrequencyPenalty: {
      Title: "جریمهٔ فرکانس",
      SubTitle:
        "یک مقدار بزرگتر که احتمال تکرار همان خط را کاهش می دهد",
    },
  },
  Store: {
    DefaultTopic: "موضوع جدید",
    BotHello: "سلام! امروز چگونه می توانم به شما کمک کنم؟",
    Error: "مشکلی رخ داده است. لطفا بعدا دوباره امتحان کنید.",
    Prompt: {
      History: (content: string) =>
        "این خلاصه ای از تاریخچه گفتگو به عنوان خلاصه است: " + content,
      Topic:
        "لطفاً یک عنوان چهار تا پنج کلمه ای ایجاد کنید که مکالمه ما را بدون هیچ گونه سردر، نقطه گذاری، علامت نقل قول، نقطه، نماد یا متن اضافی خلاصه می‌کند. گیومه‌های محصور را حذف کنید.",
      Summarize:
        "بحث را به طور خلاصه در 200 کلمه یا کمتر خلاصه کنید تا به عنوان یک دستور برای متن‌های آینده استفاده کنید.",
    },
  },
  Copy: {
    Success: "در بریده‌دان رونوشت شد",
    Failed: "رونوشت انجام نشد، لطفاً دسترسی به بریده‌دان بدهید",
  },
  Download: {
    Success: "محتوا در پوشه شما بارگیری شده است.",
    Failed: "بارگیری شکست خورد.",
  },
  Context: {
    Toast: (x: any) => `با ${x} دستورات متنی`,
    Edit: "تنظیمات این گفتگو",
    Add: "افزودن دستور",
    Clear: "متن پاک شد",
    Revert: "بازگشت",
  },
  Plugin: {
    Name: "افزونه",
  },
  FineTuned: {
    Sysmessage: "شما یک دستیار هستید که",
  },
  Mask: {
    Name: "نقاب",
    Page: {
      Title: "قالب دستور",
      SubTitle: (count: number) => `${count} قالب دستورات`,
      Search: "جست‌وجوی قالب‌ها",
      Create: "ایجاد",
    },
    Item: {
      Info: (count: number) => `${count} دستور`,
      Chat: "گفتگو",
      View: "نمایش",
      Edit: "ویرایش",
      Delete: "حذف",
      DeleteConfirm: "تأیید می‌کنید که حذف شوند؟",
    },
    EditModal: {
      Title: (readonly: boolean) =>
        `ویرایش قالب دستورات ${readonly ? "(readonly)" : ""}`,
      Download: "بارگیری",
      Clone: "Clone",
    },
    Config: {
      Avatar: "چهرهٔ بات",
      Name: "نام بات",
      Sync: {
        Title: "استفاده از پیکربندی سراسری",
        SubTitle: "استفاده از پیکربندی سراسری در این گفتگو",
        Confirm: "تأیید می‌کنید که پیکربندی سفارشی با پیکربندی سراسری لغو شود؟",
      },
      HideContext: {
        Title: "پنهان کردن دستورات متنی",
        SubTitle: "دستورات درون متنی را در گفتگو نشان ندهید",
      },
      Share: {
        Title: "نقاب را به اشتراک بگذارید",
        SubTitle: "ایجاد یک پیوند به این نقاب",
        Action: "رونوشت پیوند",
      },
    },
  },
  NewChat: {
    Return: "بازگشت",
    Skip: "فقط شروع کن",
    Title: "یک نقاب انتخاب کنید",
    SubTitle: "با روح پشت نقاب چت کنید",
    More: "بیشتر پیدا کنید",
    NotShow: "هرگز نشان داده نشود",
    ConfirmNoShow: "غیرفعال کردن را تأیید می‌کنید؟ بعداً می توانید آن را در تنظیمات فعال کنید.",
  },

  UI: {
    Confirm: "تأیید",
    Cancel: "لغو",
    Close: "بستن",
    Create: "ایجاد",
    Edit: "ویرایش",
    Export: "خروجی گرفتن",
    Import: "وارد کردن",
    Sync: "همگام سازی",
    Config: "پیکربندی",
  },
  Exporter: {
    Model: "مدل",
    Messages: "پیام‌ها",
    Topic: "موضوع",
    Time: "زمان",
  },

  URLCommand: {
    Code: "کد دسترسی از url شناسایی شد، تأیید می‌کنید که اعمال بشود؟ ",
    Settings: "تنظیمات از url شناسایی شد، برای اعمال تأیید شود؟",
  },
};

export default fa;
