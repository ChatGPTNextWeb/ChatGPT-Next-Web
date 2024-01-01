export enum AzureRoles {
  TTSAvatar = "Text-to-Speech Avatar",
  LiveChatAvatar = "Live chat Avatar",
  VoiceCall = "Voice Call",
}

export enum EAzureLanguages {
  EnglishUnitedStates = "English(US)",
  ChineseMandarinSimplified = "中文(普通话)",
}

export const AzureLanguageToCountryMap: Record<string, string> = {
  [EAzureLanguages.EnglishUnitedStates]: "en-US",
  [EAzureLanguages.ChineseMandarinSimplified]: "zh-CN",
};

export const AzureLanguageToWelcomeMap: Record<string, string> = {
  [EAzureLanguages.EnglishUnitedStates]:
    "Hello, I'm Speech Copilot. What can i do for you.",
  [EAzureLanguages.ChineseMandarinSimplified]:
    "您好, 我是Speech Copilot, 您可以问我任何问题",
};

interface IAzureLanguageVoiceItem {
  Name: string;
  Voice: string;
}

export const AzureAvatarLanguageToVoiceMap: Record<
  string,
  IAzureLanguageVoiceItem[]
> = {
  [EAzureLanguages.EnglishUnitedStates]: [
    {
      Name: "Jenny(Female)",
      Voice: "en-US-JennyNeural",
    },
    {
      Name: "GuyNeural(Male)",
      Voice: "en-US-GuyNeural",
    },
    {
      Name: "AriaNeural(Female)",
      Voice: "en-US-AriaNeural",
    },
    {
      Name: "DavisNeural(Male)",
      Voice: "en-US-DavisNeural",
    },
    {
      Name: "AmberNeural(Female)",
      Voice: "en-US-AmberNeural",
    },
    {
      Name: "Andrew(Male)",
      Voice: "en-US-AndrewNeural",
    },
  ],
  [EAzureLanguages.ChineseMandarinSimplified]: [
    {
      Name: "Xiaoxiao(Female)",
      Voice: "zh-CN-XiaoxiaoNeural",
    },
    {
      Name: "Yunxi(Male)",
      Voice: "zh-CN-YunxiNeural",
    },
    {
      Name: "YunjianNeural(Male)",
      Voice: "zh-CN-YunjianNeural",
    },
    {
      Name: "XiaoyiNeural(Female)",
      Voice: "zh-CN-XiaoyiNeural",
    },
    {
      Name: "YunyangNeural(Male)",
      Voice: "zh-CN-YunyangNeural",
    },
    {
      Name: "XiaochenNeural(Female)",
      Voice: "zh-CN-XiaochenNeural",
    },
  ],
};

export class AzureTTSAvatarInput {
  InputText: string = "";
  VideoSrc: string = "";
  AudioSrc: string = "";
  Language: string = EAzureLanguages.EnglishUnitedStates;
  VoiceNumber: number = 0;
}
