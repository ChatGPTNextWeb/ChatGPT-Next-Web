export enum AzureRoles {
  TTSAvatar = "Text-to-Speech Avatar",
  LiveChatAvatar = "Live chat Avatar",
}

interface IAzureLanguageVoiceItem {
  Name: string;
  Voice: string;
}

export const AzureAvatarLanguageVoices: Record<
  string,
  IAzureLanguageVoiceItem[]
> = {
  "English (United States)": [
    {
      Name: "Jenny(Female)",
      Voice: "en-US-JennyNeural",
    },
    {
      Name: "Andrew(Male)",
      Voice: "en-US-AndrewNeural",
    },
  ],
  "Chinese (Mandarin, Simplified)": [
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

export const AvatarDefaultLanguage = Object.keys(AzureAvatarLanguageVoices)[0];

export class AzureTTSAvatarInput {
  Text: string = "";
  VideoSrc: string = "";
  AudioSrc: string = "";
  // Language: string = AvatarDefaultLanguage;
  // Voice: string =
}
