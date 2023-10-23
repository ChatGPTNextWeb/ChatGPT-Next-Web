import { SubmitKey } from "../store/config";
import type { PartialLocaleType } from "./index";

const hi: PartialLocaleType = {
  WIP: "जल्द ही आ रहा है...",
  Error: {
    Unauthorized: isApp
      ? "अवैध API कुंजी, कृपया इसे [सेटिंग्स](/#/settings) पृष्ठ पर जांचें।"
      : "अधिकृत पहुंच नहीं है, कृपया पहुंच कोड को [ऑथ](/#/auth) पृष्ठ पर दर्ज करें, या अपना OpenAI API कुंजी दर्ज करें।",
  },
  Auth: {
    Title: "पहुंच कोड आवश्यक",
    Tips: "कृपया नीचे पहुंच कोड दर्ज करें",
    SubTips: "या अपना OpenAI API कुंजी दर्ज करें",
    Input: "पहुंच कोड",
    Confirm: "कन्फ़र्म करें",
    Later: "बाद में",
  },
  ChatItem: {
    ChatItemCount: (count: number) => `${count} संदेश`,
  },
  Chat: {
    SubTitle: (count: number) => `${count} संदेश`,
    EditMessage: {
      Title: "सभी संदेश संपादित करें",
      Topic: {
        Title: "विषय",
        SubTitle: "वर्तमान विषय बदलें",
      },
    },
    Actions: {
      ChatList: "चैट सूची पर जाएं",
      CompressedHistory: "संक्षेपित इतिहास मेमो प्रम्प्ट",
      Export: "सभी संदेशों को मार्कडाउन के रूप में निर्यात करें",
      Copy: "कॉपी",
      Stop: "रोकें",
      Retry: "पुन: प्रयास करें",
      Pin: "पिन करें",
      PinToastContent: "1 संदेश को संदेश प्रॉम्प्ट में पिन किया गया है",
      PinToastAction: "देखें",
      Delete: "हटाएं",
      Edit: "संपादित करें",
    },
    Commands: {
      new: "नई चैट शुरू करें",
      newm: "मास्क के साथ नई चैट शुरू करें",
      next: "अगली चैट",
      prev: "पिछली चैट",
      clear: "संदर्भ साफ़ करें",
      del: "चैट हटाएं",
    },
    InputActions: {
      Stop: "रोकें",
      ToBottom: "नवीनतम पर जाएं",
      Theme: {
        auto: "स्वचालित",
        light: "हल्का थीम",
        dark: "डार्क थीम",
      },
      Prompt: "प्रॉम्प्ट",
      Masks: "मास्क",
      Clear: "संदर्भ साफ़ करें",
      Settings: "सेटिंग्स",
    },
    Rename: "चैट का नाम बदलें",
    Typing: "लिख रहा है...",
    Input: (submitKey: string) => {
      var inputHints = `${submitKey} भेजने के लिए`;
      if (submitKey === String(SubmitKey.Enter)) {
        inputHints += ", लिपटने के लिए Shift + Enter";
      }
      return inputHints + ", प्रॉम्प्ट खोजने के लिए /, कमांड्स का उपयोग करने के लिए :";
    },
    Send: "भेजें",
    Config: {
      Reset: "डिफ़ॉल्ट पर रीसेट करें",
      SaveAs: "मास्क के रूप में सहेजें",
    },
    IsContext: "संदर्भ प्रॉम्प्ट",
  },
  Export: {
    Title: "संदेश निर्यात करें",
    Copy: "सभी कॉपी करें",
    Download: "डाउनलोड करें",
    MessageFromYou: "आपके द्वारा संदेश",
    MessageFromChatGPT: "चैटजीपीटी से संदेश",
    Share: "शेयर करें ShareGPT को",
    Format: {
      Title: "निर्यात स्वरूप",
      SubTitle: "मार्कडाउन या पीएनजी छवि",
    },
    IncludeContext: {
      Title: "संदर्भ शामिल करें",
      SubTitle: "मास्क में संदर्भ प्रॉम्प्ट शामिल करें या न करें",
    },
    Steps: {
      Select: "चयन करें",
      Preview: "पूर्वावलोकन",
    },
    Image: {
      Toast: "छवि कैप्चरिंग...",
      Modal: "लॉन्ग प्रेस या दायाँ क्लिक करके छवि सहेजें",
    },
  },
  Select: {
    Search: "खोजें",
    All: "सभी का चयन करें",
    Latest: "नवीनतम का चयन करें",
    Clear: "साफ़ करें",
  },
  Memory: {
    Title: "स्मृति प्रॉम्प्ट",
    EmptyContent: "अबतक कुछ नहीं।",
    Send: "स्मृति भेजें",
    Copy: "स्मृति कॉपी करें",
    Reset: "सत्र रीसेट करें",
    ResetConfirm:
      "रीसेट करने पर वर्तमान वार्ताकार इतिहास और ऐतिहासिक स्मृति को साफ कर दिया जाएगा। क्या आप वाकई रीसेट करना चाहते हैं?",
  },
  Home: {
    NewChat: "नई चैट",
    DeleteChat: "चयनित वार्ताकार को हटाने की पुष्टि करें?",
    DeleteToast: "चैट हटा दिया गया",
    Revert: "वापस लाएँ",
  },
  Settings: {
    Title: "सेटिंग्स",
    SubTitle: "सभी सेटिंग्स",
    Danger: {
      Reset: {
        Title: "सभी सेटिंग्स को रीसेट करें",
        SubTitle: "सभी सेटिंग आइटम को डिफ़ॉल्ट पर रीसेट करें",
        Action: "रीसेट",
        Confirm: "क्या आप सभी सेटिंग्स को डिफ़ॉल्ट पर रीसेट करने की पुष्टि करना चाहते हैं?",
      },
      Clear: {
        Title: "सभी डेटा को साफ करें",
        SubTitle: "सभी संदेशों और सेटिंग्स को साफ करें",
        Action: "साफ करें",
        Confirm: "क्या आप सभी संदेशों और सेटिंग्स को साफ करने की पुष्टि करना चाहते हैं?",
      },
    },
    Lang: {
      Name: "भाषा", // ATTENTION: if you wanna add a new translation, please do not translate this value, leave it as `Language`
      All: "सभी भाषाएँ",
    },
    Avatar: "अवतार",
    FontSize: {
      Title: "फ़ॉन्ट साइज",
      SubTitle: "चैट सामग्री के फ़ॉन्ट साइज को समायोजित करें",
    },
    InjectSystemPrompts: {
      Title: "सिस्टम प्रॉम्प्ट इंजेक्ट करें",
      SubTitle: "प्रत्येक अनुरोध के लिए एक वैश्विक सिस्टम प्रॉम्प्ट इंजेक्ट करें",
    },
    InputTemplate: {
      Title: "इनपुट टेम्प्लेट",
      SubTitle: "नवीनतम संदेश को इस टेम्प्लेट में भर दिया जाएगा",
    },
  Update: {
    Version: (x: string) => `संस्करण: ${x}`,
    IsLatest: "नवीनतम संस्करण",
    CheckUpdate: "संस्करण की जाँच करें",
    IsChecking: "संस्करण की जाँच की जा रही है...",
    FoundUpdate: (x: string) => `नए संस्करण पाया गया है: ${x}`,
    GoToUpdate: "अपड,
  },
    SendKey: "कुंजी भेजें",
    Theme: "थीम",
    TightBorder: "टाइट बॉर्डर",
    SendPreviewBubble: {
    Title: "पूर्वावलोकन बबल भेजें",
    SubTitle: "बबल में मार्कडाउन पूर्वावलोकन करें",
    },
    AutoGenerateTitle: {
    Title: "स्वच्छ सिरबंध शीर्षक उत्पन्न करें",
    SubTitle: "वार्तालाप सामग्री के आधार पर एक उपयुक्त शीर्षक उत्पन्न करें",
    },
    Sync: {
      CloudState: "अंतिम अपडेट",
      NotSyncYet: "अब तक सिंक नहीं हुआ है",
      Success: "सिंक सफलता",
      Fail: "सिंक विफलता",

      Config: {
        Modal: {
          Title: "कॉन्फ़िग सिंक",
          Check: "कनेक्शन जाँचें",
        },
        SyncType: {
          Title: "सिंक प्रकार",
          SubTitle: "अपने पसंदीदा सिंक सेवा का चयन करें",
        },
        Proxy: {
          Title: "CORS प्रॉक्सी सक्षम करें",
          SubTitle: "क्रॉस-ओरिजिन प्रतिबंधों से बचने के लिए प्रॉक्सी सक्षम करें",
        },
        ProxyUrl: {
          Title: "प्रॉक्सी अंतरबिंदु",
          SubTitle:
            "केवल इस परियोजना के लिए बने CORS प्रॉक्सी के लिए लागू होता है",
        },

        WebDav: {
          Endpoint: "WebDAV अंतरबिंदु",
          UserName: "उपयोगकर्ता नाम",
          Password: "पासवर्ड",
        },

        UpStash: {
          Endpoint: "UpStash Redis REST URL",
          UserName: "बैकअप नाम",
          Password: "UpStash Redis REST टोकन",
        },
      },

      LocalState: "स्थानीय डेटा",
      Overview: (overview: any) => {
        return `${overview.chat} चैट, ${overview.message} संदेश, ${overview.prompt} प्रॉम्प्ट, ${overview.mask} मास्क`;
      },
      ImportFailed: "फ़ाइल से आयात करने में विफल रहा",
    },
    Mask: {
      Splash: {
        Title: "मास्क स्प्लैश स्क्रीन",
        SubTitle: "नए चैट शुरू करने से पहले एक मास्क स्प्लैश स्क्रीन दिखाएं",
      },
      Builtin: {
        Title: "स्वच्छ सिस्टम प्रॉम्प्ट छिपाएँ",
        SubTitle: "मास्क सूची में स्वच्छ सिस्टम प्रॉम्प्ट छिपाएँ",
      },
    },
    Prompt: {
      Disable: {
        Title: "स्वच्छ सिस्टम प्रॉम्प्ट छिपाएँ",
        SubTitle: "स्वच्छ सिस्टम प्रॉम्प्ट को चैट में दिखाने के लिए नहीं दिखाएँ",
      },
      List: "प्रॉम्प्ट सूची",
      ListCount: (builtin: number, custom: number) =>
        `${builtin} बिल्ट-इन, ${custom} उपयोगकर्ता परिभाषित`,
      Edit: "संपादन करें",
      Modal: {
        Title: "प्रॉम्प्ट सूची",
        Add: "एक जोड़ें",
        Search: "प्रॉम्प्ट्स खोजें",
      },
      EditModal: {
        Title: "प्रॉम्प्ट संपादन",
      },
    },
    HistoryCount: {
      Title: "संलग्न संदेश गणना",
      SubTitle: "प्रत्येक अनुरोध में संलग्न किए गए संदेशों की संख्या",
    },
    CompressThreshold: {
      Title: "इतिहास संक्षेप दर्जा",
      SubTitle:
        "संपीडित संदेश लंबाई दर्जा से अधिक होने पर संक्षेपित होगा",
    },
    Token: {
      Title: "API कुंजी",
      SubTitle: "पहुंच कोड सीमा को नजरअंदाज करने के लिए अपनी कुंजी का उपयोग करें",
      Placeholder: "OpenAI API कुंजी",
    },
    Usage: {
      Title: "खाता शेष",
      SubTitle(used: any, total: any) {
        return `इस महीने $${used} उपयोग किया, सदस्यता $${total}`;
      },
      IsChecking: "जाँच रहा है...",
      Check: "जाँच करें",
      NoAccess: "शेष जाँचने के लिए API कुंजी दर्ज करें",
    },
    AccessCode: {
      Title: "पहुंच कोड",
      SubTitle: "पहुंच नियंत्रण सक्षम है",
      Placeholder: "पहुंच कोड चाहिए",
    },
    Endpoint: {
      Title: "अंतरबिंदु",
      SubTitle: "स्वच्छ अंतरबिंदु केवल http(s):// से शुरू होना चाहिए",
    },
    CustomModel: {
      Title: "कस्टम मॉडल",
      SubTitle: "अतिरिक्त मॉडल विकल्प जोड़ें, कॉमा से अलग करें",
    },
    Model: "मॉडल",
    Temperature: {
      Title: "तापमान",
      SubTitle: "अधिक मॉडल आउटपुट को और अक्षरिक बनाता है",
    },
    TopP: {
      Title: "शीर्ष P",
      SubTitle: "कृपया तापमान के साथ इसे नहीं बदलें",
    },
    MaxTokens: {
      Title: "अधिकतम टोकन",
      SubTitle: "इनपुट टोकन और उत्पन्न टोकन की अधिकतम लंबाई",
    },
    PresencePenalty: {
      Title: "उपस्थिति जुर्माना",
      SubTitle:
        "अधिक मूल्य नई विषयों के बारे में बात करने के संभावना को बढ़ा देता है",
    },
    FrequencyPenalty: {
      Title: "स्वरूप जुर्माना",
      SubTitle: "अधिक मूल्य एक ही पंक्ति को दोहराने की संभावना को कम कर देता है",
    },
  },
  Store: {
    DefaultTopic: "नई बातचीत",
    BotHello: "नमस्ते! आज मैं आपकी कैसे सहायता कर सकता हूँ?",
    Error: "कुछ गलत हो गया, कृपया बाद में पुनः प्रयास करें।",
    Prompt: {
      History: (content: string) =>
        "यह चैट इतिहास का संक्षेप है: " + content,
      Topic:
        "कृपया हमारे वार्तालाप का संक्षेप बिना किसी प्रस्ताव, विराम, उद्धरण, अवधान, नकली चिन्ह, अंक या अतिरिक्त पाठ के किसी चार से पांच शब्दों में तैयार करें। आलंब उद्धरण हटाएं।",
      Summarize:
        "200 शब्दों या उससे कम में चर्चा का संक्षेप करें, भविष्य के संदर्भ के लिए प्रॉम्प्ट के रूप में उपयोग करने के लिए।",
    },
  },
  Copy: {
    Success: "क्लिपबोर्ड पर कॉपी किया गया",
    Failed: "कॉपी विफल, कृपया क्लिपबोर्ड एक्सेस की अनुमति दें",
  },
  Download: {
    Success: "सामग्री आपके निर्देशिका में डाउनलोड की गई है।",
    Failed: "डाउनलोड में विफल रहा।",
  },
  Context: {
    Toast: (x: any) => `${x} संदर्भक प्रॉम्प्ट्स के साथ`,
    Edit: "वर्तमान चैट सेटिंग्स",
    Add: "प्रॉम्प्ट जोड़ें",
    Clear: "संदर्भ हटाएं",
    Revert: "पूर्ववत करें",
  },
  Plugin: {
    Name: "प्लगइन",
  },
  FineTuned: {
    Sysmessage: "आप एक सहायक हैं जो",
  },
  Mask: {
    Name: "मास्क",
    Page: {
      Title: "प्रॉम्प्ट टेम्पलेट",
      SubTitle: (count: number) => `${count} प्रॉम्प्ट टेम्पलेट`,
      Search: "टेम्पलेट खोजें",
      Create: "बनाएँ",
    },
    Item: {
      Info: (count: number) => `${count} प्रॉम्प्ट`,
      Chat: "चैट",
      View: "देखें",
      Edit: "संपादन करें",
      Delete: "हटाएं",
      DeleteConfirm: "हटाने की पुष्टि करें?",
    },
    EditModal: {
      Title: (readonly: boolean) =>
        `प्रॉम्प्ट टेम्पलेट संपादित करें ${readonly ? "(केवल पठन)" : ""}`,
      Download: "डाउनलोड",
      Clone: "क्लोन",
    },
    Config: {
      Avatar: "बोट अवतार",
      Name: "बोट नाम",
      Sync: {
        Title: "वैश्विक कॉन्फ़िग का उपयोग करें",
        SubTitle: "इस चैट में वैश्विक कॉन्फ़िग का उपयोग करें",
        Confirm: "कस्टम कॉन्फ़िग को वैश्विक कॉन्फ़िग के साथ ओवरराइड करने की पुष्टि करें?",
      },
      HideContext: {
        Title: "संदर्भ प्रॉम्प्ट छिपाएं",
        SubTitle: "चैट में संदर्भ प्रॉम्प्ट दिखाने में विफल रहें",
      },
      Share: {
        Title: "इस मास्क को साझा करें",
        SubTitle: "इस मास्क के लिए एक लिंक उत्पन्न करें",
        Action: "लिंक कॉपी करें",
      },
    },
  },
  NewChat: {
    Return: "वापस जाएं",
    Skip: "बस शुरू करें",
    Title: "एक मास्क चुनें",
    SubTitle: "मास्क के पीछे स्वरूप के साथ चैट करें",
    More: "और खोजें",
    NotShow: "कभी फिर मत दिखाएं",
    ConfirmNoShow: "अक्षम करने की पुष्टि करें? आप इसे सेटिंग्स में बाद में सक्षम कर सकते हैं।",
  },
  UI: {
    Confirm: "पुष्टि करें",
    Cancel: "रद्द करें",
    Close: "बंद करें",
    Create: "बनाएं",
    Edit: "संपादित करें",
    Export: "निर्यात",
    Import: "आयात",
    Sync: "सिंक",
    Config: "कॉन्फ़िगरेशन",
  },
  Exporter: {
    Model: "मॉडल",
    Messages: "संदेश",
    Topic: "विषय",
    Time: "समय",
  },
  URLCommand: {
    Code: "URL से पहुंच कोड का पता लगाया गया, पुष्टि करने के लिए?",
    Settings: "URL से सेटिंग्स का पता लगाया गया, पुष्टि करने के लिए?",
  },
};

};

export default hi;
