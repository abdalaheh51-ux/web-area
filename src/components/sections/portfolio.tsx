'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ShoppingBag,
  Settings,
  Palette,
  BarChart3,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/hooks/use-language'
import SectionBackground from '@/components/section-background'
import type { TranslationKeys } from '@/lib/i18n'

interface ProjectConfig {
  id: number | string
  icon: React.ElementType
  gradient: string
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  category: string
  categoryEn: string
  technologies: string
  problem: string
  problemEn: string
  solution: string
  solutionEn: string
  result: string
  resultEn: string
  imageUrl: string | null
  gallery1: string | null
  gallery2: string | null
  gallery3: string | null
  externalUrl?: string
}

// Static projects removed - now all projects come from database
const staticProjects: ProjectConfig[] = []

const ITEMS_PER_PAGE = 6

function pick<T>(t: TranslationKeys, key: string): string {
  return (t as unknown as Record<string, string>)[key] ?? ''
}

const categoryIconMap: Record<string, React.ElementType> = {
  'تحليل بيانات': BarChart3,
  'Data Analytics': BarChart3,
  'متجر إلكتروني': ShoppingBag,
  'E-Commerce': ShoppingBag,
  'سيستم إداري': Settings,
  'Admin System': Settings,
  'بورتفوليو': Palette,
  'Portfolio': Palette,
}

export default function Portfolio() {
  const { t, dir } = useLanguage()
  const isRtl = dir === 'rtl'
  const [selectedProject, setSelectedProject] = useState<ProjectConfig | null>(null)
  const [imgErrorIds, setImgErrorIds] = useState<Set<string | number>>(new Set())
  const [modalImgError, setModalImgError] = useState(false)
  const [galleryImgErrors, setGalleryImgErrors] = useState<Set<string>>(new Set())
  const [activeFilter, setActiveFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(0)
  const [dbProjects, setDbProjects] = useState<ProjectConfig[]>([])

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight

  // Fetch projects from database
  useEffect(() => {
    fetch('/api/portfolio')
      .then(res => res.json())
      .then(data => {
        if (data.items && Array.isArray(data.items)) {
          const mapped: ProjectConfig[] = data.items.map((item: Record<string, unknown>) => {
            const category = (item.category as string) || ''
            const Icon = categoryIconMap[category] || BarChart3
            return {
              id: item.id as string,
              icon: Icon,
              gradient: 'from-cyan-500/30',
              name: (item.name as string) || '',
              nameEn: (item.nameEn as string) || item.name as string || '',
              description: (item.description as string) || '',
              descriptionEn: (item.descriptionEn as string) || item.description as string || '',
              category: category,
              categoryEn: (item.category as string) || '',
              technologies: (item.technologies as string) || '',
              problem: (item.problem as string) || '',
              problemEn: (item.problemEn as string) || item.problem as string || '',
              solution: (item.solution as string) || '',
              solutionEn: (item.solutionEn as string) || item.solution as string || '',
              result: (item.result as string) || '',
              resultEn: (item.resultEn as string) || item.result as string || '',
              imageUrl: (item.imageUrl as string) || null,
              gallery1: (item.gallery1 as string) || null,
              gallery2: (item.gallery2 as string) || null,
              gallery3: (item.gallery3 as string) || null,
              externalUrl: (item.externalUrl as string) || undefined,
            }
          })
          setDbProjects(mapped)
        }
      })
      .catch(() => {})
  }, [])

  // Fill static projects with i18n data
  const staticWithI18n: ProjectConfig[] = staticProjects.map(p => {
    const id = p.id as number
    return {
      ...p,
      name: pick(t, `project${id}Name`),
      nameEn: pick(t, `project${id}Name`),
      description: pick(t, `project${id}Desc`),
      descriptionEn: pick(t, `project${id}Desc`),
      category: pick(t, `project${id}Cat`),
      categoryEn: pick(t, `project${id}Cat`),
      technologies: pick(t, `project${id}Tech`),
      problem: pick(t, `case${id === 7 ? 7 : id === 1 ? 1 : id === 2 ? 2 : id === 3 ? 4 : id === 4 ? 7 : id === 5 ? 5 : id === 6 ? 6 : 1}Problem`),
      problemEn: pick(t, `case${id === 7 ? 7 : id === 1 ? 1 : id === 2 ? 2 : id === 3 ? 4 : id === 4 ? 7 : id === 5 ? 5 : id === 6 ? 6 : 1}Problem`),
      solution: pick(t, `case${id === 7 ? 7 : id === 1 ? 1 : id === 2 ? 2 : id === 3 ? 4 : id === 4 ? 7 : id === 5 ? 5 : id === 6 ? 6 : 1}Solution`),
      solutionEn: pick(t, `case${id === 7 ? 7 : id === 1 ? 1 : id === 2 ? 2 : id === 3 ? 4 : id === 4 ? 7 : id === 5 ? 5 : id === 6 ? 6 : 1}Solution`),
      result: pick(t, `case${id === 7 ? 7 : id === 1 ? 1 : id === 2 ? 2 : id === 3 ? 4 : id === 4 ? 7 : id === 5 ? 5 : id === 6 ? 6 : 1}Result`),
      resultEn: pick(t, `case${id === 7 ? 7 : id === 1 ? 1 : id === 2 ? 2 : id === 3 ? 4 : id === 4 ? 7 : id === 5 ? 5 : id === 6 ? 6 : 1}Result`),
    }
  })

  // Merge: DB projects first (newest), then static
  const allProjects = [...dbProjects, ...staticWithI18n]

  const handleImgError = (id: string | number) => {
    setImgErrorIds((prev) => new Set(prev).add(id))
  }

  const handleGalleryError = (key: string) => {
    setGalleryImgErrors((prev) => new Set(prev).add(key))
  }

  const handleCloseModal = () => {
    setSelectedProject(null)
    setModalImgError(false)
    setGalleryImgErrors(new Set())
  }

  const handleStartProject = () => {
    handleCloseModal()
    setTimeout(() => {
      document.querySelector('#project-builder')?.scrollIntoView({ behavior: 'smooth' })
    }, 150)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') handleCloseModal()
  }

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter)
    setCurrentPage(0)
  }

  // Get display name based on language
  const getProjectName = (p: ProjectConfig) => isRtl ? p.name : (p.nameEn || p.name)
  const getProjectDesc = (p: ProjectConfig) => isRtl ? p.description : (p.descriptionEn || p.description)
  const getProjectCat = (p: ProjectConfig) => isRtl ? p.category : (p.categoryEn || p.category)
  const getProjectProblem = (p: ProjectConfig) => isRtl ? p.problem : (p.problemEn || p.problem)
  const getProjectSolution = (p: ProjectConfig) => isRtl ? p.solution : (p.solutionEn || p.solution)
  const getProjectResult = (p: ProjectConfig) => isRtl ? p.result : (p.resultEn || p.result)

  const filteredProjects = activeFilter === 'all'
    ? allProjects
    : allProjects.filter(p => {
        const cat = getProjectCat(p)
        if (activeFilter === 'ecommerce') return cat.includes('متجر') || cat.includes('E-Commerce')
        if (activeFilter === 'portfolio') return cat.includes('بورتفوليو') || cat.includes('Portfolio')
        if (activeFilter === 'analytics') return cat.includes('تحليل') || cat.includes('Analytics')
        if (activeFilter === 'admin') return cat.includes('سيستم') || cat.includes('Admin')
        if (activeFilter === 'landing') return cat.includes('صفحة هبوط') || cat.includes('Landing Page')
        if (activeFilter === 'corporate') return cat.includes('موقع شركات') || cat.includes('Corporate Website')
        return true
      })

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / ITEMS_PER_PAGE))
  const currentProjects = filteredProjects.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  )

  const nextPage = () => setCurrentPage(prev => (prev + 1) % totalPages)
  const prevPage = () => setCurrentPage(prev => (prev - 1 + totalPages) % totalPages)

  return (
    <section
      id="portfolio"
      dir={dir}
      className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden"
    >
      <SectionBackground variant="mixed" particles={true}>
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10 md:mb-14"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-3">
              {t.portfolioTitle}
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              {t.portfolioSubtitle}
            </p>
          </motion.div>

          {/* Filter Tags */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {['all', 'ecommerce', 'portfolio', 'analytics', 'admin', 'landing', 'corporate'].map((tag) => (
              <button
                key={tag}
                onClick={() => handleFilterChange(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  activeFilter === tag
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-blue-500'
                }`}
              >
                {tag === 'all' ? t.casesFilterAll :
                 tag === 'ecommerce' ? t.casesFilterEcommerce :
                 tag === 'portfolio' ? t.casesFilterPortfolio :
                 tag === 'analytics' ? t.casesFilterAnalytics :
                 tag === 'admin' ? t.casesFilterAdmin :
                 tag === 'landing' ? (isRtl ? 'صفحة هبوط' : 'Landing Page') :
                 (isRtl ? 'موقع شركات' : 'Corporate Website')}
              </button>
            ))}
          </div>

          {/* Projects Grid with external navigation */}
          <div className="relative">
            {/* Previous button - outside left */}
            {totalPages > 1 && (
              <button
                onClick={prevPage}
                aria-label={dir === 'rtl' ? 'السابق' : 'Previous'}
                className="absolute top-1/2 -translate-y-1/2 -left-3 sm:-left-5 z-10 inline-flex items-center justify-center size-11 rounded-full bg-background/90 backdrop-blur-sm border border-border/60 text-foreground hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all duration-200 shadow-lg"
              >
                {dir === 'rtl' ? <ChevronRight className="size-5" /> : <ChevronLeft className="size-5" />}
              </button>
            )}

            {/* Next button - outside right */}
            {totalPages > 1 && (
              <button
                onClick={nextPage}
                aria-label={dir === 'rtl' ? 'التالي' : 'Next'}
                className="absolute top-1/2 -translate-y-1/2 -right-3 sm:-right-5 z-10 inline-flex items-center justify-center size-11 rounded-full bg-background/90 backdrop-blur-sm border border-border/60 text-foreground hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all duration-200 shadow-lg"
              >
                {dir === 'rtl' ? <ChevronLeft className="size-5" /> : <ChevronRight className="size-5" />}
              </button>
            )}

            {/* Cards grid - 3 cols, 2 rows = 6 per page */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage + activeFilter}
                initial={{ opacity: 0, x: dir === 'rtl' ? 30 : -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir === 'rtl' ? -30 : 30 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
              >
                {currentProjects.map((project, index) => {
                  const Icon = project.icon
                  const hasImgError = imgErrorIds.has(project.id)
                  const projectCat = getProjectCat(project)
                  const projectName = getProjectName(project)

                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.06 }}
                    >
                      <Card
                        onClick={() => setSelectedProject(project)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setSelectedProject(project)
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`${t.portfolioViewLabel}: ${projectName}`}
                        className="group h-full py-0 gap-0 overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border-border/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 frosted-card"
                      >
                        {/* Image */}
                        <div
                          className={`relative aspect-[4/3] bg-gradient-to-br ${project.gradient} to-transparent flex items-center justify-center overflow-hidden`}
                        >
                          <Icon className="size-16 text-foreground/20 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" />
                          {!hasImgError && project.imageUrl && (
                            <img
                              src={project.imageUrl}
                              alt={projectName}
                              loading="lazy"
                              onError={() => handleImgError(project.id)}
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          )}
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300 flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 py-2 rounded-lg bg-background/90 backdrop-blur-sm text-sm font-semibold text-primary shadow-lg">
                              {t.portfolioViewLabel}
                            </span>
                          </div>
                        </div>

                        {/* Name + Category */}
                        <div className="p-4 text-center">
                          <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">
                            {projectName}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">{projectCat}</p>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </motion.div>
            </AnimatePresence>

            {/* Page dots */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === currentPage
                        ? 'w-8 bg-gradient-to-l from-blue-500 to-amber-500'
                        : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                    aria-label={`Page ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </SectionBackground>

      {/* Project Detail Modal - no nav buttons inside */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleCloseModal}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-label={getProjectName(selectedProject)}
          >
            <motion.div
              className="relative bg-card rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto custom-scroll shadow-2xl border border-border/60 frosted-glass"
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button only */}
              <button
                type="button"
                onClick={handleCloseModal}
                aria-label={t.portfolioCloseLabel}
                className="absolute top-3 ltr:right-3 rtl:left-3 z-20 inline-flex items-center justify-center size-9 rounded-full bg-background/85 backdrop-blur-sm border border-border/60 text-foreground hover:bg-background hover:scale-105 transition-all duration-200 shadow-sm"
              >
                <X className="size-4" />
              </button>

              {/* Main image */}
              <div
                className={`relative aspect-[16/9] bg-gradient-to-br ${selectedProject.gradient} to-transparent flex items-center justify-center overflow-hidden rounded-t-2xl`}
              >
                {(() => {
                  const MainIcon = selectedProject.icon
                  return <MainIcon className="size-20 text-foreground/25" />
                })()}
                {!modalImgError && selectedProject.imageUrl && (
                  <img
                    src={selectedProject.imageUrl}
                    alt={getProjectName(selectedProject)}
                    onError={() => setModalImgError(true)}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Content */}
              <div className="p-5 sm:p-6 space-y-5">
                {/* Header */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {getProjectCat(selectedProject)}
                    </Badge>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    {getProjectName(selectedProject)}
                  </h2>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-1">
                    {t.portfolioDescription}
                  </h4>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {getProjectDesc(selectedProject)}
                  </p>
                </div>

                {/* Gallery */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                    {t.portfolioGalleryLabel}
                  </h4>
                  <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {[1, 2, 3].map((n) => {
                      const key = `${selectedProject.id}-${n}`
                      const hasError = galleryImgErrors.has(key)
                      const GalleryIcon = selectedProject.icon
                      return (
                        <div
                          key={n}
                          className={`relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br ${selectedProject.gradient} to-transparent flex items-center justify-center border border-border/40 shrink-0 w-[80%] snap-center`}
                        >
                          <GalleryIcon className="size-6 text-foreground/20" />
                          {!hasError && (
                            <img
                              src={n === 1 ? (selectedProject.gallery1 || `/projects/${selectedProject.id}-1.png`) : n === 2 ? (selectedProject.gallery2 || `/projects/${selectedProject.id}-2.png`) : (selectedProject.gallery3 || `/projects/${selectedProject.id}-3.png`)}
                              alt={`${getProjectName(selectedProject)} - ${n}`}
                              loading="lazy"
                              onError={() => handleGalleryError(key)}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-[10px] text-muted-foreground/50 text-center">
                    {dir === 'rtl' ? '← اسحب لرؤية المزيد ←' : '→ Drag to see more →'}
                  </p>
                </div>

                {/* Challenge / Solution / Result */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/5 border border-destructive/10">
                    <div className="shrink-0 mt-0.5 size-2 rounded-full bg-destructive/60" />
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-1">{t.portfolioProblem}</h4>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {getProjectProblem(selectedProject)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                    <div className="shrink-0 mt-0.5 size-2 rounded-full bg-blue-500" />
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-1">{t.portfolioSolution}</h4>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {getProjectSolution(selectedProject)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="shrink-0 size-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="size-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-0.5">{t.portfolioResult}</h4>
                      <p className="text-sm font-semibold text-primary">
                        {getProjectResult(selectedProject)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Technologies */}
                <div>
                  <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2">
                    {t.portfolioTechnologiesLabel}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.technologies.split(', ').map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs px-3 py-1 font-normal text-muted-foreground border-border/60">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* CTA buttons */}
                <div className="pt-2 space-y-2">
                  {selectedProject.externalUrl && (
                    <a href={selectedProject.externalUrl} target="_blank" rel="noopener noreferrer" className="block">
                      <Button type="button" size="lg" className="w-full bg-gradient-to-l from-cyan-600 to-blue-500 hover:from-cyan-700 hover:to-blue-600 text-white font-bold text-base h-12 rounded-xl shadow-lg shadow-cyan-500/20 transition-all duration-300 gap-2">
                        <ExternalLink className="size-5" />
                        {dir === 'rtl' ? 'زيارة الموقع' : 'Visit Website'}
                      </Button>
                    </a>
                  )}
                  <Button type="button" onClick={handleStartProject} size="lg" className="w-full bg-gradient-to-l from-blue-600 to-amber-500 hover:from-blue-700 hover:to-amber-600 text-white font-bold text-base h-12 rounded-xl shadow-lg shadow-primary/20 transition-all duration-300">
                    <motion.span className="inline-flex items-center gap-2" whileHover={{ x: dir === 'rtl' ? -4 : 4 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                      {t.navStartProject}
                      <ArrowIcon className="size-5" />
                    </motion.span>
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
