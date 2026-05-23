'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Language, languageDirection } from './translations'
import t, { getNestedValue } from './translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  dir: 'rtl' | 'ltr'
  t: (key: string) => string
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'ar',
  setLanguage: () => {},
  dir: 'rtl',
  t: (key: string) => key,
  isRTL: true,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") return "ar"
    return (localStorage.getItem("language") as Language) || "ar"
  })

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
    // Update document direction
    document.documentElement.dir = languageDirection[lang]
    document.documentElement.lang = lang
  }, [])

  const dir = languageDirection[language]
  const isRTL = dir === 'rtl'

  // Translation function - supports dot notation like 'nav.dashboard'
  const translate = useCallback((key: string): string => {
    const langTranslations = t as unknown as Record<string, Record<string, string>>
    // Try direct key first
    if (langTranslations[key] && typeof langTranslations[key][language] === 'string') {
      return langTranslations[key][language]
    }
    // Try nested dot notation
    const value = getNestedValue(langTranslations as Record<string, unknown>, `${key}.${language}`)
    if (value !== `${key}.${language}`) {
      return value
    }
    // Fallback: return the key itself
    return key
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dir, t: translate, isRTL }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export { LanguageContext }



