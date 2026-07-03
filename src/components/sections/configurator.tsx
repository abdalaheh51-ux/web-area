'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Store, LayoutDashboard, Rocket, Check, Loader2, Sparkles, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

// ─── Types ────────────────────────────────────────────────────────
interface Selections {
  needsStore: boolean
  needsERP: boolean
  needsLanding: boolean
}

interface OptionConfig {
  key: keyof Selections
  title: string
  description: string
  details: string
  icon: React.ElementType
  color: string
  borderColor: string
  bgTint: string
}

// ─── Config ───────────────────────────────────────────────────────
const OPTIONS: OptionConfig[] = [
  {
    key: 'needsStore',
    title: 'محتاج متجر إلكتروني؟',
    description: 'متجر احترافي يبيع ويتكفل بالشحن والدفع',
    details: 'متجر إلكتروني متكامل مع بوابة دفع، إدارة منتجات، تتبع طلبات، وتحليلات مبيعات متقدمة',
    icon: Store,
    color: 'text-blue-600',
    borderColor: 'border-blue-500',
    bgTint: 'bg-blue-50 dark:bg-blue-950/30',
  },
  {
    key: 'needsERP',
    title: 'محتاج معاه لوحة تحكم للمخازن (ERP مصغر)؟',
    description: 'نظام يدير المخازن والمشتريات والحسابات',
    details: 'نظام ERP مخصص لإدارة المخازن، المشتريات، الموردين، والتقارير المالية مع لوحة تحكم شاملة',
    icon: LayoutDashboard,
    color: 'text-amber-600',
    borderColor: 'border-amber-500',
    bgTint: 'bg-amber-50 dark:bg-amber-950/30',
  },
  {
    key: 'needsLanding',
    title: 'محتاج صفحة هبوط للحملات الإعلانية؟',
    description: 'صفحة تحوّل الزوار لعملاء حقيقيين',
    details: 'صفحة هبوط احترافية محسّنة للتحويل مع A/B testing، تحليلات، وتكامل مع أدوات التسويق',
    icon: Rocket,
    color: 'text-rose-600',
    borderColor: 'border-rose-500',
    bgTint: 'bg-rose-50 dark:bg-rose-950/30',
  },
]

function getRecommendation(selections: Selections): string | null {
  const { needsStore, needsERP, needsLanding } = selections
  const count = [needsStore, needsERP, needsLanding].filter(Boolean).length

  if (count === 0) return null
  if (needsLanding && !needsStore && !needsERP)
    return 'نقترح: صفحة هبوط احترافية مع تحليلات'
  if (needsStore && !needsERP && !needsLanding)
    return 'نقترح: متجر إلكتروني متكامل مع بوابة دفع'
  if (needsERP && !needsStore && !needsLanding)
    return 'نقترح: نظام ERP مخصص لإدارة عملياتك'
  if (needsStore && needsERP && !needsLanding)
    return 'نقترح: متجر إلكتروني + نظام إدارة مخازن متكامل'
  if (needsLanding && needsStore && !needsERP)
    return 'نقترح: صفحة هبوط + متجر إلكتروني لحملاتك'
  if (needsLanding && needsERP && !needsStore)
    return 'نقترح: صفحة هبوط + نظام ERP لحملاتك وعملياتك'
  if (needsStore && needsERP && needsLanding)
    return 'نقترح: حل شامل من الهبوط إلى السيستم الكامل'

  return null
}

// ─── Toggle Card ──────────────────────────────────────────────────
function ToggleCard({
  option,
  selected,
  onToggle,
}: {
  option: OptionConfig
  selected: boolean
  onToggle: () => void
}) {
  const Icon = option.icon

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      className="w-full text-right"
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Card
        className={`relative cursor-pointer transition-all duration-300 overflow-hidden ${
          selected
            ? `${option.borderColor} border-2 ${option.bgTint} shadow-md`
            : 'border-2 border-transparent hover:border-muted-foreground/20'
        }`}
      >
        <CardContent className="p-5 flex flex-col gap-3">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-11 h-11 rounded-xl transition-colors duration-300 ${
                  selected
                    ? option.bgTint
                    : 'bg-muted/50'
                }`}
              >
                <Icon
                  className={`size-5 transition-colors duration-300 ${
                    selected ? option.color : 'text-muted-foreground'
                  }`}
                />
              </div>
              <span
                className={`font-semibold text-sm leading-snug transition-colors duration-300 ${
                  selected ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {option.title}
              </span>
            </div>

            {/* Checkbox indicator */}
            <motion.div
              className={`flex items-center justify-center w-6 h-6 rounded-md border-2 transition-all duration-300 ${
                selected
                  ? `${option.borderColor} ${option.bgTint}`
                  : 'border-muted-foreground/30'
              }`}
              animate={{ scale: selected ? 1 : 0.9 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <AnimatePresence>
                {selected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    <Check className={`size-3.5 ${option.color}`} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            {option.description}
          </p>

          {/* Expanded details */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pt-2 border-t border-muted-foreground/10">
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    {option.details}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.button>
  )
}

// ─── Recommendation Box ───────────────────────────────────────────
function RecommendationBox({ recommendation }: { recommendation: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="relative rounded-xl p-[2px] bg-gradient-to-l from-blue-500 via-amber-500 to-blue-500"
    >
      {/* Inner content */}
      <div className="rounded-[10px] bg-background p-4 flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-bl from-blue-500 to-amber-500 shrink-0">
          <Sparkles className="size-5 text-white" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-0.5">
            توصيتنا ليك
          </p>
          <p className="font-bold text-sm text-foreground leading-snug">
            {recommendation}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────
export default function Configurator() {
  const [selections, setSelections] = useState<Selections>({
    needsStore: false,
    needsERP: false,
    needsLanding: false,
  })
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailError, setEmailError] = useState('')
  const { toast } = useToast()

  const toggleSelection = useCallback((key: keyof Selections) => {
    setSelections((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const recommendation = getRecommendation(selections)
  const hasSelection = recommendation !== null

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      setEmailError('البريد الإلكتروني مطلوب')
      return false
    }
    if (!value.includes('@') || !value.includes('.')) {
      setEmailError('يرجى إدخال بريد إلكتروني صحيح')
      return false
    }
    setEmailError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail(email)) return

    if (!hasSelection) {
      toast({
        title: 'اختار خدمة على الأقل',
        description: 'من فضلك اختار احتياج واحد على الأقل عشان نقدر نساعدك',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || null,
          needsStore: selections.needsStore,
          needsERP: selections.needsERP,
          needsLanding: selections.needsLanding,
          solutionType: recommendation,
          message: message.trim() || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء إرسال البيانات')
      }

      toast({
        title: 'تم إرسال طلبك بنجاح! 🎉',
        description: 'هنتواصل معاك قريب بعرض السعر المخصص',
      })

      // Reset form
      setName('')
      setEmail('')
      setMessage('')
      setSelections({ needsStore: false, needsERP: false, needsLanding: false })
    } catch (err) {
      toast({
        title: 'حصل خطأ',
        description:
          err instanceof Error ? err.message : 'من فضلك حاول تاني',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section
      id="configurator"
      className="relative py-16 md:py-24 px-4"
      dir="rtl"
    >
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-transparent to-muted/30 pointer-events-none" />

      <div className="relative max-w-4xl mx-auto">
        {/* ── Section Title ── */}
        <motion.div
          className="text-center mb-10 md:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-3 leading-tight">
            مُهندس باقتك الرقمية
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            اختار احتياجاتك.. وهنبيلك الحل المناسب
          </p>
        </motion.div>

        {/* ── Toggle Cards Grid ── */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {OPTIONS.map((option) => (
            <ToggleCard
              key={option.key}
              option={option}
              selected={selections[option.key]}
              onToggle={() => toggleSelection(option.key)}
            />
          ))}
        </motion.div>

        {/* ── Recommendation Box ── */}
        <div className="mb-10">
          <AnimatePresence mode="wait">
            {recommendation && (
              <RecommendationBox recommendation={recommendation} />
            )}
          </AnimatePresence>
        </div>

        {/* ── Lead Form ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-2 border-dashed border-muted-foreground/20">
            <CardContent className="p-5 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Form header */}
                <div className="text-center mb-6">
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-1">
                    احصل على عرض سعر مخصص
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    سيب بياناتك وهنتواصل معاك بأقرب وقت
                  </p>
                </div>

                {/* Name & Email row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="config-name"
                      className="text-sm font-medium text-foreground"
                    >
                      الاسم{' '}
                      <span className="text-muted-foreground font-normal">
                        (اختياري)
                      </span>
                    </label>
                    <Input
                      id="config-name"
                      type="text"
                      placeholder="اسمك أو اسم الشركة"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isSubmitting}
                      className="text-right"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="config-email"
                      className="text-sm font-medium text-foreground"
                    >
                      البريد الإلكتروني{' '}
                      <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      id="config-email"
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (emailError) validateEmail(e.target.value)
                      }}
                      onBlur={() => email && validateEmail(email)}
                      disabled={isSubmitting}
                      required
                      aria-invalid={!!emailError}
                      className={`text-right ${emailError ? 'border-rose-500 focus-visible:border-rose-500' : ''}`}
                    />
                    {emailError && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-rose-500"
                      >
                        {emailError}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="config-message"
                    className="text-sm font-medium text-foreground"
                  >
                    رسالة إضافية{' '}
                    <span className="text-muted-foreground font-normal">
                      (اختياري)
                    </span>
                  </label>
                  <Textarea
                    id="config-message"
                    placeholder="اخبرنا أكثر عن احتياجاتك أو أي تفاصيل إضافية..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isSubmitting}
                    className="text-right min-h-[100px] resize-none"
                  />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full bg-gradient-to-l from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold text-base h-12 rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-300"
                >
                  {isSubmitting ? (
                    <motion.div
                      className="flex items-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Loader2 className="size-5 animate-spin" />
                      <span>جاري الإرسال...</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="flex items-center gap-2"
                      whileHover={{ x: -4 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      <span>احصل على عرض سعر مخصص</span>
                      <ArrowLeft className="size-5" />
                    </motion.div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
