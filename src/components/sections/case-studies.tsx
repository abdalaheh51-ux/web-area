'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, ChevronDown, ShoppingBag, Palette, BarChart3, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useLanguage } from '@/hooks/use-language'
import SectionBackground from '@/components/section-background'
import type { TranslationKeys } from '@/lib/i18n'

type Category = 'all' | 'portfolio' | 'ecommerce' | 'analytics' | 'admin'

interface CaseStudy {
  id: number
  name: string
  category: Category
  problem: string
  solution: string
  result: string
  tags: string[]
}

const categoryConfig: Record<
  Exclude<Category, 'all'>,
  { color: string; bgColor: string; icon: React.ElementType }
> = {
  portfolio: {
    color: 'text-rose-700 dark:text-rose-300',
    bgColor: 'bg-rose-100 dark:bg-rose-900/40',
    icon: Palette,
  },
  ecommerce: {
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-100 dark:bg-blue-900/40',
    icon: ShoppingBag,
  },
  analytics: {
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-100 dark:bg-amber-900/40',
    icon: BarChart3,
  },
  admin: {
    color: 'text-violet-700 dark:text-violet-300',
    bgColor: 'bg-violet-100 dark:bg-violet-900/40',
    icon: Settings,
  },
}

function useCaseStudies(t: TranslationKeys): CaseStudy[] {
  return [
    {
      id: 1,
      name: t.case1Name,
      category: 'ecommerce',
      problem: t.case1Problem,
      solution: t.case1Solution,
      result: t.case1Result,
      tags: t.case1Tags.split(', '),
    },
    {
      id: 2,
      name: t.case2Name,
      category: 'admin',
      problem: t.case2Problem,
      solution: t.case2Solution,
      result: t.case2Result,
      tags: t.case2Tags.split(', '),
    },
    {
      id: 3,
      name: t.case4Name,
      category: 'portfolio',
      problem: t.case4Problem,
      solution: t.case4Solution,
      result: t.case4Result,
      tags: t.case4Tags.split(', '),
    },
    {
      id: 4,
      name: t.case7Name,
      category: 'analytics',
      problem: t.case7Problem,
      solution: t.case7Solution,
      result: t.case7Result,
      tags: t.case7Tags.split(', '),
    },
    {
      id: 5,
      name: t.case5Name,
      category: 'admin',
      problem: t.case5Problem,
      solution: t.case5Solution,
      result: t.case5Result,
      tags: t.case5Tags.split(', '),
    },
    {
      id: 6,
      name: t.case6Name,
      category: 'ecommerce',
      problem: t.case6Problem,
      solution: t.case6Solution,
      result: t.case6Result,
      tags: t.case6Tags.split(', '),
    },
  ]
}

export default function CaseStudies() {
  const { t, dir } = useLanguage()
  const [activeFilter, setActiveFilter] = useState<Category>('all')

  const caseStudies = useCaseStudies(t)

  const filterButtons: { key: Category; label: string }[] = [
    { key: 'all', label: t.casesFilterAll },
    { key: 'portfolio', label: t.casesFilterPortfolio },
    { key: 'ecommerce', label: t.casesFilterEcommerce },
    { key: 'analytics', label: t.casesFilterAnalytics },
    { key: 'admin', label: t.casesFilterAdmin },
  ]

  const categoryLabels: Record<Exclude<Category, 'all'>, string> = {
    portfolio: t.casesFilterPortfolio,
    ecommerce: t.casesFilterEcommerce,
    analytics: t.casesFilterAnalytics,
    admin: t.casesFilterAdmin,
  }

  const filteredStudies =
    activeFilter === 'all'
      ? caseStudies
      : caseStudies.filter((study) => study.category === activeFilter)

  return (
    <section
      dir={dir}
      className="w-full py-16 md:py-24 bg-background relative overflow-hidden"
    >
      <SectionBackground variant="dark" particles={true}>
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-14"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t.casesTitle}
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {t.casesSubtitle}
          </p>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-10 md:mb-14"
        >
          <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
            {filterButtons.map((btn) => (
              <Button
                key={btn.key}
                variant={activeFilter === btn.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter(btn.key)}
                className={`text-sm px-4 cursor-pointer ${activeFilter === btn.key ? '' : 'hover:text-blue-500 hover:border-blue-500 hover:bg-blue-500/10'}`}
              >
                {btn.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          <AnimatePresence mode="popLayout">
            {filteredStudies.map((study) => {
              const config = categoryConfig[study.category]
              const CategoryIcon = config.icon

              return (
                <motion.div
                  key={study.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                >
                  <Card className="group h-full py-0 gap-0 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-border/60 relative frosted-card">
                    {/* Category Header Strip */}
                    <div
                      className={`${config.bgColor} px-5 py-3 flex items-center justify-between`}
                    >
                      <div className="flex items-center gap-2">
                        <CategoryIcon
                          className={`size-4 ${config.color} icon-bounce`}
                        />
                        <span
                          className={`text-xs font-semibold ${config.color}`}
                        >
                          {categoryLabels[study.category]}
                        </span>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`${config.bgColor} ${config.color} border-0 text-[10px] px-2 py-0.5`}
                      >
                        {study.category.toUpperCase()}
                      </Badge>
                    </div>

                    <CardContent className="p-5 flex flex-col gap-4">
                      {/* Project Name */}
                      <h3 className="text-lg font-bold text-foreground leading-tight">
                        {study.name}
                      </h3>

                      {/* Problem → Solution */}
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-start gap-2.5">
                          <span className="shrink-0 mt-1 size-1.5 rounded-full bg-destructive/70" />
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">
                              {t.casesProblem}
                            </span>
                            <p className="text-sm text-foreground/80 leading-relaxed">
                              {study.problem}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-center">
                          <div className="flex items-center gap-1 text-primary">
                            <ChevronDown className="size-3.5" />
                            <span className="text-[10px] font-semibold">
                              {t.casesSolution}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <span className="shrink-0 mt-1 size-1.5 rounded-full bg-blue-500" />
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">
                              {t.casesSolution}
                            </span>
                            <p className="text-sm text-foreground/80 leading-relaxed">
                              {study.solution}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Result */}
                      <div className="bg-primary/5 dark:bg-primary/10 rounded-lg p-3 flex items-center gap-3 border border-primary/10">
                        <div className="shrink-0 size-9 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                          <TrendingUp className="size-4 text-primary" />
                        </div>
                        <p className="text-sm font-semibold text-primary leading-tight">
                          {study.result}
                        </p>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {study.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-[10px] px-2 py-0.5 font-normal text-muted-foreground border-border/60"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>

                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
      </SectionBackground>
    </section>
  )
}
