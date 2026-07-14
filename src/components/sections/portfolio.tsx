'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
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
  Code2,
  Zap,
  Globe,
  Eye,
  Star,
  GitBranch,
  Layers,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/hooks/use-language'
import SectionBackground from '@/components/section-background'
import type { TranslationKeys } from '@/lib/i18n'

interface ProjectConfig {
  id: number | string
  icon: React.ElementType
  gradient: string
  accentColor: string
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

const staticProjects: ProjectConfig[] = []
const ITEMS_PER_PAGE = 3

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

const categoryColorMap: Record<string, string> = {
  'تحليل بيانات':   'from-cyan-500/40 via-cyan-600/20 to-transparent',
  'Data Analytics': 'from-cyan-500/40 via-cyan-600/20 to-transparent',
  'متجر إلكتروني':  'from-violet-500/40 via-violet-600/20 to-transparent',
  'E-Commerce':     'from-violet-500/40 via-violet-600/20 to-transparent',
  'سيستم إداري':    'from-blue-500/40 via-blue-600/20 to-transparent',
  'Admin System':   'from-blue-500/40 via-blue-600/20 to-transparent',
  'بورتفوليو':      'from-fuchsia-500/40 via-fuchsia-600/20 to-transparent',
  'Portfolio':      'from-fuchsia-500/40 via-fuchsia-600/20 to-transparent',
}

const categoryAccentMap: Record<string, string> = {
  'تحليل بيانات':   '#22d3ee',
  'Data Analytics': '#22d3ee',
  'متجر إلكتروني':  '#a78bfa',
  'E-Commerce':     '#a78bfa',
  'سيستم إداري':    '#60a5fa',
  'Admin System':   '#60a5fa',
  'بورتفوليو':      '#e879f9',
  'Portfolio':      '#e879f9',
}

// ─── Card Wrapper (3D tilt removed to fix hover jitter + cursor issues) ──
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  // Previously used rotateX/rotateY via mouse position which caused:
  //  - card jitter/shaking on mouse move (framer-motion updates every pixel)
  //  - cursor disappearing/changing because 3D transforms break hit-testing on edges
  // Now it's a simple pass-through wrapper. Hover effect handled by CSS (.cyber-card:hover).
  return (
    <div className={className}>
      {children}
    </div>
  )
}

// ─── Live Badge ────────────────────────────────────────────────────
function LiveBadge({ url }: { url?: string }) {
  if (!url) return null
  return (
    <div className="absolute top-3 start-3 z-10 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-green-500/30">
      <span className="live-dot" />
      <span className="text-[10px] font-semibold text-green-400 tracking-wider">LIVE</span>
    </div>
  )
}

// ─── Project Card ─────────────────────────────────────────────────
function ProjectCard({
  project,
  index,
  onClick,
  isRtl,
  t,
}: {
  project: ProjectConfig
  index: number
  onClick: () => void
  isRtl: boolean
  t: TranslationKeys
}) {
  const [imgError, setImgError] = useState(false)
  const Icon = project.icon
  const name = isRtl ? project.name : (project.nameEn || project.name)
  const cat = isRtl ? project.category : (project.categoryEn || project.category)
  const accent = categoryAccentMap[project.category] || categoryAccentMap[cat] || '#22d3ee'

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.23, 1, 0.32, 1] }}
    >
      <TiltCard>
        <div
          className="cyber-card cyber-card-corner group aspect-[16/11] relative overflow-hidden cursor-pointer"
          onClick={onClick}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
          tabIndex={0}
          role="button"
          aria-label={`${t.portfolioViewLabel}: ${name}`}
        >
          {/* Image / Background Layer */}
          <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} overflow-hidden`}>
            <LiveBadge url={project.externalUrl} />

            {/* Project Image with auto scroll-down/up animation on hover */}
            {!imgError && project.imageUrl ? (
              <div className="absolute inset-0 overflow-hidden">
                {/* The tall screenshot pans top→bottom→top on hover, like a user browsing the site */}
                <img
                  src={project.imageUrl}
                  alt={name}
                  loading="lazy"
                  onError={() => setImgError(true)}
                  className="card-scroll-preview absolute inset-x-0 top-0 w-full h-auto object-top"
                />
              </div>
            ) : (
              /* Fallback: gradient icon — also uses group-hover */
              <div className="absolute inset-0 flex items-center justify-center transition-all duration-500
                group-hover:scale-110"
              >
                <Icon className="size-28 text-white/25" />
              </div>
            )}

            {/* Hover overlay with project info - pure CSS group-hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-[1] opacity-0 group-hover:opacity-100 transition-opacity duration-350">
              <div className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-all duration-250 delay-50 translate-y-2 group-hover:translate-y-0">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider mb-2 w-fit transition-all duration-250 delay-75 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0"
                  style={{ background: `${accent}35`, border: `1px solid ${accent}60`, color: accent }}
                >
                  <Icon className="size-3" />
                  {cat}
                </span>

                <h3 className="text-lg font-bold text-white leading-tight transition-all duration-250 delay-100 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0">
                  {name}
                </h3>

                <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-white/80 transition-all duration-250 delay-150 opacity-0 group-hover:opacity-100 translate-y-5 group-hover:translate-y-0">
                  <Eye className="size-3.5" />
                  {isRtl ? 'عرض التفاصيل' : 'View Details'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </TiltCard>
    </motion.div>
  )
}

// ─── GallerySlider and the rest of the file follow (same as original)

function GallerySlider({ project, isRtl }: { project: ProjectConfig; isRtl: boolean }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [errors, setErrors] = useState<Set<number>>(new Set())
  const sources = [project.gallery1, project.gallery2, project.gallery3]
  const Icon = project.icon
  const accent = categoryAccentMap[project.category] || '#22d3ee'

  return (
    <div className="space-y-2">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIdx}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.3 }}
          className={`relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br ${project.gradient}`}
        >
          <Icon className="absolute inset-0 m-auto size-12 opacity-20" />
          {!errors.has(activeIdx) && (
            <img
              src={sources[activeIdx] || `/projects/${project.id}-${activeIdx + 1}.png`}
              alt={`slide-${activeIdx}`}
              onError={() => setErrors(prev => new Set(prev).add(activeIdx))}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div
            className="absolute bottom-3 end-3 px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-sm"
            style={{ background: `${accent}22`, border: `1px solid ${accent}44`, color: accent }}
          >
            {activeIdx + 1} / 3
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-2">
        {[0, 1, 2].map((i) => {
          const Icon2 = project.icon
          return (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`relative flex-1 aspect-video rounded-lg overflow-hidden transition-all duration-200 ${
                i === activeIdx
                  ? 'ring-2 scale-[1.03]'
                  : 'opacity-50 hover:opacity-80'
              }`}
              style={i === activeIdx ? { outline: `2px solid ${accent}`, outlineOffset: '2px' } : {}}
            >
              <div className={`w-full h-full bg-gradient-to-br ${project.gradient} flex items-center justify-center`}>
                <Icon2 className="size-4 opacity-20" />
                {!errors.has(i) && (
                  <img
                    src={sources[i] || `/projects/${project.id}-${i + 1}.png`}
                    alt={`thumb-${i}`}
                    onError={() => setErrors(prev => new Set(prev).add(i))}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
              </div>
              {i === activeIdx && (
                <div
                  className="absolute inset-0 rounded-lg"
                  style={{ boxShadow: `inset 0 0 0 2px ${accent}` }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ProjectModal({
  project,
  onClose,
  onStartProject,
  isRtl,
  t,
}: {
  project: ProjectConfig
  onClose: () => void
  onStartProject: () => void
  isRtl: boolean
  t: TranslationKeys
}) {
  const [modalImgError, setModalImgError] = useState(false)
  const Icon = project.icon
  const name = isRtl ? project.name : (project.nameEn || project.name)
  const cat = isRtl ? project.category : (project.categoryEn || project.category)
  const desc = isRtl ? project.description : (project.descriptionEn || project.description)
  const problem = isRtl ? project.problem : (project.problemEn || project.problem)
  const solution = isRtl ? project.solution : (project.solutionEn || project.solution)
  const result = isRtl ? project.result : (project.resultEn || project.result)
  const accent = categoryAccentMap[project.category] || categoryAccentMap[cat] || '#22d3ee'
  const techList = project.technologies.split(', ')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={name}
    >
      <motion.div
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto custom-scroll rounded-2xl"
        style={{
          background: 'rgba(8, 18, 38, 0.95)',
          border: `1px solid ${accent}33`,
          boxShadow: `0 25px 80px rgba(0,0,0,0.6), 0 0 60px ${accent}15, inset 0 1px 0 ${accent}10`,
        }}
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t.portfolioCloseLabel}
          className="absolute top-4 end-4 z-20 inline-flex items-center justify-center size-9 rounded-full border transition-all duration-200 hover:scale-110"
          style={{
            background: 'rgba(8, 18, 38, 0.9)',
            backdropFilter: 'blur(8px)',
            borderColor: `${accent}33`,
            color: accent,
          }}
        >
          <X className="size-4" />
        </button>

        <div className={`relative aspect-[21/9] bg-gradient-to-br ${project.gradient} overflow-hidden rounded-t-2xl`}>
          <Icon className="absolute inset-0 m-auto size-24 opacity-15" />
          {!modalImgError && project.imageUrl && (
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={project.imageUrl}
                alt={name}
                onError={() => setModalImgError(true)}
                className="modal-scroll-preview absolute inset-x-0 top-0 w-full h-auto object-top"
              />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#08122640] to-transparent" />
          {project.externalUrl && (
            <div className="absolute top-4 start-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-sm"
              style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(34,197,94,0.4)' }}>
              <span className="live-dot" />
              <span className="text-[10px] font-bold text-green-400 tracking-wider">LIVE PROJECT</span>
            </div>
          )}

          <div className="scan-line" />
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span
                className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider mb-2"
                style={{ background: `${accent}18`, border: `1px solid ${accent}35`, color: accent }}
              >
                {cat}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-foreground leading-tight">
                {name}
              </h2>
            </div>
            {project.externalUrl && (
              <a
                href={project.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
                style={{
                  background: `${accent}18`,
                  border: `1px solid ${accent}35`,
                  color: accent,
                  boxShadow: `0 0 15px ${accent}15`,
                }}
              >
                <Globe className="size-3.5" />
                {isRtl ? 'زيارة' : 'Visit'}
                <ExternalLink className="size-3" />
              </a>
            )}
          </div>

          <div className="space-y-1.5">
            <h4 className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: accent }}>
              {t.portfolioDescription}
            </h4>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {desc}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: accent }}>
              {t.portfolioGalleryLabel}
            </h4>
            <GallerySlider project={project} isRtl={isRtl} />
          </div>

          <div className="space-y-3">
            {[
              {
                icon: '⚡',
                label: t.portfolioProblem,
                content: problem,
                color: '#ef4444',
                bg: 'rgba(239,68,68,0.06)',
                border: 'rgba(239,68,68,0.18)',
              },
              {
                icon: '🔧',
                label: t.portfolioSolution,
                content: solution,
                color: accent,
                bg: `${accent}09`,
                border: `${accent}22`,
              },
              {
                icon: '🚀',
                label: t.portfolioResult,
                content: result,
                color: '#22c55e',
                bg: 'rgba(34,197,94,0.06)',
                border: 'rgba(34,197,94,0.20)',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-3 p-4 rounded-xl"
                style={{ background: item.bg, border: `1px solid ${item.border}` }}
              >
                <span className="text-lg mt-0.5 shrink-0">{item.icon}</span>
                <div>
                  <h4 className="text-[10px] font-bold tracking-wider mb-1" style={{ color: item.color }}>
                    {item.label}
                  </h4>
                  <p className="text-sm text-foreground/80 leading-relaxed">{item.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2.5">
            <h4 className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: accent }}>
              {t.portfolioTechnologiesLabel}
            </h4>
            <div className="flex flex-wrap gap-2">
              {techList.map((tech) => (
                <span key={tech} className="cyber-badge">{tech}</span>
              ))}
            </div>
          </div>

          <div className="pt-2 space-y-2.5">
            <button
              type="button"
              onClick={onStartProject}
              className="w-full h-12 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${accent}, #7c3aed)`,
                color: '#fff',
                boxShadow: `0 4px 20px ${accent}30`,
              }}
            >
              <Zap className="size-4" />
              {t.navStartProject}
              {isRtl ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

const FILTERS = ['all', 'ecommerce', 'portfolio', 'analytics', 'admin'] as const
type Filter = typeof FILTERS[number]

function FilterBar({
  activeFilter,
  onChange,
  t,
}: {
  activeFilter: Filter
  onChange: (f: Filter) => void
  t: TranslationKeys
}) {
  const labels: Record<Filter, string> = {
    all: t.casesFilterAll,
    ecommerce: t.casesFilterEcommerce,
    portfolio: t.casesFilterPortfolio,
    analytics: t.casesFilterAnalytics,
    admin: t.casesFilterAdmin,
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center mb-8">
      {FILTERS.map((f) => {
        const isActive = f === activeFilter
        return (
          <button
            key={f}
            onClick={() => onChange(f)}
            className="relative px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300"
            style={
              isActive
                ? {
                    background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(124,58,237,0.2))',
                    border: '1px solid rgba(34,211,238,0.5)',
                    color: '#22d3ee',
                    boxShadow: '0 0 15px rgba(34,211,238,0.15)',
                  }
                : {
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'var(--muted-foreground)',
                  }
            }
          >
            {isActive && (
              <motion.div
                layoutId="filter-active"
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(34,211,238,0.08), rgba(124,58,237,0.08))',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )}
            <span className="relative z-10">{labels[f]}</span>
          </button>
        )
      })}
    </div>
  )
}

export default function Portfolio() {
  const { t, dir } = useLanguage()
  const isRtl = dir === 'rtl'
  const [selectedProject, setSelectedProject] = useState<ProjectConfig | null>(null)
  const [activeFilter, setActiveFilter] = useState<Filter>('all')
  const [currentPage, setCurrentPage] = useState(0)
  const [dbProjects, setDbProjects] = useState<ProjectConfig[]>([])

  useEffect(() => {
    fetch('/api/portfolio')
      .then(res => res.json())
      .then(data => {
        if (data.items && Array.isArray(data.items)) {
          const mapped: ProjectConfig[] = data.items.map((item: Record<string, unknown>) => {
            const category = (item.category as string) || ''
            const Icon = categoryIconMap[category] || BarChart3
            const gradient = categoryColorMap[category] || 'from-cyan-500/30 via-cyan-600/15 to-transparent'
            const accentColor = categoryAccentMap[category] || '#22d3ee'
            return {
              id: item.id as string,
              icon: Icon,
              gradient,
              accentColor,
              name: (item.name as string) || '',
              nameEn: (item.nameEn as string) || item.name as string || '',
              description: (item.description as string) || '',
              descriptionEn: (item.descriptionEn as string) || item.description as string || '',
              category,
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

  const staticWithI18n: ProjectConfig[] = staticProjects.map(p => {
    // Static projects have hardcoded bilingual data, no need for i18n keys
    return { ...p }
  })

  const allProjects = [...dbProjects, ...staticWithI18n]

  const handleFilterChange = (f: Filter) => {
    setActiveFilter(f)
    setCurrentPage(0)
  }

  const getProjectCat = (p: ProjectConfig) => isRtl ? p.category : (p.categoryEn || p.category)

  const filteredProjects = activeFilter === 'all'
    ? allProjects
    : allProjects.filter(p => {
        const cat = getProjectCat(p)
        if (activeFilter === 'ecommerce') return cat.includes('متجر') || cat.toLowerCase().includes('commerce')
        if (activeFilter === 'portfolio') return cat.includes('بورتفوليو') || cat.toLowerCase().includes('portfolio')
        if (activeFilter === 'analytics') return cat.includes('تحليل') || cat.toLowerCase().includes('analytics')
        if (activeFilter === 'admin') return cat.includes('سيستم') || cat.toLowerCase().includes('admin')
        return true
      })

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / ITEMS_PER_PAGE))
  const currentProjects = filteredProjects.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  )

  const nextPage = () => setCurrentPage(prev => (prev + 1) % totalPages)
  const prevPage = () => setCurrentPage(prev => (prev - 1 + totalPages) % totalPages)

  const handleStartProject = () => {
    setSelectedProject(null)
    setTimeout(() => {
      document.querySelector('#project-builder')?.scrollIntoView({ behavior: 'smooth' })
    }, 150)
  }

  return (
    <section
      id="portfolio"
      dir={dir}
      className="w-full py-20 md:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      <SectionBackground variant="mixed" particles={true}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="blur-orb w-96 h-96 bg-cyan-500 -top-20 -start-20 opacity-10" />
          <div className="blur-orb w-80 h-80 bg-violet-600 bottom-10 -end-20 opacity-10" />
        </div>

        <div className="mx-auto max-w-6xl relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
              style={{
                background: 'rgba(34,211,238,0.08)',
                border: '1px solid rgba(34,211,238,0.25)',
              }}
            >
              <Layers className="size-3.5 text-cyan-400" />
              <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-cyan-400">
                {isRtl ? 'أعمالنا المنجزة' : 'Our Work'}
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 leading-tight">
              <span className="gradient-text-cyber">{t.portfolioTitle}</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              {t.portfolioSubtitle}
            </p>

            <div className="section-divider mt-6" />
          </motion.div>

          <FilterBar activeFilter={activeFilter} onChange={handleFilterChange} t={t} />

          <div className="relative">
            {totalPages > 1 && (
              <>
                <button
                  onClick={prevPage}
                  aria-label={isRtl ? 'السابق' : 'Previous'}
                  className="absolute top-1/2 -translate-y-1/2 -start-4 sm:-start-6 z-10 inline-flex items-center justify-center size-11 rounded-full transition-all duration-200 hover:scale-110"
                  style={{
                    background: 'rgba(8,18,38,0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(34,211,238,0.25)',
                    color: '#22d3ee',
                    boxShadow: '0 0 15px rgba(34,211,238,0.1)',
                  }}
                >
                  {isRtl ? <ChevronRight className="size-5" /> : <ChevronLeft className="size-5" />}
                </button>
                <button
                  onClick={nextPage}
                  aria-label={isRtl ? 'التالي' : 'Next'}
                  className="absolute top-1/2 -translate-y-1/2 -end-4 sm:-end-6 z-10 inline-flex items-center justify-center size-11 rounded-full transition-all duration-200 hover:scale-110"
                  style={{
                    background: 'rgba(8,18,38,0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(34,211,238,0.25)',
                    color: '#22d3ee',
                    boxShadow: '0 0 15px rgba(34,211,238,0.1)',
                  }}
                >
                  {isRtl ? <ChevronLeft className="size-5" /> : <ChevronRight className="size-5" />}
                </button>
              </>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage + activeFilter}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7"
              >
                {currentProjects.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    index={index}
                    onClick={() => setSelectedProject(project)}
                    isRtl={isRtl}
                    t={t}
                  />
                ))}

                {currentProjects.length === 0 && (
                  <div className="col-span-full py-20 text-center text-muted-foreground">
                    <GitBranch className="size-12 mx-auto mb-4 opacity-30" />
                    <p className="text-sm">{isRtl ? 'لا توجد مشاريع في هذه الفئة' : 'No projects in this category'}</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={
                      i === currentPage
                        ? {
                            width: 32,
                            background: 'linear-gradient(90deg, #22d3ee, #7c3aed)',
                            boxShadow: '0 0 8px rgba(34,211,238,0.5)',
                          }
                        : {
                            width: 8,
                            background: 'rgba(255,255,255,0.15)',
                          }
                    }
                    aria-label={`Page ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </SectionBackground>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            onStartProject={handleStartProject}
            isRtl={isRtl}
            t={t}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
