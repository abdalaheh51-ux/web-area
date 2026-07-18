'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import useAutoTranslateDebounced from '@/hooks/use-auto-translate-debounced'

interface PortfolioFormFieldsProps {
  label: string
  arabicValue: string
  englishValue: string
  onArabicChange: (value: string) => void
  onEnglishChange: (value: string) => void
  isTextarea?: boolean
  dir: 'rtl' | 'ltr'
  placeholder?: string
  placeholderEn?: string
}

/**
 * مكون حقول النموذج مع الترجمة التلقائية الفورية
 * يعرض حقل عربي وحقل إنجليزي تحته مباشرة
 * عند الكتابة بالعربية، يتم ترجمة النص تلقائياً إلى الإنجليزية
 */
export function PortfolioFormFields({
  label,
  arabicValue,
  englishValue,
  onArabicChange,
  onEnglishChange,
  isTextarea = false,
  dir,
  placeholder = '',
  placeholderEn = '',
}: PortfolioFormFieldsProps) {
  const isRtl = dir === 'rtl'
  const { debouncedTranslate, isTranslating } = useAutoTranslateDebounced(800)
  const [isAutoFilled, setIsAutoFilled] = useState(false)

  // عند تغيير النص العربي، قم بالترجمة التلقائية
  useEffect(() => {
    if (arabicValue && arabicValue.trim().length > 0) {
      debouncedTranslate(arabicValue, (translated) => {
        if (translated && !englishValue) {
          // ملء الحقل الإنجليزي فقط إذا كان فارغاً
          onEnglishChange(translated)
          setIsAutoFilled(true)
        }
      })
    }
  }, [arabicValue, debouncedTranslate, englishValue, onEnglishChange])

  const handleEnglishChange = (value: string) => {
    onEnglishChange(value)
    setIsAutoFilled(false) // إذا عدّل المستخدم يدوياً، لا نعتبره auto-filled
  }

  const Component = isTextarea ? Textarea : Input

  return (
    <div className="space-y-2">
      {/* الحقل العربي */}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">
          {label}
        </label>
        <Component
          value={arabicValue}
          onChange={(e) => onArabicChange(e.target.value)}
          placeholder={placeholder || `أدخل ${label}`}
          dir="rtl"
          className={`text-sm ${isTextarea ? 'min-h-20 resize-none' : ''}`}
        />
      </div>

      {/* الحقل الإنجليزي */}
      <div className="p-3 rounded-lg bg-muted/30 border border-border/40 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-medium text-muted-foreground">
            {label} (English)
          </label>
          {isTranslating && (
            <div className="flex items-center gap-1 text-xs text-primary">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>ترجمة...</span>
            </div>
          )}
          {isAutoFilled && !isTranslating && englishValue && (
            <span className="text-xs text-green-600 dark:text-green-400">✓ مترجم تلقائياً</span>
          )}
        </div>
        <Component
          value={englishValue}
          onChange={(e) => handleEnglishChange(e.target.value)}
          placeholder={placeholderEn || 'Auto-translated or edit manually'}
          dir="ltr"
          className={`text-sm ${isTextarea ? 'min-h-20 resize-none' : ''}`}
        />
      </div>
    </div>
  )
}

export default PortfolioFormFields
