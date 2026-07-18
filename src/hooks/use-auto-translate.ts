'use client'

import { useState, useCallback } from 'react'

interface TranslationResult {
  success: boolean
  original: string
  translated: string
  error?: string
}

/**
 * Hook للترجمة التلقائية من العربية إلى الإنجليزية
 */
export function useAutoTranslate() {
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const translate = useCallback(async (text: string): Promise<string | null> => {
    if (!text || text.trim().length === 0) {
      return null
    }

    setIsTranslating(true)
    setError(null)

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          sourceLanguage: 'ar',
          targetLanguage: 'en',
        }),
      })

      const data: TranslationResult = await response.json()

      if (!data.success) {
        setError(data.error || 'Translation failed')
        return null
      }

      return data.translated
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Translation error'
      setError(errorMessage)
      console.error('Translation error:', err)
      return null
    } finally {
      setIsTranslating(false)
    }
  }, [])

  return { translate, isTranslating, error }
}

export default useAutoTranslate
