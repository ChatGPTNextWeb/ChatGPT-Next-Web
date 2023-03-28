import CN from './cn'
import EN from './en'
import TW from './tw'

export type { LocaleType } from './cn'

type Lang = 'en' | 'cn' | 'tw'

const LANG_KEY = 'lang'

function getItem(key: string) {
    try {
        return localStorage.getItem(key)
    } catch {
        return null
    }
}

function setItem(key: string, value: string) {
    try {
        localStorage.setItem(key, value)
    } catch { }
}

function getLanguage() {
    try {
        return navigator.language.toLowerCase()
    } catch {
        return 'cn'
    }
}

export function getLang(): Lang {
    const savedLang = getItem(LANG_KEY)

    if (['en', 'cn', 'tw'].includes(savedLang ?? '')) {
        return savedLang as Lang
    }

    const lang = getLanguage()

    if (lang.includes('zh') || lang.includes('cn')) {
        return 'cn'
    } else if (lang.includes('tw')) {
        return 'tw'
    } else {
        return 'en'
    }
}

export function changeLang(lang: Lang) {
    setItem(LANG_KEY, lang)
    location.reload()
}

export default { en: EN, cn: CN, tw: TW }[getLang()]