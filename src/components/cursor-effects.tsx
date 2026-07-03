'use client'

import { useEffect } from 'react'

/**
 * Custom desktop cursor — renders a small dot that tracks the pointer exactly
 * and a larger ring that lerps toward it for a smooth follow effect.
 *
 * Only enabled on viewports ≥ 1024px (lg breakpoint) so touch / mobile
 * users keep their native cursor.
 *
 * The component itself renders nothing; all visuals are appended to <body>
 * via the `.cursor-dot` and `.cursor-ring` classes defined in globals.css.
 */
export default function CursorEffects() {
  useEffect(() => {
    // Only enable the custom cursor on desktop (>= lg breakpoint)
    if (window.innerWidth < 1024) return

    const dot = document.createElement('div')
    dot.className = 'cursor-dot'
    document.body.appendChild(dot)

    const ring = document.createElement('div')
    ring.className = 'cursor-ring'
    document.body.appendChild(ring)

    let mouseX = 0
    let mouseY = 0
    let ringX = 0
    let ringY = 0

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      dot.style.left = `${mouseX - 4}px`
      dot.style.top = `${mouseY - 4}px`
    }

    // Smooth follow for the ring (lerp toward the dot)
    const animate = () => {
      ringX += (mouseX - ringX) * 0.15
      ringY += (mouseY - ringY) * 0.15
      ring.style.left = `${ringX - 18}px`
      ring.style.top = `${ringY - 18}px`
      requestAnimationFrame(animate)
    }
    animate()

    // Grow on hover over interactive elements
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.matches('a, button, [role="button"], input, textarea')) {
        ring.style.width = '48px'
        ring.style.height = '48px'
        ring.style.borderColor = 'rgba(245, 158, 11, 0.6)'
        dot.style.width = '6px'
        dot.style.height = '6px'
      }
    }

    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.matches('a, button, [role="button"], input, textarea')) {
        ring.style.width = '36px'
        ring.style.height = '36px'
        ring.style.borderColor = 'rgba(34, 211, 238, 0.4)'
        dot.style.width = '8px'
        dot.style.height = '8px'
      }
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseover', onMouseOver)
    document.addEventListener('mouseout', onMouseOut)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseover', onMouseOver)
      document.removeEventListener('mouseout', onMouseOut)
      dot.remove()
      ring.remove()
    }
  }, [])

  return null
}
