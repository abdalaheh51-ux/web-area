'use client'

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react'
import { Menu, Sun, Moon, Languages, User, LogIn, LogOut, LayoutDashboard } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useLanguage } from '@/hooks/use-language'
import { useAuth } from '@/hooks/use-auth'
import AuthModal from '@/components/auth-modal'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet'

const SECTION_IDS = ['hero', 'growth', 'cases', 'portfolio', 'project-builder', 'why-us', 'comments'] as const

const subscribeNoop = () => () => {}
const getSnapshotClient = () => true
const getSnapshotServer = () => false
function useMounted() {
  return useSyncExternalStore(subscribeNoop, getSnapshotClient, getSnapshotServer)
}

function scrollToSection(href: string) {
  const target = document.querySelector(href)
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' })
    return
  }

  if (href.startsWith('#')) {
    window.location.href = `/${href}`
  }
}

export default function Navbar() {
  const { t, dir, lang, toggleLanguage } = useLanguage()
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState<string>('hero')
  const [authOpen, setAuthOpen] = useState(false)
  const { user, logout } = useAuth()

  const navLinks = [
    { label: t.navHome, href: '#hero' },
    { label: t.navGrowth, href: '#growth' },
    { label: t.navWork, href: '#portfolio' },
    { label: t.navProjectBuilder, href: '#project-builder' },
    { label: t.navWhyUs, href: '#why-us' },
    { label: t.navPortfolio, href: '#cases' },
    { label: t.navComments, href: '#comments' },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin: '-45% 0px -45% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    )

    const els: Element[] = []
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id)
      if (el) {
        observer.observe(el)
        els.push(el)
      }
    })

    return () => {
      els.forEach((el) => observer.unobserve(el))
      observer.disconnect()
    }
  }, [])

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string, after?: () => void) => {
      e.preventDefault()
      scrollToSection(href)
      after?.()
    },
    []
  )

  const handleStartProject = useCallback((e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    e.preventDefault()
    scrollToSection('#project-builder')
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const sheetSide: 'left' | 'right' = dir === 'rtl' ? 'left' : 'right'

  return (
    <>
      <nav
        dir={dir}
        aria-label={dir === 'rtl' ? 'التنقل الرئيسي' : 'Main navigation'}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'h-14' : 'h-16'
        }`}
      >
        {/* Background layers */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient mesh background */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              scrolled ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              background: `
                radial-gradient(circle at 20% 50%, rgba(37, 99, 235, 0.08), transparent 50%),
                radial-gradient(circle at 80% 50%, rgba(245, 158, 11, 0.06), transparent 50%),
                radial-gradient(circle at 50% 0%, rgba(34, 211, 238, 0.05), transparent 50%)
              `,
            }}
          />

          {/* Subtle gradient background — theme-aware via utility classes */}
          <div
            className={`absolute inset-0 bg-background/80 transition-opacity duration-500 ${
              scrolled ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Glassmorphism blur overlay */}
          <div
            className={`absolute inset-0 backdrop-blur-md transition-opacity duration-500 ${
              scrolled ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Noise texture */}
          <div className={`absolute inset-0 nav-noise transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'}`} />
        </div>

        {/* Soft gradient shadow below navbar when scrolled */}
        {scrolled && (
          <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none bg-gradient-to-b from-foreground/10 to-transparent" />
        )}

        {/* Content */}
        <div className="relative mx-auto max-w-7xl flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <a
            href="/"
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
            className="flex items-center gap-2.5 group shrink-0"
            aria-label={dir === 'rtl' ? 'العودة للصفحة الرئيسية - Web Area' : 'Back to homepage - Web Area'}
          >
            <div
              className={`relative rounded-full overflow-hidden ring-2 transition-all duration-300 nav-logo-glow ${
                scrolled ? 'w-8 h-8 ring-cyan-400/40' : 'w-10 h-10 ring-cyan-300/50'
              } group-hover:ring-cyan-300/70 group-hover:scale-110 group-hover:rotate-6`}
            >
              <img
                src="/logo.png"
                alt="Web Area Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span
              className={`font-bold text-foreground whitespace-nowrap group-hover:text-primary transition-all duration-300 max-[360px]:hidden ${
                scrolled ? 'text-base' : 'text-lg'
              }`}
            >
              Web Area
            </span>
          </a>

          {/* Desktop Navigation - centered links */}
          <div className="hidden xl:flex items-center gap-2 2xl:gap-4 absolute left-1/2 -translate-x-1/2 max-w-[45%] 2xl:max-w-[55%] justify-center">
            {navLinks.map((link) => {
              const isActive = activeId === link.href.replace('#', '')
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  aria-label={link.label}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative text-sm font-medium transition-colors duration-200 hover:text-blue-500 ${
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-1.5 left-0 right-0 h-0.5 rounded-full bg-gradient-to-l from-blue-500 to-amber-500 transition-transform duration-300 ${
                      isActive ? 'scale-x-100' : 'scale-x-0'
                    }`}
                    style={{ transformOrigin: dir === 'rtl' ? 'right' : 'left' }}
                  />
                </a>
              )
            })}
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-1 2xl:gap-2 shrink-0 ml-auto">
            {/* Auth Button */}
            {mounted && user ? (
              <button
                onClick={() => setAuthOpen(true)}
                className="relative group flex items-center gap-1.5 px-1.5 py-1 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-all"
                aria-label={t.authWelcome}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-foreground/80 max-w-[50px] truncate hidden 3xl:inline">
                  {user.name || user.email}
                </span>
              </button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAuthOpen(true)}
                className="text-muted-foreground hover:text-blue-500 gap-1 transition-transform hover:scale-105 px-2"
                aria-label={t.authLogin}
              >
                <LogIn className="h-4 w-4" />
                <span className="text-xs font-semibold hidden 3xl:inline">{t.authLogin}</span>
              </Button>
            )}

            {/* Admin Dashboard Button - only for admins */}
            {mounted && user?.role === 'admin' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/admin'}
                className="text-muted-foreground hover:text-blue-500 gap-1 transition-transform hover:scale-105 px-2"
                aria-label={dir === 'rtl' ? 'لوحة الإدارة' : 'Admin Dashboard'}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="text-xs font-semibold hidden 3xl:inline">
                  {dir === 'rtl' ? 'الإدارة' : 'Admin'}
                </span>
              </Button>
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={
                mounted && theme === 'dark'
                  ? (dir === 'rtl' ? 'التبديل إلى الوضع الفاتح' : 'Switch to light mode')
                  : (dir === 'rtl' ? 'التبديل إلى الوضع الداكن' : 'Switch to dark mode')
              }
              className="text-muted-foreground hover:text-blue-500 transition-transform hover:scale-110"
            >
              {mounted && theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Vertical Divider */}
            <div className="h-6 w-px bg-gradient-to-b from-transparent via-border to-transparent" aria-hidden="true" />

            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="text-muted-foreground hover:text-blue-500 gap-1.5 transition-transform hover:scale-105"
              aria-label={dir === 'rtl' ? 'التبديل إلى الإنجليزية' : 'Switch to Arabic'}
            >
              <Languages className="h-4 w-4" />
              <span className="text-xs font-semibold hidden 2xl:inline">
                {lang === 'ar' ? 'EN' : 'عربي'}
              </span>
            </Button>

            {/* Vertical Divider - hidden on smaller laptops */}
            <div className="h-6 w-px bg-gradient-to-b from-transparent via-border to-transparent hidden xl:block" aria-hidden="true" />

            {/* Start Project CTA - with neon glow, shimmer, and animated gradient */}
            <Button
              size="sm"
              onClick={handleStartProject}
              aria-label={t.navStartProject}
              className="relative overflow-hidden navbar-cta-gradient text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-shadow duration-300 px-2 xl:px-3 2xl:px-4"
            >
              {/* Shimmer overlay */}
              <span className="navbar-shimmer absolute inset-0 pointer-events-none" aria-hidden="true" />
              {/* Neon glow ring */}
              <span
                className="absolute inset-0 rounded-md pointer-events-none"
                style={{ boxShadow: '0 0 15px rgba(34, 211, 238, 0.4), inset 0 0 10px rgba(34, 211, 238, 0.1)' }}
                aria-hidden="true"
              />
              <span className="relative z-10 text-xs xl:text-sm">{t.navStartProject}</span>
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" aria-label={t.navOpenMenu} aria-expanded={open}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t.navOpenMenu}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side={sheetSide} className="w-full sm:w-80" dir={dir}>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-cyan-300/50 shrink-0 nav-logo-glow">
                    <img
                      src="/logo.png"
                      alt="Web Area Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span>Web Area</span>
                </SheetTitle>
                <SheetDescription className="sr-only">{t.navOpenMenu}</SheetDescription>
              </SheetHeader>

              {/* Mobile toggles (theme + language) */}
              <div className="flex items-center gap-2 px-4 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTheme}
                  className="flex-1 gap-1.5"
                  aria-label={dir === 'rtl' ? 'تبديل المظهر' : 'Toggle theme'}
                >
                  {mounted && theme === 'dark' ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                  <span className="text-xs">{mounted && theme === 'dark' ? 'Light' : 'Dark'}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleLanguage}
                  className="flex-1 gap-1.5"
                  aria-label={dir === 'rtl' ? 'تبديل اللغة' : 'Toggle language'}
                >
                  <Languages className="h-4 w-4" />
                  <span className="text-xs font-semibold">
                    {lang === 'ar' ? 'EN' : 'عربي'}
                  </span>
                </Button>
              </div>

              {/* Mobile Auth Button */}
              <div className="px-4 mt-2">
                {mounted && user ? (
                  <SheetClose asChild>
                    <button
                      onClick={() => setAuthOpen(true)}
                      className="w-full flex items-center gap-2 p-2 rounded-lg bg-foreground/5 hover:bg-foreground/10 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 text-right">
                        <p className="text-xs font-semibold text-foreground truncate">{user.name || 'User'}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </button>
                  </SheetClose>
                ) : (
                  <SheetClose asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5"
                      onClick={() => setAuthOpen(true)}
                    >
                      <LogIn className="h-4 w-4" />
                      {t.authLogin}
                    </Button>
                  </SheetClose>
                )}
              </div>

              {/* Admin Dashboard - mobile, only for admins */}
              {mounted && user?.role === 'admin' && (
                <div className="px-4 mt-2">
                  <SheetClose asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 border-blue-500/30 text-blue-500"
                      onClick={() => window.location.href = '/admin'}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      {dir === 'rtl' ? 'لوحة الإدارة' : 'Admin Dashboard'}
                    </Button>
                  </SheetClose>
                </div>
              )}

              <div className="flex flex-col gap-1 px-4 mt-4">
                {navLinks.map((link) => {
                  const isActive = activeId === link.href.replace('#', '')
                  return (
                    <SheetClose asChild key={link.href}>
                      <a
                        href={link.href}
                        onClick={(e) => handleNavClick(e, link.href, () => setOpen(false))}
                        aria-label={link.label}
                        aria-current={isActive ? 'page' : undefined}
                        className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 hover:text-blue-500 ${
                          isActive
                            ? 'text-foreground bg-accent'
                            : 'text-muted-foreground hover:bg-accent'
                        }`}
                      >
                        {link.label}
                      </a>
                    </SheetClose>
                  )
                })}
                <div className="mt-4 pt-4 border-t">
                  <SheetClose asChild>
                    <Button
                      className="w-full relative overflow-hidden navbar-cta-gradient text-white font-semibold"
                      onClick={handleStartProject}
                      aria-label={t.navStartProject}
                    >
                      <span className="navbar-shimmer absolute inset-0 pointer-events-none" aria-hidden="true" />
                      <span className="relative z-10">{t.navStartProject}</span>
                    </Button>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Neon bottom border - animated flowing line when scrolled */}
        {scrolled && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
            <div className="navbar-neon-border absolute inset-0" />
            <div
              className="absolute inset-0 blur-[3px] opacity-70"
              style={{
                background: 'linear-gradient(90deg, transparent, #22d3ee, transparent)',
                backgroundSize: '200% 100%',
                animation: 'neon-border-flow 3s linear infinite',
              }}
            />
          </div>
        )}

        {/* Wave SVG at bottom when scrolled */}
        {scrolled && (
          <div className="absolute -bottom-1 left-0 right-0 pointer-events-none">
            <svg
              className="w-full h-3"
              viewBox="0 0 1440 20"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M0,10 Q360,0 720,10 T1440,10 L1440,20 L0,20 Z"
                fill="rgba(34, 211, 238, 0.05)"
              />
            </svg>
          </div>
        )}

        {/* Auth Modal */}
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      </nav>
    </>
  )
}
