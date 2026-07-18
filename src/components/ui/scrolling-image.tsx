'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface ScrollingImageProps {
  src: string
  alt: string
  className?: string
  duration?: number // مدة الأنيميشن بالثواني
  autoPlay?: boolean // تشغيل الأنيميشن تلقائياً
}

/**
 * مكون ScrollingImage يعرض صورة مع أنيميشن scroll من الأسفل للأعلى والعكس
 * مثالي لعرض لقطات الشاشة (Screenshots) الطويلة
 */
export function ScrollingImage({
  src,
  alt,
  className = '',
  duration = 8,
  autoPlay = true,
}: ScrollingImageProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [shouldAnimate, setShouldAnimate] = useState(autoPlay)

  useEffect(() => {
    if (!autoPlay) return

    // تشغيل الأنيميشن تلقائياً بعد تحميل الصورة
    const timer = setTimeout(() => {
      setShouldAnimate(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [autoPlay])

  return (
    <div
      className={`relative overflow-hidden rounded-lg ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Container للصورة مع overflow hidden */}
      <motion.div
        className="relative w-full h-full"
        animate={shouldAnimate || isHovered ? { y: [0, -100, 0] } : { y: 0 }}
        transition={{
          duration,
          repeat: shouldAnimate || isHovered ? Infinity : 0,
          repeatType: 'loop',
          ease: 'linear',
        }}
      >
        {/* الصورة */}
        <img
          src={src}
          alt={alt}
          className="w-full h-auto object-cover"
          loading="lazy"
        />
      </motion.div>

      {/* Overlay للإشارة إلى أن الصورة قابلة للتفاعل */}
      {!isHovered && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      )}

      {/* رسالة التفاعل */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        pointerEvents="none"
      >
        <div className="text-center text-white">
          <p className="text-sm font-semibold">اسحب لرؤية المزيد</p>
          <p className="text-xs text-white/80 mt-1">Scroll to see more</p>
        </div>
      </motion.div>
    </div>
  )
}

export default ScrollingImage
