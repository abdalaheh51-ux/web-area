'use client'

import { useMemo } from 'react'

interface SectionBackgroundProps {
  /** Variant of the background gradient */
  variant?: 'blue' | 'amber' | 'mixed' | 'dark'
  /** Whether to show floating particles */
  particles?: boolean
  /** Whether to show the watermark image */
  watermark?: boolean
  /** Opacity of the background layers (0-1) */
  opacity?: number
  /** Children content */
  children?: React.ReactNode
}

/**
 * A reusable section background that matches the footer style.
 * Includes: gradient bg, glassmorphism, noise texture, dots pattern,
 * floating particles, blur orbs, and watermark image.
 */
export default function SectionBackground({
  variant = 'blue',
  particles = true,
  watermark = false,
  opacity = 1,
  children,
}: SectionBackgroundProps) {
  const particleElements = useMemo(() => {
    if (!particles) return null
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 8}s`,
      duration: `${6 + Math.random() * 6}s`,
      size: `${2 + Math.random() * 3}px`,
    }))
  }, [particles])

  return (
    <>
      {/* Gradient background - dark mode: black/blue bottom to top, light mode: light blue/white bottom to top */}
      <div
        className="absolute inset-0 dark:bg-gradient-to-t dark:from-black dark:via-black dark:to-blue-950 bg-gradient-to-t from-blue-50 via-slate-50 to-blue-100"
        style={{ opacity }}
      />

      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/[0.02] dark:bg-white/[0.02]" />

      {/* Noise texture */}
      <div className="absolute inset-0 footer-noise pointer-events-none" />

      {/* Dots pattern - dark in light mode, white in dark mode */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          color: 'rgb(37 99 235 / 0.3)',
        }}
      />
      <div
        className="absolute inset-0 opacity-0 dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Blur orbs - brighter in light mode */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="blur-orb w-80 h-80 top-0 right-1/4 bg-cyan-500 dark:opacity-[0.15] opacity-[0.2]" />
        <div className="blur-orb w-72 h-72 bottom-0 left-1/4 bg-blue-400 dark:opacity-[0.15] opacity-[0.2]" />
        {(variant === 'amber' || variant === 'mixed') && (
          <div className="blur-orb w-64 h-64 top-1/3 left-0 bg-amber-500 dark:opacity-[0.15] opacity-[0.15]" />
        )}
      </div>

      {/* Floating particles - only in dark mode */}
      {particleElements && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden hidden dark:block">
          {particleElements.map((p) => (
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
      )}

      {/* Watermark image */}
      {watermark && (
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
          <img
            src="/footer-bg.png"
            alt=""
            className="w-full h-full object-cover select-none"
            aria-hidden="true"
          />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </>
  )
}
