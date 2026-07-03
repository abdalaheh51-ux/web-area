'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, type Language, type TranslationKeys } from '@/lib/i18n'

interface LanguageContextType {
  lang: Language
  t: TranslationKeys
  dir: 'rtl' | 'ltr'
  toggleLanguage: () => void
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('ar')

  useEffect(() => {
    localStorage.setItem('webarea-lang', lang)
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    const stored = localStorage.getItem('webarea-lang') as Language | null
    if (stored && stored !== lang && (stored === 'ar' || stored === 'en')) {
      queueMicrotask(() => setLang(stored))
    }
  }, [lang])

  const setLanguage = (newLang: Language) => setLang(newLang)
  const toggleLanguage = () => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))
  const value: LanguageContextType = { lang, t: translations[lang], dir: lang === 'ar' ? 'rtl' : 'ltr', toggleLanguage, setLanguage }
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
