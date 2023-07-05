import { SubmitKey } from "../store/config";
import { RequiredLocaleType } from "./index";

const bn: RequiredLocaleType = {
  WIP: "শীঘ্রই আসছে...",
  Error: {
    Unauthorized:
      "অননুমোদিত অ্যাক্সেস, দয়া করে [অথোরিটি](/#/auth) পৃষ্ঠায় অ্যাক্সেস কোড ইনপুট করুন।",
  },
  Auth: {
    Title: "অ্যাক্সেস কোড প্রয়োজন",
    Tips: "নীচে অ্যাক্সেস কোড ইনপুট করুন",
    Input: "অ্যাক্সেস কোড",
    Confirm: "কনফার্ম",
    Later: "পরে",
  },
  ChatItem: {
    ChatItemCount: (count: number) => `${count} মেসেজ`,
  },
  Chat: {
    SubTitle: (count: number) => `${count} মেসেজ ChatGPT সঙ্গে`,
    Actions: {
      ChatList: "চ্যাট লিস্টে যান",
      CompressedHistory: "সংক্ষিপ্ত ইতিহাস মেমোরি প্রম্পট",
      Export: "সমস্ত মেসেজ মার্কডাউন হিসাবে এক্সপোর্ট করুন",
      Copy: "অনুলিপি",
      Stop: "বন্ধ করুন",
      Retry: "পুনরায় চেষ্টা করুন",
      Delete: "মুছে ফেলুন",
    },
    InputActions: {
      Stop: "বন্ধ করুন",
      ToBottom: "সর্বশেষে যান",
      Theme: {
        auto: "স্বয়ংক্রিয়",
        light: "হালকা থিম",
        dark: "ডার্ক থিম",
      },
      Prompt: "প্রম্পট",
      Masks: "মাস্ক",
      Clear: "সংকেত সাফ করুন",
      Settings: "সেটিংস",
    },
    Rename: "চ্যাটের নাম পরিবর্তন করুন",
    Typing: "টাইপ হচ্ছে...",
    Input: (submitKey: string) => {
      var inputHints = `${submitKey} পাঠানোর জন্য`;
      if (submitKey === String(SubmitKey.Enter)) {
        inputHints += ", ওয়ার্প করার জন্য Shift + Enter";
      }
      return inputHints + ", / প্রম্পট অনুসন্ধান করতে";
    },
    Send: "পাঠান",
    Config: {
      Reset: "ডিফল্টে পুনরায় সেট করুন",
      SaveAs: "মাস্ক হিসাবে সংরক্ষণ করুন",
    },
  },
  Export: {
    Title: "মেসেজ এক্সপোর্ট করুন",
    Copy: "সমস্ত অনুলিপি করুন",
    Download: "ডাউনলোড করুন",
    MessageFromYou: "আপনার মেসেজ",
    MessageFromChatGPT: "TheChatGPT থেকে মেসেজ",
    Share: "কিয়াস্ক শেয়ার এ শেয়ার করুন",
    Format: {
      Title: "এক্সপোর্ট ফর্ম্যাট",
      SubTitle: "মার্কডাউন বা পিএনজি ইমেজ",
    },
    IncludeContext: {
      Title: "সংশ্লিষ্ট প্রম্পট অন্তর্ভুক্ত করুন",
      SubTitle: "মাস্কে সংশ্লিষ্ট প্রম্পট নির্যাতন করুন কিনা",
    },
    Steps: {
      Select: "নির্বাচন করুন",
      Preview: "পূর্বরূপ",
    },
  },
  Select: {
    Search: "অনুসন্ধান করুন",
    All: "সব নির্বাচন করুন",
    Latest: "সর্বশেষ নির্বাচন করুন",
    Clear: "সাফ করুন",
  },
  Memory: {
    Title: "মেমোরি প্রম্পট",
    EmptyContent: "এখনও কিছুই নেই।",
    Send: "মেমোরি পাঠান",
    Copy: "মেমোরি অনুলিপি করুন",
    Reset: "সেশন পুনরায় সেট করুন",
    ResetConfirm:
      "রিসেট করলে বর্তমান চ্যাট ইতিহাস এবং ঐতিহাসিক মেমোরি সাফ হয়ে যাবে। আপনি কি নিশ্চিত যে আপনি রিসেট করতে চান?",
  },
  Home: {
    NewChat: "নতুন চ্যাট",
    DeleteChat: "নির্বাচিত কনভার্সেশন মুছতে নিশ্চিত করুন?",
    DeleteToast: "চ্যাট মুছে ফেলা হয়েছে",
    Revert: "পূর্ববর্তী অবস্থানে ফিরে যান",
  },
  Settings: {
    Title: "সেটিংস",
    SubTitle: "সমস্ত সেটিংস",
    Actions: {
      ClearAll: "সমস্ত ডেটা সাফ করুন",
      ResetAll: "সমস্ত সেটিংস পুনরায় সেট করুন",
      Close: "বন্ধ করুন",
      ConfirmResetAll: "আপনি কি নিশ্চিত যে আপনি সমস্ত কনফিগারেশন পুনরায় সেট করতে চান?",
      ConfirmClearAll: "আপনি কি নিশ্চিত যে আপনি সমস্ত ডেটা পুনরায় সেট করতে চান?",
    },
    Lang: {
      Name: "বাংলা", // ATTENTION: if you wanna add a new translation, please do not translate this value, leave it as `Language`
      All: "সমস্ত ভাষা",
    },
    Avatar: "অবতার",
    FontSize: {
      Title: "ফন্ট সাইজ",
      SubTitle: "চ্যাটের সন্তুষ্টির ফন্ট সাইজ সংযোজন করুন",
    },
    Update: {
      Version: (x: string) => `সংস্করণ: ${x}`,
      IsLatest: "সর্বশেষ সংস্করণ",
      CheckUpdate: "আপডেট চেক করুন",
      IsChecking: "চেক করা হচ্ছে...",
      FoundUpdate: (x: string) => `নতুন সংস্করণ পাওয়া গেছে: ${x}`,
      GoToUpdate: "আপডেট করুন",
    },
    SendKey: "কী পাঠান",
    Theme: "থিম",
    TightBorder: "সঙ্গতিহীন বর্ডার",
    SendPreviewBubble: {
      Title: "পূর্বরূপ বুদ্ধিমান বুদ্ধি",
      SubTitle: "বুড়ি মধ্যে মার্কডাউন পূর্বরূপ প্রদর্শন করুন",
    },
    Mask: {
      Title: "মাস্ক স্প্ল্যাশ স্ক্রিন",
      SubTitle: "নতুন চ্যাট শুরু করার আগে একটি মাস্ক স্প্ল্যাশ স্ক্রিন দেখান",
    },
    Prompt: {
      Disable: {
        Title: "অটো-সম্পূর্ণতা অক্ষম করুন",
        SubTitle: "অটো-সম্পূর্ণতা চালু করতে / ইনপুট করুন",
      },
      List: "প্রম্পট তালিকা",
      ListCount: (builtin: number, custom: number) =>
        `${builtin} অভিন্নতম, ${custom} ব্যবহারকারী নির্ধারিত`,
      Edit: "সম্পাদন করুন",
      Modal: {
        Title: "প্রম্পট তালিকা",
        Add: "একটি যোগ করুন",
        Search: "প্রম্পট অনুসন্ধান করুন",
      },
      EditModal: {
        Title: "প্রম্পট সম্পাদনা করুন",
      },
    },
    HistoryCount: {
      Title: "সংযুক্ত মেসেজ সংখ্যা",
      SubTitle: "প্রতি অনুরোধে প্রেরিত মেসেজের সংখ্যা",
    },
    CompressThreshold: {
      Title: "ইতিহাস সংক্ষিপ্ত করার সীমা",
      SubTitle:
        "যদি অসংক্ষিপ্ত মেসেজের দৈর্ঘ্য এই মানের চেয়ে বেশি হয়",
    },
    Token: {
      Title: "API কী",
      SubTitle: "অ্যাক্সেস কোড সীমা উপেক্ষা করতে আপনার কী ব্যবহার করুন",
      Placeholder: "অপেনএআই এপিআই কী",
    },
    Usage: {
      Title: "অ্যাকাউন্ট ব্যালেন্স",
      SubTitle(used: any, total: any) {
        return `মাসে ব্যবহৃত $${used}, সাবস্ক্রিপশন $${total}`;
      },
      IsChecking: "চেক করা হচ্ছে...",
      Check: "চেক করুন",
      NoAccess: "ব্যালেন্স চেক করতে API কী প্রবেশ করুন",
    },
    AccessCode: {
      Title: "অ্যাক্সেস কোড",
      SubTitle: "অ্যাক্সেস নিয়ন্ত্রণ সক্ষম",
      Placeholder: "অ্যাক্সেস কোড প্রয়োজন",
    },
    Endpoint: {
      Title: "এন্ডপয়েন্ট",
      SubTitle: "কাস্টম এন্ডপয়েন্ট একটি http(s):// দিয়ে শুরু হতে হবে",
    },
    Model: "মডেল",
    Temperature: {
      Title: "তাপমাত্রা",
      SubTitle: "বড় মান বেশি একটি যিনির্দিষ্ট আউটপুট তৈরি করে",
    },
    MaxTokens: {
      Title: "সর্বাধিক টোকেন",
      SubTitle: "ইনপুট টোকেন এবং জেনারেট টোকেনের সর্বাধিক দৈর্ঘ্য",
    },
    PresencePenalty: {
      Title: "উপস্থিতির জরিমানা",
      SubTitle: "বড় মান নতুন বিষয় সম্পর্কে কথা বলার সম্ভাবনা বাড়ায়",
    },
  },
  Store: {
    DefaultTopic: "নতুন কনভার্সেশন",
    BotHello: "হ্যালো! আমি আপনাকে কিভাবে সাহায্য করতে পারি?",
    Error: "কিছু ভুল হয়েছে, দয়া করে পরে আবার চেষ্টা করুন।",
    Prompt: {
      History: (content: string) =>
        "এটি একটি চ্যাট ইতিহাসের সংক্ষিপ্ত সংক্ষেপণ হিসাবে: " + content,
      Topic:
        "অনুগ্রহ করে আমাদের কথোপকথনটির সংক্ষেপের জন্য একটি চার থেকে পাঁচ শব্দের শিরোনাম তৈরি করুন যাতে কোনো প্রবেশদ্বার, বিরামচিহ্ন, উদ্ধৃতি চিহ্ন, পূর্ণবিরাম, প্রতীক অথবা অতিরিক্ত লেখা না থাকে। আবর্তনযোগ্য উদ্ধৃতি চিহ্ন সরান।",
      Summarize:
        "আসলে আলোচনাটি সংক্ষেপে সংক্ষিপ্তসারে বর্ণনা করুন, যা ভবিষ্যতে প্রম্পট হিসাবে ব্যবহার করা যাবে।",
    },
  },
  Copy: {
    Success: "ক্লিপবোর্ডে কপি করা হয়েছে",
    Failed: "কপি ব্যর্থ হয়েছে, দয়া করে ক্লিপবোর্ডে অ্যাক্সেসের অনুমতি প্রদান করুন",
  },
  Context: {
    Toast: (x: any) => `${x} সংযুক্তকালীন প্রম্পটসহ`,
    Edit: "সংযুক্তকালীন এবং মেমোরি প্রম্পটসমূহ",
    Add: "একটি প্রম্পট যোগ করুন",
    Clear: "সংকেত সাফ করুন",
    Revert: "পূর্ববর্তী অবস্থানে ফিরে যান",
  },
  Plugin: {
    Name: "প্লাগিন",
  },
  Mask: {
    Name: "মাস্ক",
    Page: {
      Title: "প্রম্পট টেমপ্লেট",
      SubTitle: (count: number) => `${count} প্রম্পট টেমপ্লেট`,
      Search: "টেমপ্লেট অনুসন্ধান করুন",
      Create: "তৈরি করুন",
    },
    Item: {
      Info: (count: number) => `${count} প্রম্পট`,
      Chat: "চ্যাট",
      View: "দেখুন",
      Edit: "সম্পাদন করুন",
      Delete: "মুছে ফেলুন",
      DeleteConfirm: "মুছে ফেলতে নিশ্চিত করুন?",
    },
    EditModal: {
      Title: (readonly: boolean) =>
        `প্রম্পট টেমপ্লেট সম্পাদনা করুন ${readonly ? "(পঠনযোগ্য)" : ""}`,
      Download: "ডাউনলোড করুন",
      Clone: "ক্লোন করুন",
    },
    Config: {
      Avatar: "বট অবতার",
      Name: "বটের নাম",
      Sync: {
        Title: "গ্লোবাল কনফিগ ব্যবহার করুন",
        SubTitle: "এই চ্যাটে গ্লোবাল কনফিগ ব্যবহার করুন",
        Confirm: "কাস্টম কনফিগগুলি গ্লোবাল কনফিগের সাথে পরিবর্তন করতে নিশ্চিত করুন?",
      },
      HideContext: {
        Title: "সংশ্লিষ্ট প্রম্পট লুকান",
        SubTitle: "চ্যাটে সংশ্লিষ্ট প্রম্পট দেখান না",
      },
    },
  },
  NewChat: {
    Return: "ফিরে যান",
    Skip: "শুধুমাত্র শুরু করুন",
    Title: "একটি মাস্ক নির্বাচন করুন",
    SubTitle: "মাস্কের পিছনে মনের চ্যাট করুন",
    More: "আরও খুঁজুন",
    NotShow: "আর প্রদর্শন করবেন না",
    ConfirmNoShow: "নিষ্ক্রিয় করতে নিশ্চিত করুন? পরে সেটিংসে এটি চালু করতে পারবেন।",
  },

  UI: {
    Confirm: "কনফার্ম",
    Cancel: "বাতিল",
    Close: "বন্ধ করুন",
    Create: "তৈরি করুন",
    Edit: "সম্পাদন করুন",
  },
};

export default bn;