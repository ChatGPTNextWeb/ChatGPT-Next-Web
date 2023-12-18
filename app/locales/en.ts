import { SubmitKey } from "../store/config";
import { LocaleType } from "./index";

const en: LocaleType = {
  WIP: "Coming Soon...",
  Error: {
    Unauthorized:
      "Unauthorized access, please enter access code in [auth](/#/auth) page.",
  },
  Auth: {
    Title: "Need Access Code",
    Tips: "Please enter access code below",
    Input: "access code",
    Confirm: "Confirm",
    Later: "Later",
  },
  ChatItem: {
    ChatItemCount: (count: number) => `${count} messages`,
  },
  Chat: {
    SubTitle: (count: number) => `${count} messages`,
    Actions: {
      ChatList: "Go To Chat List",
      CompressedHistory: "Compressed History Memory Prompt",
      Export: "Export All Messages as Markdown",
      Copy: "Copy",
      Stop: "Stop",
      Retry: "Retry",
      Pin: "Pin",
      PinToastContent: "Pinned 2 messages to contextual prompts",
      PinToastAction: "View",
      Delete: "Delete",
      Edit: "Edit",
      Play: "Play",
      AudioPlay: "AudioPlay",
      VideoPlay: "VideoPlay",
    },
    Commands: {
      new: "Start a new chat",
      newm: "Start a new chat with mask",
      next: "Next Chat",
      prev: "Previous Chat",
      clear: "Clear Context",
      del: "Delete Chat",
    },
    InputActions: {
      Stop: "Stop",
      ToBottom: "To Latest",
      Theme: {
        auto: "Auto",
        light: "Light Theme",
        dark: "Dark Theme",
      },
      Prompt: "Prompts",
      Masks: "Masks",
      Clear: "Clear Context",
      Settings: "Settings",
    },
    Rename: "Rename Chat",
    Typing: "Typing…",
    Input: (submitKey: string) => {
      var inputHints = `${submitKey} to send`;
      if (submitKey === String(SubmitKey.Enter)) {
        inputHints += ", Shift + Enter to wrap";
      }
      return inputHints + ", / to search prompts, : to use commands";
    },
    Send: "Send",
    Config: {
      Reset: "Reset to Default",
      SaveAs: "Save as Mask",
    },
  },
  Export: {
    Title: "Export Messages",
    Copy: "Copy All",
    Download: "Download",
    MessageFromYou: "Message From You",
    MessageFromChatGPT: "Message From ChatGPT",
    Share: "Share to ShareGPT",
    Format: {
      Title: "Export Format",
      SubTitle: "Markdown or PNG Image",
    },
    IncludeContext: {
      Title: "Including Context",
      SubTitle: "Export context prompts in mask or not",
    },
    Steps: {
      Select: "Select",
      Preview: "Preview",
    },
  },
  Select: {
    Search: "Search",
    All: "Select All",
    Latest: "Select Latest",
    Clear: "Clear",
  },
  Memory: {
    Title: "Memory Prompt",
    EmptyContent: "Nothing yet.",
    Send: "Send Memory",
    Copy: "Copy Memory",
    Reset: "Reset Session",
    ResetConfirm:
      "Resetting will clear the current conversation history and historical memory. Are you sure you want to reset?",
  },
  Home: {
    NewChat: "New Chat",
    MaskChat: "Role Chat",
    DeleteChat: "Confirm to delete the selected conversation?",
    DeleteToast: "Chat Deleted",
    Revert: "Revert",
  },
  Settings: {
    Title: "Settings",
    SubTitle: "All Settings",

    UserLogin: {
      Title: "Logged in",
      Button: "To User Center",
      LoginCenter: {
        Title: "User Center",
        Email: {
          Title: "Email*",
        },
        NickName: {
          Title: "Nick Name*",
        },
        Occupation: {
          Title: "Occupation*",
        },
        Avatar: {
          Title: "Avatar*",
        },
        Inviter: {
          Title: "Inviter",
        },
        SaveButton: "Save",
        SubmitButton: "Login out",
        SubmitToast: {
          NullNickName: "NickName can not be empty",
          NullOccupation: "Occupation can not be empty",
          Success: "Update Success",
          Failed: "Update Failed, please try again",
          NotRegister: "Current not register",
          NotLogin: "Current not login",
          LoginOut: "Login out success",
        },
      },
    },
    UserNotLogin: {
      Title: "Not logged in",
      Button: "Login/Register",
      LoginCenter: {
        Title: "User Login Center",
        Email: {
          Title: "Email*",
        },
        EmailVerify: {
          Title: "Email Verify Code*",
          Button: "Send Verify Code",
        },
        LoginButton: "Login",
        RegisterButton: "Register",
        LoginToast: {
          Success: "Login Success",
          Failed: "Login Failed, please try again",
          NotRegister: "Current not register",
          EmailInvalid: "Email format error, please re-enter",
          EmailVerifyInvalid: "Email verify code error, please re-enter",
          EmailEmpty: "Email can not be empty",
          EmailVerifyEmpty: "Email verify code can not be empty",
        },
      },
      RegisterCenter: {
        Title: "User Register Center",
        Email: {
          Title: "Email*",
        },
        EmailVerify: {
          Title: "Email Verify Code*",
          Button: "Send Verify Code",
        },
        NickName: {
          Title: "Nick Name*",
        },
        Occupuation: {
          Title: "Occupuation*",
        },
        Inviter: {
          Title: "Inviter Email",
          SubTitle: (baseCoins: number) =>
            `Optional, both inviter and invitee can earn ${baseCoins} AI coins`,
        },
        RegisterButton: "Register",
        RegisterToast: {
          Success: "Register successful, welcome back!",
          Failed: "Register failed, please try again",
          HasRegister: "This email has been registered, please login",
          EmailInvalid: "Email format error, please re-enter",
          EmailVerifyInvalid: "Email verify code error, please re-enter",
          EmailEmpty: "Email can not be empty",
          EmailVerifyEmpty: "Email verify code can not be empty",
          NickNameEmpty: "NickName can not be empty",
          OccupationEmpty: "Occupation can not be empty",
        },
      },
    },
    UserBalance: {
      Title: "Account Balance",
      Button: "To Balance Center",
      BalanceCenter: {
        Title: "Balance Center",
        AccountBalance: {
          Title: "Account Balance",
          BaseCoins: {
            Title: "Base AI Coins",
            SubTitle: "(Not clear)",
          },
          LimitCoins: {
            Title: "Time AI Coins",
            SubTitle: "(1 day clear)",
          },
          TotalDialogs: {
            Title: "Total Dialogs",
            SubTitle:
              "(Each conversation costs 1 AI coin, time coins first, then base coins)",
          },
          TotalSignDays: {
            Title: "Total Sign Days",
            SubTitle: (baseCoins: number, limitCoins: number) =>
              `Sign in daily to receive ${baseCoins} basic AI coins and ${limitCoins} time AI coins`,
          },
        },
        SignState: {
          Signed: {
            Title: "Today's Sign State",
            State: "Signed",
            Button: "",
          },
          NotSigned: {
            Title: "Today's Sign State",
            State: "Not Signed",
            Button: "To Sign",
          },
          SignToast: {
            Success: "Sign in successfully",
            Failed: "Sign in failed, please try again",
            NotRegister: "Current not register",
            HasSigned: "Today has signed",
          },
        },
        CoinDescription: {
          Title: "AI Coins Description",
          Rule1: "- New users are given 20 base AI coins when they sign up",
          Rule2:
            "- When inviting users, both the inviter and the invitee are given 5 base AI coins",
        },
      },
    },
    AvatarVideo: {
      Title: "Avatar Video",
      MaxWords: {
        Title: "Avatar Video Max Words",
        SubTitle:
          "The max words played during the video generation. -1 indicates the unlimited number of words. Note: 1 word costs 1 AI coin",
      },
      PreviewCost: {
        Title: "Avatar Video Preview cost",
        SubTitle:
          "When the avatar video is generated, to popup preview of the cost of AI coins. This can be turned off/on in ·Settings·",
      },
    },
    About: {
      Title: "About",
      Button: "To About",
      Introduction: (appTitle: string) =>
        `
      Welcome to ${appTitle}!

      ${appTitle} is developed based on GPT3.5 and is primarily used to assist with speeches, such as impromptu speeches and prepared speeches.
      
      We highly prioritize user privacy and data security. When using ${appTitle}, we do not store or analyze user chat records in the background.
      
      If you have any questions or suggestions, please feel free to contact us through · Settings -> Feedback ·. We will respond as soon as possible.
      `,
    },
    FeedBack: {
      Title: "Feedback",
      Button: "To Feedback",
      FeedBackCenter: {
        Title: "Feedback Center",
        Email: "Email*",
        Head: "Title*",
        Description: "Details*",
        Phone: "Phone",
        SubmitButton: "Submit",
        FeedBackToast: {
          Success: "Feedback successful",
          Failed: "Feedback failed, please try again",
          EmailInvalid: "Email format error, please re-enter",
          EmailEmpty: "Email can not be empty",
          HeadEmpty: "Title can not be empty",
          DescriptionEmpty: "Details can not be empty",
        },
      },
    },

    Danger: {
      Reset: {
        Title: "Reset All Settings",
        SubTitle: "Reset all setting items to default",
        Action: "Reset",
        Confirm: "Confirm to reset all settings to default?",
      },
      Clear: {
        Title: "Clear All Data",
        SubTitle: "Clear all messages and settings",
        Action: "Clear",
        Confirm: "Confirm to clear all messages and settings?",
      },
    },
    Lang: {
      Name: "Language", // ATTENTION: if you wanna add a new translation, please do not translate this value, leave it as `Language`
      SubName:
        "Only to affect UI show, not affect chat result, and not affect the mask role",
      All: "All Languages",
    },
    Avatar: "Avatar",
    FontSize: {
      Title: "Font Size",
      SubTitle: "Adjust font size of chat content",
    },

    InputTemplate: {
      Title: "Input Template",
      SubTitle: "Newest message will be filled to this template",
    },

    Update: {
      Version: (x: string) => `Version: ${x}`,
      IsLatest: "Latest version",
      CheckUpdate: "Check Update",
      IsChecking: "Checking update...",
      FoundUpdate: (x: string) => `Found new version: ${x}`,
      GoToUpdate: "Update",
    },
    SendKey: "Send Key",
    Theme: "Theme",
    TightBorder: "Tight Border",
    SendPreviewBubble: {
      Title: "Send Preview Bubble",
      SubTitle: "Preview markdown in bubble",
    },
    Mask: {
      Title: "Mask Splash Screen",
      SubTitle: "Show a mask splash screen before starting new chat",
    },
    Prompt: {
      Disable: {
        Title: "Disable auto-completion",
        SubTitle: "Input / to trigger auto-completion",
      },
      List: "Prompt List",
      ListCount: (builtin: number, custom: number) =>
        `${builtin} built-in, ${custom} user-defined`,
      Edit: "Edit",
      Modal: {
        Title: "Prompt List",
        Add: "Add One",
        Search: "Search Prompts",
      },
      EditModal: {
        Title: "Edit Prompt",
      },
    },
    HistoryCount: {
      Title: "Attached Messages Count",
      SubTitle: "Number of sent messages attached per request",
    },
    CompressThreshold: {
      Title: "History Compression Threshold",
      SubTitle:
        "Will compress if uncompressed messages length exceeds the value",
    },
    Token: {
      Title: "API Key",
      SubTitle: "Use your key to ignore access code limit",
      Placeholder: "OpenAI API Key",
    },
    Usage: {
      Title: "Account Balance",
      SubTitle(used: any, total: any) {
        return `Used this month $${used}, subscription $${total}`;
      },
      IsChecking: "Checking...",
      Check: "Check",
      NoAccess: "Enter API Key to check balance",
    },
    AccessCode: {
      Title: "Access Code",
      SubTitle: "Access control enabled",
      Placeholder: "Need Access Code",
    },
    Endpoint: {
      Title: "Endpoint",
      SubTitle: "Custom endpoint must start with http(s)://",
    },
    Model: "Model",
    Temperature: {
      Title: "Temperature",
      SubTitle: "A larger value makes the more random output",
    },
    TopP: {
      Title: "Top P",
      SubTitle: "Do not alter this value together with temperature",
    },
    MaxTokens: {
      Title: "Max Tokens",
      SubTitle: "Maximum length of input tokens and generated tokens",
    },
    PresencePenalty: {
      Title: "Presence Penalty",
      SubTitle:
        "A larger value increases the likelihood to talk about new topics",
    },
    FrequencyPenalty: {
      Title: "Frequency Penalty",
      SubTitle:
        "A larger value decreasing the likelihood to repeat the same line",
    },
  },
  Store: {
    DefaultTopic: "New Conversation",
    BotHello: "Hello! How can I assist you today?",
    Error: "Something went wrong, please try again later.",
    Prompt: {
      History: (content: string) =>
        "This is a summary of the chat history as a recap: " + content,
      Topic:
        "Please generate a four to five word title summarizing our conversation without any lead-in, punctuation, quotation marks, periods, symbols, or additional text. Remove enclosing quotation marks.",
      Summarize:
        "Summarize the discussion briefly in 200 words or less to use as a prompt for future context.",
    },
  },
  Copy: {
    Success: "Copied to clipboard",
    Failed: "Copy failed, please grant permission to access clipboard",
  },
  Context: {
    Toast: (x: any) => `With ${x} contextual prompts`,
    Edit: "Current Chat Settings",
    Add: "Add a Prompt",
    Clear: "Context Cleared",
    Revert: "Revert",
  },
  Plugin: {
    Name: "Plugin",
  },
  Mask: {
    Name: "Mask",
    Page: {
      Title: "Prompt Template",
      SubTitle: (count: number) => `${count} prompt templates`,
      Search: "Search Templates",
      Create: "Create",
    },
    Item: {
      Info: (count: number) => `${count} prompts`,
      Chat: "Chat",
      View: "View",
      Edit: "Edit",
      Delete: "Delete",
      DeleteConfirm: "Confirm to delete?",
    },
    EditModal: {
      Title: (readonly: boolean) =>
        `Edit Prompt Template ${readonly ? "(readonly)" : ""}`,
      Download: "Download",
      Clone: "Clone",
    },
    Config: {
      Avatar: "Bot Avatar",
      Name: "Bot Name",
      Sync: {
        Title: "Use Global Config",
        SubTitle: "Use global config in this chat",
        Confirm: "Confirm to override custom config with global config?",
      },
      HideContext: {
        Title: "Hide Context Prompts",
        SubTitle: "Do not show in-context prompts in chat",
      },
    },
  },
  NewChat: {
    Return: "Return",
    Skip: "Just Start",
    Title: "Pick a Mask",
    SubTitle: "Chat with the Soul behind the Mask",
    More: "Find More",
    NotShow: "Never Show Again",
    ConfirmNoShow: "Confirm to disable？You can enable it in settings later.",
  },

  UI: {
    Confirm: "Confirm",
    Cancel: "Cancel",
    Close: "Close",
    Create: "Create",
    Edit: "Edit",
  },
  Exporter: {
    Model: "Model",
    Messages: "Messages",
    Topic: "Topic",
    Time: "Time",
  },
};

export default en;
