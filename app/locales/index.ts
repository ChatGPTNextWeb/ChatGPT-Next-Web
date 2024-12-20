import type { LocaleType } from './cn';
import { safeLocalStorage } from '@/app/utils';
import { merge } from '../utils/merge';
import ar from './ar';
import bn from './bn';
import cn from './cn';
import cs from './cs';
import de from './de';
import en from './en';
import es from './es';
import fr from './fr';
import id from './id';
import it from './it';
import jp from './jp';
import ko from './ko';
import no from './no';
import pt from './pt';
import ru from './ru';
import sk from './sk';
import tr from './tr';
import tw from './tw';

import vi from './vi';

export type { LocaleType, PartialLocaleType } from './cn';

const localStorage = safeLocalStorage();

const ALL_LANGS = {
  cn,
  en,
  tw,
  pt,
  jp,
  ko,
  id,
  fr,
  es,
  it,
  tr,
  de,
  vi,
  ru,
  cs,
  no,
  ar,
  bn,
  sk,
};

export type Lang = keyof typeof ALL_LANGS;

export const AllLangs = Object.keys(ALL_LANGS) as Lang[];

export const ALL_LANG_OPTIONS: Record<Lang, string> = {
  cn: '简体中文',
  en: 'English',
  pt: 'Português',
  tw: '繁體中文',
  jp: '日本語',
  ko: '한국어',
  id: 'Indonesia',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
  tr: 'Türkçe',
  de: 'Deutsch',
  vi: 'Tiếng Việt',
  ru: 'Русский',
  cs: 'Čeština',
  no: 'Nynorsk',
  ar: 'العربية',
  bn: 'বাংলা',
  sk: 'Slovensky',
};

const LANG_KEY = 'lang';
const DEFAULT_LANG = 'en';

const fallbackLang = en;
const targetLang = ALL_LANGS[getLang()] as LocaleType;

// if target lang missing some fields, it will use fallback lang string
merge(fallbackLang, targetLang);

export default fallbackLang as LocaleType;

function getItem(key: string) {
  return localStorage.getItem(key);
}

function setItem(key: string, value: string) {
  localStorage.setItem(key, value);
}

function getLanguage() {
  try {
    const locale = new Intl.Locale(navigator.language).maximize();
    const region = locale?.region?.toLowerCase();
    // 1. check region code in ALL_LANGS
    if (AllLangs.includes(region as Lang)) {
      return region as Lang;
    }
    // 2. check language code in ALL_LANGS
    if (AllLangs.includes(locale.language as Lang)) {
      return locale.language as Lang;
    }
    return DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

export function getLang(): Lang {
  const savedLang = getItem(LANG_KEY);

  if (AllLangs.includes((savedLang ?? '') as Lang)) {
    return savedLang as Lang;
  }

  return getLanguage();
}

export function changeLang(lang: Lang) {
  setItem(LANG_KEY, lang);
  location.reload();
}

export function getISOLang() {
  const isoLangString: Record<string, string> = {
    cn: 'zh-Hans',
    tw: 'zh-Hant',
  };

  const lang = getLang();
  return isoLangString[lang] ?? lang;
}

const DEFAULT_STT_LANG = 'zh-CN';
export const STT_LANG_MAP: Record<Lang, string> = {
  cn: 'zh-CN',
  en: 'en-US',
  pt: 'pt-BR',
  tw: 'zh-TW',
  jp: 'ja-JP',
  ko: 'ko-KR',
  id: 'id-ID',
  fr: 'fr-FR',
  es: 'es-ES',
  it: 'it-IT',
  tr: 'tr-TR',
  de: 'de-DE',
  vi: 'vi-VN',
  ru: 'ru-RU',
  cs: 'cs-CZ',
  no: 'no-NO',
  ar: 'ar-SA',
  bn: 'bn-BD',
  sk: 'sk-SK',
};

export function getSTTLang(): string {
  try {
    return STT_LANG_MAP[getLang()];
  } catch {
    return DEFAULT_STT_LANG;
  }
}
