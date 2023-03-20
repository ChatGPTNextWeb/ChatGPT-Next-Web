import CN from './cn'
import EN from './en'

export type { LocaleType } from './cn'

type Lang = 'en' | 'cn'

const LANG_KEY = 'lang'
export function getLang(): Lang {
    const savedLang = localStorage?.getItem(LANG_KEY)

    if (['en', 'cn'].includes(savedLang ?? '')) {
        return savedLang as Lang
    }

    const lang = navigator.language.toLowerCase()

    if (lang.includes('zh') || lang.includes('cn')) {
        return 'cn'
    } else {
        return 'en'
    }
}

export function changeLang(lang: Lang) {
    localStorage.setItem(LANG_KEY, lang)
    location.reload()
}

export default { en: EN, cn: CN }[getLang()]