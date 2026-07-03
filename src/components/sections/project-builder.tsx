'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  Check,
  Plus,
  X,
  Globe,
  ShoppingBag,
  Home,
  Stethoscope,
  GraduationCap,
  Building2,
  Palette,
  Mail,
  Phone,
  MessageCircle,
  MessageSquare,
  Send,
  Loader2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Copy,
  Info,
} from 'lucide-react'
import { useLanguage } from '@/hooks/use-language'
import { useToast } from '@/hooks/use-toast'
import type { TranslationKeys } from '@/lib/i18n'

// ─── Interfaces ───────────────────────────────────────────────────
interface ReferenceSite {
  url: string
  aspects: string[]
  notes: string
}

interface ProjectData {
  industry: string
  industryOther: string
  description: string
  referenceSites: ReferenceSite[]
  features: string[]
  visualStyle: { style: string; colors: string[]; fonts: string }
  budget: string
  timeline: string
  contactMethod: string
  name: string
  email: string
  phone: string
  bestTime: string
}

// ─── Constants ────────────────────────────────────────────────────
const MAX_SITES = 5
const MAX_COLORS = 3
const STORAGE_KEY = 'webarea-project-builder'

const COLOR_OPTIONS: {
  key: string
  hex: string
  labelKey: keyof TranslationKeys
}[] = [
  { key: 'blue', hex: '#3b82f6', labelKey: 'pbColorBlue' },
  { key: 'amber', hex: '#f59e0b', labelKey: 'pbColorAmber' },
  { key: 'emerald', hex: '#10b981', labelKey: 'pbColorEmerald' },
  { key: 'rose', hex: '#f43f5e', labelKey: 'pbColorRose' },
  { key: 'violet', hex: '#8b5cf6', labelKey: 'pbColorViolet' },
  { key: 'slate', hex: '#64748b', labelKey: 'pbColorSlate' },
]

const INITIAL_DATA: ProjectData = {
  industry: '',
  industryOther: '',
  description: '',
  referenceSites: [],
  features: [],
  visualStyle: { style: '', colors: [], fonts: '' },
  budget: '',
  timeline: '',
  contactMethod: '',
  name: '',
  email: '',
  phone: '',
  bestTime: '',
}

// ─── Helper Components (outside main) ─────────────────────────────
function StageHint({ children }: { children: string }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
      <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
      <p className="text-xs text-blue-600 dark:text-blue-400">{children}</p>
    </div>
  )
}

function FieldBadge({
  required,
  optionalText,
  requiredText,
  optionalLabel,
}: {
  required?: boolean
  optionalText?: string
  requiredText: string
  optionalLabel: string
}) {
  if (required) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
        {requiredText}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
      {optionalText || optionalLabel}
    </span>
  )
}

// ─── Main Component ───────────────────────────────────────────────
export default function ProjectBuilder() {
  const { t, dir } = useLanguage()
  const { toast } = useToast()
  const isRTL = dir === 'rtl'

  const [stage, setStage] = useState<number>(1)
  const [data, setData] = useState<ProjectData>(INITIAL_DATA)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [referenceNumber, setReferenceNumber] = useState('')
  const [hydrated, setHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        setData({ ...INITIAL_DATA, ...parsed })
      }
    } catch {
      /* ignore */
    }
    setHydrated(true)
  }, [])

  // Save to localStorage on data change
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      /* ignore */
    }
  }, [data, hydrated])

  const update = <K extends keyof ProjectData>(field: K, value: ProjectData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleArrayItem = (arr: string[], item: string): string[] => {
    if (arr.includes(item)) return arr.filter((i) => i !== item)
    return [...arr, item]
  }

  const addSite = () => {
    if (data.referenceSites.length >= MAX_SITES) return
    update('referenceSites', [
      ...data.referenceSites,
      { url: '', aspects: [], notes: '' },
    ])
  }

  const updateSite = (idx: number, patch: Partial<ReferenceSite>) => {
    update(
      'referenceSites',
      data.referenceSites.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    )
  }

  const removeSite = (idx: number) => {
    update(
      'referenceSites',
      data.referenceSites.filter((_, i) => i !== idx),
    )
  }

  const handleNext = () => {
    if (stage === 1) {
      if (!data.industry) {
        toast({ title: t.pbErrIndustry, variant: 'destructive' })
        return
      }
      if (data.industry === 'other' && !data.industryOther.trim()) {
        toast({ title: t.pbErrIndustryOther, variant: 'destructive' })
        return
      }
    }
    setStage((s) => Math.min(6, s + 1))
  }

  const handlePrev = () => setStage((s) => Math.max(1, s - 1))

  const handleSubmit = async () => {
    if (!data.contactMethod) {
      toast({ title: t.pbErrContactMethod, variant: 'destructive' })
      return
    }
    if (!data.name.trim()) {
      toast({ title: t.pbErrName, variant: 'destructive' })
      return
    }
    if (!data.email.trim() || !data.email.includes('@')) {
      toast({ title: t.pbErrEmail, variant: 'destructive' })
      return
    }
    if (
      (data.contactMethod === 'whatsapp' || data.contactMethod === 'phone') &&
      !data.phone.trim()
    ) {
      toast({ title: t.pbErrPhone, variant: 'destructive' })
      return
    }
    if (!data.bestTime) {
      toast({ title: t.pbErrBestTime, variant: 'destructive' })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/project-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Error')

      setReferenceNumber(json.referenceNumber)
      setStage(7)
      setData(INITIAL_DATA)
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        /* ignore */
      }
      toast({ title: t.pbToastSuccess })
    } catch {
      toast({ title: t.pbToastError, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setStage(1)
    setData(INITIAL_DATA)
    setReferenceNumber('')
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(referenceNumber)
      toast({ title: t.pbCopied })
    } catch {
      /* ignore */
    }
  }

  const progress = (Math.min(stage, 6) / 6) * 100

  const stages = [
    t.pbStage1,
    t.pbStage2,
    t.pbStage3,
    t.pbStage4,
    t.pbStage5,
    t.pbStage6,
  ]

  // ─── Data arrays ──────────────────────────────────────────────
  const industries = [
    { key: 'restaurant', icon: Home, label: t.pbIndustry1 },
    { key: 'ecommerce', icon: ShoppingBag, label: t.pbIndustry2 },
    { key: 'realestate', icon: Building2, label: t.pbIndustry3 },
    { key: 'medical', icon: Stethoscope, label: t.pbIndustry4 },
    { key: 'education', icon: GraduationCap, label: t.pbIndustry5 },
    { key: 'corporate', icon: Building2, label: t.pbIndustry6 },
    { key: 'creative', icon: Palette, label: t.pbIndustry7 },
    { key: 'other', icon: Plus, label: t.pbIndustry8 },
  ]

  const aspects = [
    { key: 'design', label: t.pbAspect1 },
    { key: 'layout', label: t.pbAspect2 },
    { key: 'products', label: t.pbAspect3 },
    { key: 'navigation', label: t.pbAspect4 },
    { key: 'animations', label: t.pbAspect5 },
    { key: 'speed', label: t.pbAspect6 },
    { key: 'ux', label: t.pbAspect7 },
  ]

  const features = [
    { key: 'cart', label: t.pbFeature1 },
    { key: 'accounts', label: t.pbFeature2 },
    { key: 'multilang', label: t.pbFeature3 },
    { key: 'mobileapp', label: t.pbFeature4 },
    { key: 'dashboard', label: t.pbFeature5 },
    { key: 'chat', label: t.pbFeature6 },
    { key: 'search', label: t.pbFeature7 },
    { key: 'analytics', label: t.pbFeature8 },
    { key: 'newsletter', label: t.pbFeature9 },
    { key: 'reviews', label: t.pbFeature10 },
  ]

  const styles = [
    { key: 'modern', label: t.pbStyle1 },
    { key: 'classic', label: t.pbStyle2 },
    { key: 'minimal', label: t.pbStyle3 },
    { key: 'luxury', label: t.pbStyle4 },
  ]

  const fonts = [
    { key: 'formal', label: t.pbFont1 },
    { key: 'friendly', label: t.pbFont2 },
    { key: 'creative', label: t.pbFont3 },
  ]

  const budgets = [
    { key: 'budget1', label: t.pbBudget1 },
    { key: 'budget2', label: t.pbBudget2 },
    { key: 'budget3', label: t.pbBudget3 },
    { key: 'budget4', label: t.pbBudget4 },
    { key: 'budget5', label: t.pbBudget5 },
  ]

  const timelines = [
    { key: 'timeline1', label: t.pbTimeline1 },
    { key: 'timeline2', label: t.pbTimeline2 },
    { key: 'timeline3', label: t.pbTimeline3 },
    { key: 'timeline4', label: t.pbTimeline4 },
  ]

  const contactMethods = [
    { key: 'email', icon: Mail, label: t.pbContact1 },
    { key: 'whatsapp', icon: MessageCircle, label: t.pbContact2 },
    { key: 'phone', icon: Phone, label: t.pbContact3 },
    { key: 'internal', icon: MessageSquare, label: t.pbContact4 },
  ]

  const bestTimes = [
    { key: 'morning', label: t.pbBestTime1 },
    { key: 'noon', label: t.pbBestTime2 },
    { key: 'evening', label: t.pbBestTime3 },
    { key: 'any', label: t.pbBestTime4 },
  ]

  const filledSites = data.referenceSites.filter((s) => s.url.trim())

  const NextIcon = isRTL ? ArrowLeft : ArrowRight
  const PrevIcon = isRTL ? ArrowRight : ArrowLeft

  return (
    <section
      id="project-builder"
      dir={dir}
      className="relative py-16 md:py-24 px-4 overflow-hidden bg-gradient-to-br from-primary/15 via-background to-amber-500/10"
    >
      {/* Dots pattern overlay */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, hsl(var(--foreground) / 0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative max-w-4xl mx-auto">
        {/* Floating badge */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-amber-500 text-white text-xs font-bold shadow-lg animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            {t.pbBadge}
          </span>
        </motion.div>

        {/* Title + subtitle */}
        <motion.div
          className="text-center mb-10 md:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-3 leading-tight">
            {t.pbTitle}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {t.pbSubtitle}
          </p>
        </motion.div>

        {stage < 7 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="rounded-2xl frosted-glass ring-2 ring-primary/30 shadow-2xl shadow-primary/10">
              <CardContent className="p-5 md:p-8">
                {/* Progress header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{t.pbTimeEstimate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{t.pbAutoSave}</span>
                  </div>
                </div>

                {/* Stage circles */}
                <div className="flex items-start justify-between mb-4 px-1 gap-1">
                  {stages.map((label, idx) => {
                    const stageNum = idx + 1
                    const isCompleted = stageNum < stage
                    const isCurrent = stageNum === stage
                    const isClickable = stageNum < stage
                    return (
                      <div
                        key={label}
                        className="flex flex-col items-center gap-1.5 flex-1"
                      >
                        <button
                          type="button"
                          disabled={!isClickable}
                          onClick={() => isClickable && setStage(stageNum)}
                          aria-label={`${stageNum}. ${label}`}
                          className={`relative flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full text-xs md:text-sm font-bold transition-all duration-300 ${
                            isCompleted
                              ? 'bg-gradient-to-br from-blue-500 to-amber-500 text-white shadow-md'
                              : isCurrent
                                ? 'bg-gradient-to-br from-blue-500 to-amber-500 text-white shadow-lg scale-110'
                                : 'bg-muted text-muted-foreground border border-border'
                          } ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
                        >
                          {isCompleted ? <Check className="w-4 h-4" /> : stageNum}
                        </button>
                        <span
                          className={`text-[10px] md:text-xs text-center leading-tight ${
                            isCurrent
                              ? 'font-bold text-foreground'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {label}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Progress bar */}
                <div className="h-2 rounded-full bg-muted overflow-hidden mb-8">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-amber-500 rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>

                {/* Stage content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={stage}
                    initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* ─── Stage 1: Industry + Description ─── */}
                    {stage === 1 && (
                      <div className="space-y-5">
                        <StageHint>{t.pbHint1}</StageHint>

                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <h3 className="text-sm font-bold text-foreground">
                              {t.pbIndustryLabel}
                            </h3>
                            <FieldBadge
                              required
                              requiredText={t.pbRequiredLabel}
                              optionalLabel={t.pbOptionalLabel}
                            />
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                            {industries.map((ind) => {
                              const Icon = ind.icon
                              const selected = data.industry === ind.key
                              return (
                                <button
                                  key={ind.key}
                                  type="button"
                                  onClick={() => update('industry', ind.key)}
                                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                                    selected
                                      ? 'border-blue-500 bg-blue-500/10 shadow-md'
                                      : 'border-border hover:border-blue-500/40 hover:bg-muted/50'
                                  }`}
                                >
                                  <Icon
                                    className={`w-5 h-5 ${selected ? 'text-blue-500' : 'text-muted-foreground'}`}
                                  />
                                  <span
                                    className={`text-xs font-medium text-center leading-tight ${
                                      selected
                                        ? 'text-foreground'
                                        : 'text-muted-foreground'
                                    }`}
                                  >
                                    {ind.label}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                          {data.industry === 'other' && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-3"
                            >
                              <label className="text-xs font-medium text-foreground mb-1.5 block">
                                {t.pbIndustryOtherLabel}
                              </label>
                              <Input
                                value={data.industryOther}
                                onChange={(e) =>
                                  update('industryOther', e.target.value)
                                }
                                placeholder={t.pbIndustryOtherPlaceholder}
                                className="bg-background"
                              />
                            </motion.div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <h3 className="text-sm font-bold text-foreground">
                              {t.pbDescriptionLabel}
                            </h3>
                            <FieldBadge
                              requiredText={t.pbRequiredLabel}
                              optionalLabel={t.pbOptionalLabel}
                              optionalText={t.pbDescriptionOptional}
                            />
                          </div>
                          <Textarea
                            value={data.description}
                            onChange={(e) =>
                              update('description', e.target.value)
                            }
                            placeholder={t.pbDescriptionPlaceholder}
                            className="bg-background min-h-[120px] resize-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* ─── Stage 2: Reference Sites URLs ─── */}
                    {stage === 2 && (
                      <div className="space-y-5">
                        <StageHint>{t.pbHint2}</StageHint>

                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-foreground">
                              {t.pbRefLabel}
                            </h3>
                            {data.referenceSites.length < MAX_SITES && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addSite}
                                className="h-8"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                {t.pbAddSite}
                              </Button>
                            )}
                          </div>
                          <div className="space-y-3">
                            <AnimatePresence initial={false}>
                              {data.referenceSites.map((site, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, x: -10 }}
                                  className="flex items-center gap-2"
                                >
                                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-muted text-xs font-bold text-muted-foreground shrink-0">
                                    {idx + 1}
                                  </div>
                                  <Input
                                    value={site.url}
                                    onChange={(e) =>
                                      updateSite(idx, { url: e.target.value })
                                    }
                                    placeholder={t.pbUrlPlaceholder}
                                    className="bg-background flex-1"
                                    dir="ltr"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeSite(idx)}
                                    aria-label={t.pbRemoveSite}
                                    className="shrink-0 text-muted-foreground hover:text-rose-500"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                            {data.referenceSites.length === 0 && (
                              <p className="text-sm text-muted-foreground text-center py-6">
                                {t.pbNoSites}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ─── Stage 3: Aspects + Notes per site ─── */}
                    {stage === 3 && (
                      <div className="space-y-5">
                        <StageHint>{t.pbHint3}</StageHint>

                        {filledSites.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-12">
                            {t.pbNoSites}
                          </p>
                        ) : (
                          <div className="space-y-4">
                            {filledSites.map((site) => {
                              const realIdx = data.referenceSites.indexOf(site)
                              return (
                                <Card
                                  key={realIdx}
                                  className="bg-background border-border"
                                >
                                  <CardContent className="p-4 space-y-3">
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/10 text-xs font-bold text-blue-500 shrink-0">
                                        {realIdx + 1}
                                      </div>
                                      <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                      <span
                                        className="text-sm font-medium text-foreground truncate"
                                        dir="ltr"
                                      >
                                        {site.url}
                                      </span>
                                    </div>

                                    <div>
                                      <label className="text-xs font-medium text-foreground mb-2 block">
                                        {t.pbAspectsLabel}
                                      </label>
                                      <div className="flex flex-wrap gap-2">
                                        {aspects.map((asp) => {
                                          const checked = site.aspects.includes(
                                            asp.key,
                                          )
                                          return (
                                            <button
                                              key={asp.key}
                                              type="button"
                                              onClick={() =>
                                                updateSite(realIdx, {
                                                  aspects: toggleArrayItem(
                                                    site.aspects,
                                                    asp.key,
                                                  ),
                                                })
                                              }
                                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                                                checked
                                                  ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                                  : 'border-border text-muted-foreground hover:border-blue-500/40'
                                              }`}
                                            >
                                              {checked && (
                                                <Check className="w-3 h-3" />
                                              )}
                                              {asp.label}
                                            </button>
                                          )
                                        })}
                                      </div>
                                    </div>

                                    <div>
                                      <label className="text-xs font-medium text-foreground mb-1.5 block">
                                        {t.pbNotesLabel}
                                      </label>
                                      <Textarea
                                        value={site.notes}
                                        onChange={(e) =>
                                          updateSite(realIdx, {
                                            notes: e.target.value,
                                          })
                                        }
                                        placeholder={t.pbNotesPlaceholder}
                                        className="bg-background min-h-[70px] resize-none text-sm"
                                      />
                                    </div>
                                  </CardContent>
                                </Card>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ─── Stage 4: Features + Visual + Budget/Timeline ─── */}
                    {stage === 4 && (
                      <div className="space-y-6">
                        <StageHint>{t.pbHint4}</StageHint>

                        {/* Features */}
                        <div>
                          <h3 className="text-sm font-bold text-foreground mb-3">
                            {t.pbFeaturesLabel}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {features.map((f) => {
                              const checked = data.features.includes(f.key)
                              return (
                                <button
                                  key={f.key}
                                  type="button"
                                  onClick={() =>
                                    update(
                                      'features',
                                      toggleArrayItem(data.features, f.key),
                                    )
                                  }
                                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm text-start transition-all ${
                                    checked
                                      ? 'border-blue-500 bg-blue-500/10 text-foreground'
                                      : 'border-border text-muted-foreground hover:border-blue-500/40'
                                  }`}
                                >
                                  <span
                                    className={`flex items-center justify-center w-4 h-4 rounded border shrink-0 ${
                                      checked
                                        ? 'border-blue-500 bg-blue-500'
                                        : 'border-muted-foreground/30'
                                    }`}
                                  >
                                    {checked && (
                                      <Check className="w-3 h-3 text-white" />
                                    )}
                                  </span>
                                  {f.label}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Visual style */}
                        <div>
                          <h3 className="text-sm font-bold text-foreground mb-3">
                            {t.pbStyleLabel}
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {styles.map((s) => {
                              const selected = data.visualStyle.style === s.key
                              return (
                                <button
                                  key={s.key}
                                  type="button"
                                  onClick={() =>
                                    update('visualStyle', {
                                      ...data.visualStyle,
                                      style: s.key,
                                    })
                                  }
                                  className={`p-2.5 rounded-lg border-2 text-xs font-medium transition-all ${
                                    selected
                                      ? 'border-blue-500 bg-blue-500/10 text-foreground'
                                      : 'border-border text-muted-foreground hover:border-blue-500/40'
                                  }`}
                                >
                                  {s.label}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Colors */}
                        <div>
                          <h3 className="text-sm font-bold text-foreground mb-3">
                            {t.pbColorsLabel}
                            <span className="text-xs font-normal text-muted-foreground ms-2">
                              ({data.visualStyle.colors.length}/{MAX_COLORS})
                            </span>
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {COLOR_OPTIONS.map((c) => {
                              const selected =
                                data.visualStyle.colors.includes(c.key)
                              const disabled =
                                !selected &&
                                data.visualStyle.colors.length >= MAX_COLORS
                              return (
                                <button
                                  key={c.key}
                                  type="button"
                                  disabled={disabled}
                                  onClick={() =>
                                    update('visualStyle', {
                                      ...data.visualStyle,
                                      colors: toggleArrayItem(
                                        data.visualStyle.colors,
                                        c.key,
                                      ),
                                    })
                                  }
                                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                                    selected
                                      ? 'border-foreground/40 bg-foreground/5 text-foreground'
                                      : 'border-border text-muted-foreground hover:border-foreground/30'
                                  } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                                >
                                  <span
                                    className="w-3 h-3 rounded-full border border-black/10"
                                    style={{ backgroundColor: c.hex }}
                                  />
                                  {t[c.labelKey]}
                                  {selected && (
                                    <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-foreground text-background">
                                      <Check className="w-2.5 h-2.5" />
                                    </span>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Fonts */}
                        <div>
                          <h3 className="text-sm font-bold text-foreground mb-3">
                            {t.pbFontsLabel}
                          </h3>
                          <div className="grid grid-cols-3 gap-2">
                            {fonts.map((f) => {
                              const selected = data.visualStyle.fonts === f.key
                              return (
                                <button
                                  key={f.key}
                                  type="button"
                                  onClick={() =>
                                    update('visualStyle', {
                                      ...data.visualStyle,
                                      fonts: f.key,
                                    })
                                  }
                                  className={`p-2.5 rounded-lg border-2 text-xs font-medium transition-all ${
                                    selected
                                      ? 'border-blue-500 bg-blue-500/10 text-foreground'
                                      : 'border-border text-muted-foreground hover:border-blue-500/40'
                                  }`}
                                >
                                  {f.label}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Budget + Timeline */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-bold text-foreground mb-3">
                              {t.pbBudgetLabel}
                            </h3>
                            <div className="space-y-2">
                              {budgets.map((b) => {
                                const selected = data.budget === b.key
                                return (
                                  <button
                                    key={b.key}
                                    type="button"
                                    onClick={() =>
                                      update('budget', selected ? '' : b.key)
                                    }
                                    className={`w-full p-2.5 rounded-lg border text-sm text-start transition-all ${
                                      selected
                                        ? 'border-blue-500 bg-blue-500/10 text-foreground'
                                        : 'border-border text-muted-foreground hover:border-blue-500/40'
                                    }`}
                                  >
                                    {b.label}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-foreground mb-3">
                              {t.pbTimelineLabel}
                            </h3>
                            <div className="space-y-2">
                              {timelines.map((tl) => {
                                const selected = data.timeline === tl.key
                                return (
                                  <button
                                    key={tl.key}
                                    type="button"
                                    onClick={() =>
                                      update(
                                        'timeline',
                                        selected ? '' : tl.key,
                                      )
                                    }
                                    className={`w-full p-2.5 rounded-lg border text-sm text-start transition-all ${
                                      selected
                                        ? 'border-blue-500 bg-blue-500/10 text-foreground'
                                        : 'border-border text-muted-foreground hover:border-blue-500/40'
                                    }`}
                                  >
                                    {tl.label}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ─── Stage 5: Review ─── */}
                    {stage === 5 && (
                      <div className="space-y-4">
                        <StageHint>{t.pbHint5}</StageHint>

                        {/* Industry card */}
                        <Card className="bg-background border-border">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-sm font-bold text-foreground">
                                {t.pbReviewIndustry}
                              </h3>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setStage(1)}
                                className="h-7 text-xs text-blue-500 hover:text-blue-600"
                              >
                                {t.pbReviewEdit}
                              </Button>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex gap-2">
                                <span className="text-muted-foreground shrink-0">
                                  {t.pbIndustryLabel}:
                                </span>
                                <span className="text-foreground font-medium">
                                  {data.industry === 'other'
                                    ? data.industryOther || t.pbReviewEmpty
                                    : industries.find(
                                          (i) => i.key === data.industry,
                                        )?.label || t.pbReviewEmpty}
                                </span>
                              </div>
                              {data.description && (
                                <p className="text-muted-foreground text-xs leading-relaxed pt-1">
                                  {data.description}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Ref sites card */}
                        <Card className="bg-background border-border">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-sm font-bold text-foreground">
                                {t.pbReviewRefs}
                              </h3>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setStage(2)}
                                className="h-7 text-xs text-blue-500 hover:text-blue-600"
                              >
                                {t.pbReviewEdit}
                              </Button>
                            </div>
                            {filledSites.length === 0 ? (
                              <p className="text-sm text-muted-foreground">
                                {t.pbReviewEmpty}
                              </p>
                            ) : (
                              <div className="space-y-1.5">
                                {filledSites.map((s, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center gap-1.5 text-sm"
                                  >
                                    <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                    <span
                                      className="text-foreground truncate"
                                      dir="ltr"
                                    >
                                      {s.url}
                                    </span>
                                    {s.aspects.length > 0 && (
                                      <Badge
                                        variant="secondary"
                                        className="text-[10px] h-4 px-1.5"
                                      >
                                        {s.aspects.length}
                                      </Badge>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Requirements card */}
                        <Card className="bg-background border-border">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-sm font-bold text-foreground">
                                {t.pbReviewRequirements}
                              </h3>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setStage(4)}
                                className="h-7 text-xs text-blue-500 hover:text-blue-600"
                              >
                                {t.pbReviewEdit}
                              </Button>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1.5">
                                  {t.pbFeaturesLabel}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {data.features.length === 0 ? (
                                    <span className="text-muted-foreground">
                                      {t.pbReviewEmpty}
                                    </span>
                                  ) : (
                                    data.features.map((f) => (
                                      <Badge
                                        key={f}
                                        variant="secondary"
                                        className="text-[10px]"
                                      >
                                        {features.find((x) => x.key === f)
                                          ?.label || f}
                                      </Badge>
                                    ))
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                                {data.visualStyle.style && (
                                  <span>
                                    {t.pbStyleLabel}:{' '}
                                    {
                                      styles.find(
                                        (s) =>
                                          s.key === data.visualStyle.style,
                                      )?.label
                                    }
                                  </span>
                                )}
                                {data.visualStyle.colors.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    {t.pbColorsLabel}:
                                    {data.visualStyle.colors.map((c) => {
                                      const opt = COLOR_OPTIONS.find(
                                        (o) => o.key === c,
                                      )
                                      return opt ? (
                                        <span
                                          key={c}
                                          className="w-2.5 h-2.5 rounded-full inline-block border border-black/10"
                                          style={{
                                            backgroundColor: opt.hex,
                                          }}
                                        />
                                      ) : null
                                    })}
                                  </span>
                                )}
                                {data.visualStyle.fonts && (
                                  <span>
                                    {t.pbFontsLabel}:{' '}
                                    {
                                      fonts.find(
                                        (f) =>
                                          f.key === data.visualStyle.fonts,
                                      )?.label
                                    }
                                  </span>
                                )}
                                {data.budget && (
                                  <span>
                                    {t.pbBudgetLabel}:{' '}
                                    {budgets.find((b) => b.key === data.budget)
                                      ?.label}
                                  </span>
                                )}
                                {data.timeline && (
                                  <span>
                                    {t.pbTimelineLabel}:{' '}
                                    {
                                      timelines.find(
                                        (tl) => tl.key === data.timeline,
                                      )?.label
                                    }
                                  </span>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* ─── Stage 6: Contact ─── */}
                    {stage === 6 && (
                      <div className="space-y-5">
                        <StageHint>{t.pbHint6}</StageHint>

                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <h3 className="text-sm font-bold text-foreground">
                              {t.pbContactMethodLabel}
                            </h3>
                            <FieldBadge
                              required
                              requiredText={t.pbRequiredLabel}
                              optionalLabel={t.pbOptionalLabel}
                            />
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {contactMethods.map((cm) => {
                              const Icon = cm.icon
                              const selected = data.contactMethod === cm.key
                              return (
                                <button
                                  key={cm.key}
                                  type="button"
                                  onClick={() =>
                                    update('contactMethod', cm.key)
                                  }
                                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                                    selected
                                      ? 'border-blue-500 bg-blue-500/10'
                                      : 'border-border hover:border-blue-500/40'
                                  }`}
                                >
                                  <Icon
                                    className={`w-5 h-5 ${selected ? 'text-blue-500' : 'text-muted-foreground'}`}
                                  />
                                  <span
                                    className={`text-xs font-medium ${selected ? 'text-foreground' : 'text-muted-foreground'}`}
                                  >
                                    {cm.label}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <label className="text-sm font-medium text-foreground">
                                {t.pbNameLabel}
                              </label>
                              <FieldBadge
                                required
                                requiredText={t.pbRequiredLabel}
                                optionalLabel={t.pbOptionalLabel}
                              />
                            </div>
                            <Input
                              value={data.name}
                              onChange={(e) =>
                                update('name', e.target.value)
                              }
                              placeholder={t.pbNamePlaceholder}
                              className="bg-background"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <label className="text-sm font-medium text-foreground">
                                {t.pbEmailLabel}
                              </label>
                              <FieldBadge
                                required
                                requiredText={t.pbRequiredLabel}
                                optionalLabel={t.pbOptionalLabel}
                              />
                            </div>
                            <Input
                              type="email"
                              value={data.email}
                              onChange={(e) =>
                                update('email', e.target.value)
                              }
                              placeholder={t.pbEmailPlaceholder}
                              className="bg-background"
                              dir="ltr"
                            />
                          </div>
                        </div>

                        {(data.contactMethod === 'whatsapp' ||
                          data.contactMethod === 'phone') && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                          >
                            <div className="flex items-center gap-2 mb-1.5">
                              <label className="text-sm font-medium text-foreground">
                                {t.pbPhoneLabel}
                              </label>
                              <FieldBadge
                                required
                                requiredText={t.pbRequiredLabel}
                                optionalLabel={t.pbOptionalLabel}
                              />
                            </div>
                            <Input
                              value={data.phone}
                              onChange={(e) =>
                                update('phone', e.target.value)
                              }
                              placeholder={t.pbPhonePlaceholder}
                              className="bg-background"
                              dir="ltr"
                            />
                          </motion.div>
                        )}

                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <h3 className="text-sm font-bold text-foreground">
                              {t.pbBestTimeLabel}
                            </h3>
                            <FieldBadge
                              required
                              requiredText={t.pbRequiredLabel}
                              optionalLabel={t.pbOptionalLabel}
                            />
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {bestTimes.map((bt) => {
                              const selected = data.bestTime === bt.key
                              return (
                                <button
                                  key={bt.key}
                                  type="button"
                                  onClick={() =>
                                    update('bestTime', selected ? '' : bt.key)
                                  }
                                  className={`p-2.5 rounded-lg border-2 text-xs font-medium transition-all ${
                                    selected
                                      ? 'border-blue-500 bg-blue-500/10 text-foreground'
                                      : 'border-border text-muted-foreground hover:border-blue-500/40'
                                  }`}
                                >
                                  {bt.label}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-border">
                  {stage > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrev}
                      className="gap-2"
                    >
                      <PrevIcon className="w-4 h-4" />
                      {t.pbPrev}
                    </Button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-2">
                    {(stage === 2 || stage === 3) && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleNext}
                        className="text-muted-foreground"
                      >
                        {t.pbSkip}
                      </Button>
                    )}
                    {stage < 6 ? (
                      <Button
                        type="button"
                        onClick={handleNext}
                        className="bg-gradient-to-r from-blue-500 to-amber-500 hover:from-blue-600 hover:to-amber-600 text-white gap-2"
                      >
                        {t.pbNext}
                        <NextIcon className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-blue-500 to-amber-500 hover:from-blue-600 hover:to-amber-600 text-white gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t.pbSending}
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            {t.pbSubmit}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          // ─── Stage 7: Success ───
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="rounded-2xl frosted-glass ring-2 ring-primary/30 shadow-2xl shadow-primary/10">
              <CardContent className="p-8 md:p-12 text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                    delay: 0.1,
                  }}
                  className="mx-auto mb-6 w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-amber-500 flex items-center justify-center shadow-lg"
                >
                  <Check className="w-10 h-10 text-white" strokeWidth={3} />
                </motion.div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2">
                  {t.pbSuccessTitle}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                  {t.pbSuccessDesc}
                </p>
                <div className="inline-flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border mb-6">
                  <div className="text-start">
                    <p className="text-xs text-muted-foreground mb-0.5">
                      {t.pbReferenceNumber}
                    </p>
                    <p className="text-lg font-bold text-foreground font-mono">
                      {referenceNumber}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={copyReference}
                    aria-label={t.pbCopy}
                    className="shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div>
                  <Button
                    type="button"
                    onClick={handleReset}
                    variant="outline"
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {t.pbSendAnother}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </section>
  )
}
