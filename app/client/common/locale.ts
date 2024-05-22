import { Lang, getLang } from "@/app/locales";

interface PlainConfig {
  [k: string]: PlainConfig | string;
}

export type LocaleMap<
  TextPlainConfig extends PlainConfig,
  Default extends Lang,
> = Partial<Record<Lang, TextPlainConfig>> & {
  [name in Default]: TextPlainConfig;
};

export function getLocaleText<
  TextPlainConfig extends PlainConfig,
  DefaultLang extends Lang,
>(textMap: LocaleMap<TextPlainConfig, DefaultLang>, defaultLang: DefaultLang) {
  return textMap[getLang()] || textMap[defaultLang];
}
