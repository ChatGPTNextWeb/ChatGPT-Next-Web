export enum AzureRoles {
  TTSAvatar = "Text-to-Speech Avatar",
  LiveChatAvatar = "Live chat Avatar",
}

export const AzureAvatarLanguageVoices: Record<string, string[]> = {
  "English (United States)": ["Jenny(Female)", "Andrew(Male)"],
  "Chinese (Mandarin, Simplified)": ["Xiaoxiao(Female)", "Yunxi(Male)"],
};

export const AvatarDefaultLanguage = Object.keys(AzureAvatarLanguageVoices)[0];
// export const AvatarDefaultVoice = AzureAvatarLanguageVoices[AvatarDefaultLanguage][0];
