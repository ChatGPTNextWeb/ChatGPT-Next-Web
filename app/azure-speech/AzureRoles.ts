export enum AzureRoles {
  TTSAvatar = "Text-to-Speech Avatar",
  LiveChatAvatar = "Live chat Avatar",
  VoiceCall = "Voice Call",
}

export enum EAzureLanguages {
  EnglishUnitedStates = "English (United States)",
  ChineseMandarinSimplified = "Chinese (Mandarin, Simplified)",
}

export const AzureLanguageToCountryMap: Record<string, string> = {
  [EAzureLanguages.ChineseMandarinSimplified]: "zh-CN",
  [EAzureLanguages.EnglishUnitedStates]: "en-US",
};

export const AzureLanguageToWelcomeMap: Record<string, string> = {
  [EAzureLanguages.ChineseMandarinSimplified]:
    "您好, 我是Speech Copilot, 您可以问我任何问题",
  [EAzureLanguages.EnglishUnitedStates]:
    "Hello, I'm Speech Copilot. What can i do for you.",
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
  ],
};

export const AvatarDefaultLanguage = Object.keys(
  AzureAvatarLanguageToVoiceMap,
)[0];

export class AzureTTSAvatarInput {
  InputText: string = "";
  VideoSrc: string = "";
  AudioSrc: string = "";
  Language: string = AvatarDefaultLanguage;
  VoiceNumber: number = 0;
}
