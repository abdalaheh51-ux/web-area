'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

interface TranslationResult {
  success: boolean
  original: string
  translated: string
  error?: string
}

/**
 * Hook للترجمة التلقائية من العربية إلى الإنجليزية مع Debounce
 * يقوم بتأخير الترجمة قليلاً لتجنب الطلبات المتكررة أثناء الكتابة
 */
export function useAutoTranslateDebounced(delayMs = 800) {
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

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

  // Debounced version
  const debouncedTranslate = useCallback(
    (text: string, callback: (translated: string | null) => void) => {
      // Clear previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      // Set new timer
      debounceTimerRef.current = setTimeout(async () => {
        const result = await translate(text)
        callback(result)
      }, delayMs)
    },
    [translate, delayMs]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return { translate, debouncedTranslate, isTranslating, error }
}

export default useAutoTranslateDebounced
