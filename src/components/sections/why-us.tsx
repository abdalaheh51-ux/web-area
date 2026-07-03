'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import {
  Zap, BarChart3, ShieldCheck, Clock, Headphones, Palette,
  ArrowLeft, ArrowRight, Check, Search, PenTool, Code2, Rocket,
  Lock, Database, Cloud, GitBranch, Figma, Server, Cpu, Layers,
  Award, RefreshCw, FileCheck, Headset,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/hooks/use-language'
import SectionBackground from '@/components/section-background'
import type { TranslationKeys } from '@/lib/i18n'

// ─── Counting Number ─────────────────────────────────────────
function CountingNumber({ value, suffix, isInView }: { value: number; suffix: string; isInView: boolean }) {
  const [count, setCount] = useState(0)
  const isDecimal = value % 1 !== 0

  useEffect(() => {
    if (!isInView) return
    const startTime = Date.now()
    const duration = 2000
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = eased * value
      setCount(isDecimal ? parseFloat(current.toFixed(1)) : Math.floor(current))
      if (progress < 1) requestAnimationFrame(animate)
      else setCount(value)
    }
    requestAnimationFrame(animate)
  }, [isInView, value, isDecimal])

  return <span>{count}{suffix}</span>
}

// ─── Feature Visuals ─────────────────────────────────────────
function SpeedVisual() {
  const { t } = useLanguage()
  return (
    <div className="mt-4 relative h-14 w-full overflow-hidden rounded-xl bg-muted/30 border border-border/20">
      <motion.div
        className="absolute inset-y-0 right-0 rounded-xl bg-gradient-to-l from-blue-500 to-blue-400"
        initial={{ width: '0%' }}
        whileInView={{ width: '95%' }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        viewport={{ once: true }}
      />
      <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-medium">
        <span className="text-muted-foreground">100%</span>
        <motion.span
          className="text-blue-600 dark:text-blue-400 font-bold bg-background/60 px-2 py-0.5 rounded"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          viewport={{ once: true }}
        >
          {t.whySpeedLabel}
        </motion.span>
      </div>
    </div>
  )
}

function DashboardVisual() {
  return (
    <div className="mt-4 flex items-end gap-1.5 h-16">
      {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-t-sm bg-gradient-to-t from-amber-600 dark:from-amber-500 to-amber-400"
          initial={{ height: 0 }}
          whileInView={{ height: `${height}%` }}
          transition={{ duration: 0.6, delay: 0.1 * i, ease: 'easeOut' }}
          viewport={{ once: true }}
        />
      ))}
    </div>
  )
}

function ShieldVisual() {
  return (
    <div className="mt-4 flex items-center justify-center h-16">
      <motion.div
        className="relative"
        initial={{ scale: 0, rotate: -180 }}
        whileInView={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
        viewport={{ once: true }}
      >
        <div className="h-12 w-12 rounded-full border-2 border-blue-500/30 flex items-center justify-center bg-blue-500/10">
          <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-blue-500/20"
          initial={{ scale: 1, opacity: 1 }}
          whileInView={{ scale: [1, 1.5, 1.5], opacity: [1, 0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          viewport={{ once: true }}
        />
      </motion.div>
    </div>
  )
}

// ─── Process Steps ───────────────────────────────────────────
const processIcons = [Search, PenTool, Code2, Rocket]
const processColors = [
  { bg: 'from-blue-500/20 to-blue-600/5', icon: 'text-blue-600 dark:text-blue-400', ring: 'ring-blue-500/30' },
  { bg: 'from-amber-500/20 to-amber-600/5', icon: 'text-amber-600 dark:text-amber-400', ring: 'ring-amber-500/30' },
  { bg: 'from-violet-500/20 to-violet-600/5', icon: 'text-violet-600 dark:text-violet-400', ring: 'ring-violet-500/30' },
  { bg: 'from-emerald-500/20 to-emerald-600/5', icon: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-500/30' },
]

// ─── Technologies ────────────────────────────────────────────
const techIcons = [
  { Icon: Code2, label: 'Next.js' },
  { Icon: Layers, label: 'React' },
  { Icon: Palette, label: 'Tailwind' },
  { Icon: Database, label: 'Prisma' },
  { Icon: Figma, label: 'Figma' },
  { Icon: GitBranch, label: 'Git' },
  { Icon: Cloud, label: 'Docker' },
  { Icon: Server, label: 'Node.js' },
]

// ─── Guarantees ──────────────────────────────────────────────
const guaranteeIcons = [Award, Headset, RefreshCw, FileCheck]

// ─── Main Component ──────────────────────────────────────────
export default function WhyUs() {
  const { t, dir } = useLanguage()
  const statsRef = useRef<HTMLDivElement>(null)
  const isStatsInView = useInView(statsRef, { once: true, margin: '-100px' })
  const isRtl = dir === 'rtl'

  const features = [
    {
      icon: Zap,
      title: t.whySpeedTitle,
      description: t.whySpeedDesc,
      accent: 'blue',
      visual: 'speed',
      link: '#growth',
      features: [t.whySpeedFeature1, t.whySpeedFeature2, t.whySpeedFeature3],
    },
    {
      icon: BarChart3,
      title: t.whyDashboardTitle,
      description: t.whyDashboardDesc,
      accent: 'amber',
      visual: 'dashboard',
      link: '#project-builder',
      features: [t.whyDashboardFeature1, t.whyDashboardFeature2, t.whyDashboardFeature3],
    },
    {
      icon: ShieldCheck,
      title: t.whySecurityTitle,
      description: t.whySecurityDesc,
      accent: 'blue',
      visual: 'shield',
      link: '#cases',
      features: [t.whySecurityFeature1, t.whySecurityFeature2, t.whySecurityFeature3],
    },
  ]

  const stats = [
    { value: 99.9, suffix: '%', label: t.whyStatUptime, icon: Clock },
    { value: 24, suffix: '/7', label: t.whyStatSupport, icon: Headphones },
    { value: 100, suffix: '%', label: t.whyStatCustom, icon: Palette },
    { value: 48, suffix: 'h', label: t.whyStatResponse, icon: Zap },
  ]

  const accentClasses: Record<string, { icon: string; border: string; gradient: string }> = {
    blue: {
      icon: 'text-blue-600 dark:text-blue-400 bg-blue-500/15 dark:bg-blue-500/20',
      border: 'hover:border-blue-500/40',
      gradient: 'from-blue-500 to-blue-400',
    },
    amber: {
      icon: 'text-amber-600 dark:text-amber-400 bg-amber-500/15 dark:bg-amber-500/20',
      border: 'hover:border-amber-500/40',
      gradient: 'from-amber-500 to-amber-400',
    },
  }

  const processSteps = [
    { title: t.whyProcess1Title, desc: t.whyProcess1Desc },
    { title: t.whyProcess2Title, desc: t.whyProcess2Desc },
    { title: t.whyProcess3Title, desc: t.whyProcess3Desc },
    { title: t.whyProcess4Title, desc: t.whyProcess4Desc },
  ]

  const guarantees = [
    t.whyGuarantee1,
    t.whyGuarantee2,
    t.whyGuarantee3,
    t.whyGuarantee4,
  ]

  return (
    <section id="why-us" dir={dir} className="py-20 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      <SectionBackground variant="blue" particles={true}>
        <div className="mx-auto max-w-6xl relative z-10">
          {/* ── Section Header ── */}
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-3 py-1 mb-3 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
              {t.whyBadge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">{t.whyTitle}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t.whySubtitle}</p>
          </motion.div>

          {/* ── Feature Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              const colors = accentClasses[feature.accent]
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className={`h-full overflow-hidden transition-colors duration-300 ${colors.border} frosted-card`}>
                    {/* Gradient top bar */}
                    <div className={`h-1.5 w-full bg-gradient-to-l ${colors.gradient}`} />
                    <CardContent className="p-6">
                      <div>
                        {/* Icon */}
                        <div className={`inline-flex items-center justify-center h-14 w-14 rounded-2xl mb-4 ${colors.icon}`}>
                          <Icon className="h-7 w-7" />
                        </div>
                        {/* Title + Desc */}
                        <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-4">{feature.description}</p>

                        {/* Visual */}
                        {feature.visual === 'speed' && <SpeedVisual />}
                        {feature.visual === 'dashboard' && <DashboardVisual />}
                        {feature.visual === 'shield' && <ShieldVisual />}

                        {/* Feature list */}
                        <ul className="mt-4 space-y-1.5">
                          {feature.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Check className={`w-3.5 h-3.5 shrink-0 ${feature.accent === 'blue' ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`} />
                              {f}
                            </li>
                          ))}
                        </ul>

                        {/* Learn more */}
                        <button
                          onClick={() => document.querySelector(feature.link)?.scrollIntoView({ behavior: 'smooth' })}
                          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline cursor-pointer"
                        >
                          {t.whyLearnMore}
                          {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* ── Stats Row ── */}
          <motion.div
            ref={statsRef}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20"
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => {
              const StatIcon = stat.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center p-6 rounded-2xl frosted-card border border-border/50 group"
                >
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mb-3 group-hover:bg-primary/20 transition-colors">
                    <StatIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-primary mb-1">
                    <CountingNumber value={stat.value} suffix={stat.suffix} isInView={isStatsInView} />
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* ── Process Section ── */}
          <div className="mb-20">
            <div className="text-center mb-10">
              <h3 className="text-2xl sm:text-3xl font-bold mb-2">{t.whyProcessTitle}</h3>
              <p className="text-muted-foreground">{t.whyProcessSubtitle}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
              {/* Connecting line */}
              <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-l from-blue-500/30 via-amber-500/30 to-emerald-500/30" />

              {processSteps.map((step, idx) => {
                const StepIcon = processIcons[idx]
                const colors = processColors[idx]
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="relative text-center"
                  >
                    <div className={`relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${colors.bg} ring-2 ${colors.ring} mb-3 z-10`}>
                      <StepIcon className={`w-7 h-7 ${colors.icon}`} />
                      <span className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border-2 ${colors.ring} flex items-center justify-center text-[10px] font-bold ${colors.icon}`}>
                        {idx + 1}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm mb-1">{step.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px] mx-auto">{step.desc}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* ── Technologies ── */}
          <div className="mb-20">
            <div className="text-center mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold mb-2">{t.whyTechTitle}</h3>
              <p className="text-muted-foreground">{t.whyTechSubtitle}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {techIcons.map((tech, idx) => {
                const TechIcon = tech.Icon
                return (
                  <motion.div
                    key={tech.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    viewport={{ once: true }}
                    className="group flex flex-col items-center gap-2"
                  >
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl frosted-card border border-border/30 group-hover:border-primary/30 transition-all group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/10">
                      <TechIcon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">{tech.label}</span>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* ── Guarantees ── */}
          <div className="mb-20">
            <div className="text-center mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold mb-2">{t.whyGuaranteeTitle}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {guarantees.map((guarantee, idx) => {
                const GIcon = guaranteeIcons[idx]
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 p-4 rounded-xl frosted-card border border-border/30"
                  >
                    <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10">
                      <GIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-sm font-medium leading-tight">{guarantee}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* ── CTA ── */}
          <motion.div
            className="text-center"
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Button
              size="lg"
              className="text-base px-8 py-6 rounded-xl bg-gradient-to-l from-blue-600 to-amber-500 text-white hover:opacity-90 shadow-lg shadow-primary/20 cursor-pointer font-bold"
              onClick={() => document.querySelector('#project-builder')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t.whyCTA}
              {isRtl ? <ArrowLeft className="w-5 h-5 mr-2" /> : <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>
          </motion.div>
        </div>
      </SectionBackground>
    </section>
  )
}
