import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'

type Language = 'en' | 'vi'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Parse CSV data into a translations object
const parseTranslationsCsv = (csvText: string): Record<Language, Record<string, string>> => {
  const lines = csvText.trim().split('\n')
  
  const translations: Record<Language, Record<string, string>> = {
    en: {},
    vi: {}
  }

  for (let i = 1; i < lines.length; i++) {
    // Handle commas within quoted fields
    const row: string[] = []
    let currentField = ''
    let insideQuotes = false

    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j]

      if (char === '"') {
        insideQuotes = !insideQuotes
      } else if (char === ',' && !insideQuotes) {
        row.push(currentField.trim())
        currentField = ''
      } else {
        currentField += char
      }
    }
    row.push(currentField.trim())

    if (row.length >= 3) {
      const key = row[0]
      const enValue = row[1]
      const viValue = row[2]
      
      if (key) {
        translations.en[key] = enValue
        translations.vi[key] = viValue
      }
    }
  }

  return translations
}

let translationsCache: Record<Language, Record<string, string>> | null = null

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('appLanguage')
    return (saved as Language) || 'en'
  })

  const [translations, setTranslations] = useState<Record<Language, Record<string, string>> | null>(null)

  useEffect(() => {
    // Load and parse CSV file
    if (translationsCache) {
      setTranslations(translationsCache)
      return
    }

    fetch('/locales/translations.csv')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch translations: ${response.status}`)
        }
        return response.text()
      })
      .then(csvText => {
        const parsed = parseTranslationsCsv(csvText)
        translationsCache = parsed
        setTranslations(parsed)
      })
      .catch(error => {
        console.error('Failed to load translations CSV:', error)
        // Fallback to empty translations
        setTranslations({ en: {}, vi: {} })
      })
  }, [])

  const t = (key: string): string => {
    if (!translations) {
      return key
    }

    const value = translations[language][key]
    return value || key
  }

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('appLanguage', lang)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
