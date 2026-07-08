'use client'

import { useState, useRef } from 'react'
import { Mail, Phone, Facebook, ArrowUp, Copy, Check, Instagram, Twitter, Linkedin, MessageCircle } from 'lucide-react'
import { useLanguage } from '@/hooks/use-language'

export default function Footer() {
  const { t, dir } = useLanguage()
  const [copiedItem, setCopiedItem] = useState<string | null>(null)
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])
  const rippleId = useRef(0)

  const quickLinks = [
    { label: t.navHome, href: '#hero' },
    { label: t.navGrowth, href: '#growth' },
    { label: t.navWork, href: '#portfolio' },
    { label: t.navProjectBuilder, href: '#project-builder' },
    { label: t.navWhyUs, href: '#why-us' },
    { label: t.navPortfolio, href: '#cases' },
    { label: t.navComments, href: '#comments' },
    { label: t.privacyPolicy, href: '/privacy' },
  ]

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const target = document.querySelector(href)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToTop = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget
    const rect = btn.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = rippleId.current++
    setRipples((prev) => [...prev, { x, y, id }])
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const copyToClipboard = (text: string, item: string) => {
    navigator.clipboard.writeText(text)
    setCopiedItem(item)
    setTimeout(() => setCopiedItem(null), 2000)
  }

  const socialLinks = [
    { icon: Facebook, label: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61591312174523', color: 'hover:text-blue-300', glow: 'group-hover:bg-blue-500/30' },
    { icon: Instagram, label: 'Instagram', url: '#', color: 'hover:text-pink-300', glow: 'group-hover:bg-pink-500/30' },
    { icon: Twitter, label: 'Twitter', url: '#', color: 'hover:text-sky-300', glow: 'group-hover:bg-sky-500/30' },
    { icon: Linkedin, label: 'LinkedIn', url: '#', color: 'hover:text-blue-200', glow: 'group-hover:bg-blue-600/30' },
    { icon: MessageCircle, label: 'WhatsApp', url: 'https://wa.me/201141990307', color: 'hover:text-green-300', glow: 'group-hover:bg-green-500/30' },
  ]

  const EmailButton = () => {
    const email = 'webarea2@gmail.com'
    const subject = 'استفسار بخصوص خدمة من Web Area'
    const body = 'أهلاً فريق Web Area، أود الاستفسار عن خدماتكم...'

    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

    return (
      <a
        href={mailtoLink}
        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
      >
        تواصل معنا عبر الإيميل
      </a>
    )
  }

  // Generate random particles
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 8}s`,
    duration: `${6 + Math.random() * 6}s`,
    size: `${2 + Math.random() * 3}px`,
  }))

  return (
    <footer dir={dir} className="relative mt-auto overflow-hidden">
      {/* Animated gradient background - dark blue to lighter blue (left to right) */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800" />
      
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/[0.02]" />

      {/* Noise texture */}
      <div className="absolute inset-0 footer-noise pointer-events-none" />

      {/* Dots pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-cyan-300 footer-particle"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              animationDuration: p.duration,
              boxShadow: '0 0 8px rgba(34, 211, 238, 0.8)',
            }}
          />
        ))}
      </div>

      {/* Watermark background image - full footer size */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <img
          src="/footer-bg.png"
          alt=""
          className="w-full h-full object-cover select-none"
          aria-hidden="true"
        />
      </div>

      {/* Wave SVG at top */}
      <div className="relative">
        <svg
          className="absolute top-0 left-0 right-0 w-full h-12 -translate-y-full"
          viewBox="0 0 1440 60"
          fill="none"
          preserveAspectRatio="none"
          style={{ display: 'block' }}
        >
          <path
            d="M0,30 Q360,0 720,30 T1440,30 L1440,60 L0,60 Z"
            fill="currentColor"
            className="text-blue-950"
          />
        </svg>
      </div>

      {/* Animated neon top border */}
      <div className="relative h-[2px] w-full overflow-hidden">
        <div className="footer-neon-border absolute inset-0" />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
          {/* Column 1: Logo & Description (wider - 2/4) */}
          <div className="md:col-span-2 relative">
            {/* Gradient border on right */}
            <div className="hidden md:block absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent" />
            
            <div className="md:pl-2">
              <div className="flex items-center gap-4 mb-5">
                <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-cyan-300/60 shrink-0 footer-logo-glow">
                  <div className="absolute inset-0 rounded-full bg-cyan-400/40 blur-lg" />
                  <img
                    src="/logo.png"
                    alt="Web Area Logo"
                    className="relative w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight footer-gradient-text">Web Area</h3>
                  <p className="text-[10px] text-cyan-300/70 font-medium tracking-wider uppercase">From Pixel to Enterprise</p>
                </div>
              </div>
              <p className="text-primary-foreground/70 text-sm leading-relaxed max-w-md">
                {t.footerDesc}
              </p>

              {/* Social incentive text */}
              <p className="mt-5 text-xs text-cyan-200/60 font-medium">
                {dir === 'rtl' 
                  ? 'تابعنا علي صفحات السوشيال ميديا لتصلك آخر التحديثات والعروض'
                  : 'Follow us on social media for latest updates and offers'}
              </p>

              {/* Social Media Icons */}
              <div className="flex items-center gap-2.5 mt-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <a
                      key={social.label}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      title={social.label}
                      className="relative group flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-cyan-300/10 transition-all duration-300 hover:scale-110 hover:border-cyan-300/40"
                    >
                      <div className={`absolute inset-0 rounded-full ${social.glow} blur-md transition-all duration-300 opacity-0 group-hover:opacity-100`} />
                      <Icon className={`relative w-4 h-4 text-primary-foreground/60 transition-colors duration-300 ${social.color}`} />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links (1/4) */}
          <div className="relative">
            {/* Vertical neon line on right */}
            <div className="hidden md:block absolute left-0 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent" />
            
            <div className="md:pl-4">
              <h4 className="font-semibold mb-4 text-lg footer-gradient-text inline-block">{t.footerQuickLinks}</h4>
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.href} className="group">
                    <a
                      href={link.href}
                      onClick={link.href.startsWith('#') ? (e) => handleClick(e, link.href) : undefined}
                      className="relative text-sm text-primary-foreground/60 transition-all duration-300 group-hover:text-cyan-200 group-hover:tracking-wide inline-block"
                    >
                      <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 3: Contact Info (1/4) */}
          <div className="relative">
            {/* Vertical neon line on right */}
            <div className="hidden md:block absolute left-0 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent" />
            
            <div className="md:pl-4">
              <h4 className="font-semibold mb-4 text-lg footer-gradient-text inline-block">{t.footerContact}</h4>
              <ul className="space-y-3.5">
                <li className="group flex flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 shrink-0 text-cyan-300 transition-transform duration-300 group-hover:scale-125" />
                    <a
                      href="mailto:webarea2@gmail.com"
                      className="text-sm text-primary-foreground/60 transition-colors duration-300 group-hover:text-cyan-200"
                      dir="ltr"
                    >
                      webarea2@gmail.com
                    </a>
                    <button
                      onClick={() => copyToClipboard('webarea2@gmail.com', 'email')}
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      aria-label="Copy email"
                    >
                      {copiedItem === 'email' ? (
                        <Check className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-cyan-300/60 hover:text-cyan-200" />
                      )}
                    </button>
                  </div>
                  <EmailButton />
                </li>
                <li className="group flex items-center gap-2.5">
                  <Phone className="h-4 w-4 shrink-0 text-cyan-300 transition-transform duration-300 group-hover:scale-125" />
                  <a
                    href="tel:+201141990307"
                    className="text-sm text-primary-foreground/60 transition-colors duration-300 group-hover:text-cyan-200"
                    dir="ltr"
                  >
                    +20 114 199 0307
                  </a>
                  <button
                    onClick={() => copyToClipboard('+201141990307', 'phone')}
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    aria-label="Copy phone"
                  >
                    {copiedItem === 'phone' ? (
                      <Check className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-cyan-300/60 hover:text-cyan-200" />
                    )}
                  </button>
                </li>
                <li className="group flex items-center gap-2.5">
                  <Facebook className="h-4 w-4 shrink-0 text-cyan-300 transition-transform duration-300 group-hover:scale-125" />
                  <a
                    href="https://www.facebook.com/profile.php?id=61591312174523"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-foreground/60 transition-colors duration-300 group-hover:text-cyan-200"
                  >
                    {t.footerFacebook}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="relative mt-12 pt-6 border-t border-cyan-300/15">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-primary-foreground/50 text-center sm:text-right">
              {t.footerCopyright}
            </p>
            <button
              onClick={scrollToTop}
              aria-label="Scroll to top"
              className="relative overflow-hidden group flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-cyan-300/20 hover:border-cyan-300/50 transition-all duration-300"
            >
              {/* Ripple effects */}
              {ripples.map((ripple) => (
                <span
                  key={ripple.id}
                  className="ripple-circle absolute rounded-full bg-cyan-400/40 pointer-events-none"
                  style={{
                    left: ripple.x - 10,
                    top: ripple.y - 10,
                    width: 20,
                    height: 20,
                  }}
                />
              ))}
              <div className="absolute inset-0 rounded-full bg-cyan-400/0 group-hover:bg-cyan-400/20 blur-md transition-all duration-300" />
              <ArrowUp className="relative w-4 h-4 text-primary-foreground/60 group-hover:text-cyan-200 transition-colors duration-300 group-hover:-translate-y-0.5" />
              <span className="relative text-xs font-medium text-primary-foreground/60 group-hover:text-cyan-200 transition-colors duration-300">
                {dir === 'rtl' ? 'للأعلى' : 'To Top'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
