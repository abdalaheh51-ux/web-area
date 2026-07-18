'use client'

import { useState, useEffect } from 'react'
import { Loader2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import useAutoTranslate from '@/hooks/use-auto-translate'

interface EnhancedPortfolioFormProps {
  onFieldChange: (field: string, value: string) => void
  formData: {
    name: string
    nameEn: string
    description: string
    descriptionEn: string
    problem: string
    problemEn: string
    solution: string
    solutionEn: string
    result: string
    resultEn: string
  }
  dir: 'rtl' | 'ltr'
  hideEnglishFields?: boolean
}

/**
 * مكون محسّن لحقول النموذج مع الترجمة التلقائية
 */
export function EnhancedPortfolioFormFields({
  onFieldChange,
  formData,
  dir,
  hideEnglishFields = true,
}: EnhancedPortfolioFormProps) {
  const { toast } = useToast()
  const { translate, isTranslating, error: translationError } = useAutoTranslate()
  const [translatingField, setTranslatingField] = useState<string | null>(null)
  const isRtl = dir === 'rtl'

  // الحقول التي يتم ترجمتها تلقائياً
  const autoTranslateFields = [
    { ar: 'name', en: 'nameEn', label: isRtl ? 'اسم المشروع' : 'Project Name' },
    { ar: 'description', en: 'descriptionEn', label: isRtl ? 'الوصف' : 'Description' },
    { ar: 'problem', en: 'problemEn', label: isRtl ? 'المشكلة' : 'Problem' },
    { ar: 'solution', en: 'solutionEn', label: isRtl ? 'الحل' : 'Solution' },
    { ar: 'result', en: 'resultEn', label: isRtl ? 'النتيجة' : 'Result' },
  ]

  // دالة الترجمة التلقائية
  const handleAutoTranslate = async (arField: string, enField: string) => {
    const arabicText = formData[arField as keyof typeof formData] as string
    if (!arabicText || arabicText.trim().length === 0) {
      toast({
        title: isRtl ? 'خطأ' : 'Error',
        description: isRtl ? 'الرجاء إدخال النص بالعربية أولاً' : 'Please enter Arabic text first',
        variant: 'destructive',
      })
      return
    }

    setTranslatingField(arField)

    try {
      const translatedText = await translate(arabicText)
      if (translatedText) {
        onFieldChange(enField, translatedText)
        toast({
          title: isRtl ? 'تم الترجمة' : 'Translated',
          description: isRtl ? 'تم ترجمة النص بنجاح' : 'Text translated successfully',
        })
      } else {
        toast({
          title: isRtl ? 'فشلت الترجمة' : 'Translation failed',
          description: translationError || (isRtl ? 'حاول مرة أخرى' : 'Please try again'),
          variant: 'destructive',
        })
      }
    } finally {
      setTranslatingField(null)
    }
  }

  return (
    <div className="space-y-4">
      {autoTranslateFields.map(({ ar, en, label }) => (
        <div key={ar} className="space-y-2">
          {/* الحقل العربي */}
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-medium text-muted-foreground">{label}</label>
            {!hideEnglishFields && (
              <button
                onClick={() => handleAutoTranslate(ar, en)}
                disabled={isTranslating || translatingField === ar}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-primary/10 hover:bg-primary/20 text-primary disabled:opacity-50 transition-all"
              >
                {translatingField === ar ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {isRtl ? 'جاري الترجمة...' : 'Translating...'}
                  </>
                ) : (
                  <>
                    <Zap className="w-3 h-3" />
                    {isRtl ? 'ترجمة' : 'Translate'}
                  </>
                )}
              </button>
            )}
          </div>

          {ar === 'name' ? (
            <Input
              value={formData[ar as keyof typeof formData] as string}
              onChange={(e) => onFieldChange(ar, e.target.value)}
              placeholder={isRtl ? 'أدخل اسم المشروع' : 'Enter project name'}
              dir={isRtl ? 'rtl' : 'ltr'}
              className="text-sm"
            />
          ) : (
            <Textarea
              value={formData[ar as keyof typeof formData] as string}
              onChange={(e) => onFieldChange(ar, e.target.value)}
              placeholder={isRtl ? 'أدخل النص بالعربية' : 'Enter text in Arabic'}
              dir={isRtl ? 'rtl' : 'ltr'}
              className="text-sm min-h-20 resize-none"
            />
          )}

          {/* الحقل الإنجليزي (مخفي افتراضياً) */}
          {!hideEnglishFields && (
            <div className="mt-2 p-2 rounded-md bg-muted/20 border border-border/30">
              <label className="text-xs font-medium text-muted-foreground">
                {label} (English)
              </label>
              {en === 'nameEn' ? (
                <Input
                  value={formData[en as keyof typeof formData] as string}
                  onChange={(e) => onFieldChange(en, e.target.value)}
                  placeholder="English version (auto-filled)"
                  dir="ltr"
                  className="text-sm mt-1"
                />
              ) : (
                <Textarea
                  value={formData[en as keyof typeof formData] as string}
                  onChange={(e) => onFieldChange(en, e.target.value)}
                  placeholder="English version (auto-filled)"
                  dir="ltr"
                  className="text-sm min-h-20 resize-none mt-1"
                />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default EnhancedPortfolioFormFields
