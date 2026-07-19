'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Rocket, Palette, ShoppingCart, Building2, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/hooks/use-language'
import SectionBackground from '@/components/section-background'

interface StageData {
  number: string
  title: string
  subtitle: string
  tagline: string
  description: string
  icon: React.ElementType
  accentColor: string
  accentTextClass: string
  features: string[]
}

function useStages(t: import('@/lib/i18n').TranslationKeys): StageData[] {
  return [
    {
      number: '01',
      title: t.growthStage1Title,
      subtitle: t.growthStage1Sub,
      tagline: t.growthStage1Tagline,
      description: t.growthStage1Desc,
      icon: Rocket,
      accentColor: '#3b82f6', // blue-500
      accentTextClass: 'text-blue-600 dark:text-blue-400',
      features: [t.growthStage1F1, t.growthStage1F2, t.growthStage1F3],
    },
    {
      number: '02',
      title: t.growthStage2Title,
      subtitle: t.growthStage2Sub,
      tagline: t.growthStage2Tagline,
      description: t.growthStage2Desc,
      icon: Palette,
      accentColor: '#f59e0b', // amber-500
      accentTextClass: 'text-amber-600 dark:text-amber-400',
      features: [t.growthStage2F1, t.growthStage2F2, t.growthStage2F3],
    },
    {
      number: '03',
      title: t.growthStage3Title,
      subtitle: t.growthStage3Sub,
      tagline: t.growthStage3Tagline,
      description: t.growthStage3Desc,
      icon: ShoppingCart,
      accentColor: '#2563eb', // blue-600
      accentTextClass: 'text-blue-600 dark:text-blue-400',
      features: [t.growthStage3F1, t.growthStage3F2, t.growthStage3F3],
    },
    {
      number: '04',
      title: t.growthStage4Title,
      subtitle: t.growthStage4Sub,
      tagline: t.growthStage4Tagline,
      description: t.growthStage4Desc,
      icon: Building2,
      accentColor: '#d97706', // amber-600
      accentTextClass: 'text-amber-700 dark:text-amber-400',
      features: [t.growthStage4F1, t.growthStage4F2, t.growthStage4F3],
    },
  ]
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
}

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
}

function StageCard({ stage }: { stage: StageData }) {
  const [isHovered, setIsHovered] = useState(false)
  const Icon = stage.icon

  return (
    <motion.div variants={cardVariants} className="relative group">
      <Card
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'relative overflow-hidden transition-all duration-300',
          'border-2 py-0 gap-0 frosted-card',
          isHovered ? 'scale-[1.03] shadow-xl' : 'scale-100 shadow-sm',
        )}
        style={{
          borderColor: isHovered ? stage.accentColor : 'transparent',
          boxShadow: isHovered
            ? `0 20px 40px -12px ${stage.accentColor}25, 0 0 20px ${stage.accentColor}15`
            : undefined,
        }}
      >
        {/* Accent top bar */}
        <div
          className="h-1.5 w-full transition-all duration-300"
          style={{ backgroundColor: stage.accentColor }}
        />

        {/* Glow overlay on hover */}
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-500 pointer-events-none',
            'bg-gradient-to-b from-blue-500/5 to-transparent',
            isHovered ? 'opacity-100' : 'opacity-0',
          )}
        />

        <CardHeader className="p-5 pb-3 relative">
          <div className="flex items-center justify-between mb-3">
            {/* Number badge */}
            <span
              className={cn(
                'inline-flex items-center justify-center',
                'w-10 h-10 rounded-lg text-sm font-bold',
                'transition-colors duration-300',
              )}
              style={{
                backgroundColor: isHovered ? stage.accentColor : 'var(--muted)',
                color: isHovered ? 'white' : 'var(--foreground)',
              }}
            >
              {stage.number}
            </span>

            {/* Icon */}
            <div
              className={cn(
                'inline-flex items-center justify-center',
                'w-12 h-12 rounded-xl',
                'transition-colors duration-300',
                stage.accentTextClass,
              )}
              style={{
                backgroundColor: `${stage.accentColor}18`,
              }}
            >
              <Icon className="w-6 h-6" />
            </div>
          </div>

          <CardTitle className="text-xl font-bold">
            {stage.title}
          </CardTitle>
          <p
            className={cn(
              'text-xs font-medium tracking-wide',
              stage.accentTextClass,
            )}
          >
            {stage.subtitle}
          </p>
        </CardHeader>

        <CardContent className="px-5 pb-5 space-y-3">
          <p className="text-sm font-semibold text-foreground leading-relaxed">
            {stage.tagline}
          </p>
          <p className="text-xs text-muted-foreground">
            {stage.description}
          </p>

          {/* Features list */}
          <ul className="space-y-2 pt-2">
            {stage.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2">
                <span
                  className="inline-flex items-center justify-center shrink-0 w-5 h-5 rounded-full"
                  style={{ backgroundColor: `${stage.accentColor}18` }}
                >
                  <Check className={cn('w-3 h-3', stage.accentTextClass)} />
                </span>
                <span className="text-xs text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function GrowthSpectrum() {
  const { t, dir } = useLanguage()
  const stages = useStages(t)
  return (
    <section
      className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      dir={dir}
    >
      <SectionBackground variant="blue">
      <div className="max-w-7xl mx-auto relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-16 space-y-3"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            {t.growthTitle}
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.growthSubtitle}
          </p>
          {/* Decorative gradient line */}
          <div className="flex justify-center pt-2">
            <div className="h-1 w-24 rounded-full bg-gradient-to-l from-blue-500 to-amber-500" />
          </div>
        </motion.div>

        {/* Desktop: 4 columns with connector segments in the gaps only */}
        <div className="hidden lg:block relative">
          {/* Connector line segments — overlay grid mirrors the card grid so
              the segments sit precisely inside the gaps between cards and never
              cross the card faces. Fully responsive at any container width. */}
          <div className="absolute top-[50px] inset-x-0 z-0 grid grid-cols-4 gap-6 pointer-events-none">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="relative">
                {i > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    whileInView={{ opacity: 0.5, scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.6 + i * 0.15, ease: 'easeOut' }}
                    className="absolute top-0 -left-6 w-6 h-0.5 rounded-full bg-gradient-to-l from-blue-500 via-blue-600 to-amber-500"
                  />
                )}
              </div>
            ))}
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-4 gap-6 relative z-10"
          >
            {stages.map((stage) => (
              <StageCard key={stage.number} stage={stage} />
            ))}
          </motion.div>
        </div>

        {/* Tablet: 2x2 grid */}
        <div className="hidden md:grid lg:hidden">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-2 gap-6"
          >
            {stages.map((stage, index) => (
              <div key={stage.number} className="relative">
                <StageCard stage={stage} />
                {/* Connector dot between rows */}
                {index === 1 && (
                  <div className="flex justify-center py-3">
                    <div className="w-0.5 h-6 rounded-full bg-gradient-to-b from-blue-500 to-amber-500 opacity-40" />
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Mobile: Vertical timeline */}
        <div className="md:hidden">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="relative pr-10"
          >
            {/* Timeline vertical line */}
            <div className="absolute right-6 top-0 bottom-0 w-0.5 rounded-full bg-gradient-to-b from-blue-500 via-blue-600 to-amber-500 opacity-40" />

            {/* Animated progress line */}
            <div className="absolute right-6 top-0 w-0.5 rounded-full overflow-hidden" style={{ height: '100%' }}>
              <motion.div
                initial={{ height: '0%' }}
                whileInView={{ height: '100%' }}
                viewport={{ once: true }}
                transition={{ duration: 2, delay: 0.5, ease: 'easeInOut' }}
                className="w-full rounded-full bg-gradient-to-b from-blue-500 via-blue-600 to-amber-500"
              />
            </div>

            <div className="space-y-6">
              {stages.map((stage, index) => (
                <div key={stage.number} className="relative flex items-start gap-4">
                  {/* Timeline dot */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.15, type: 'spring' }}
                    className="shrink-0 w-3 h-3 rounded-full border-2 border-background z-10 mt-[68px]"
                    style={{ backgroundColor: stage.accentColor }}
                  />

                  <div className="flex-1 z-10">
                    <StageCard stage={stage} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      </SectionBackground>
    </section>
  )
}
