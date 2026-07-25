import type { ImgHTMLAttributes } from 'react'

type SupportedSource = 'avif' | 'webp'

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string
  alt: string
  className?: string
  loading?: 'eager' | 'lazy'
}

const imageExtensionRegex = /\.(png|jpe?g)(\?.*)?$/i

function buildOptimizedSources(src: string): SupportedSource[] {
  if (!src.startsWith('/')) {
    return []
  }

  return imageExtensionRegex.test(src) ? ['avif', 'webp'] : []
}

export function OptimizedImage({
  src,
  alt,
  className,
  loading = 'lazy',
  decoding = 'async',
  style,
  ...rest
}: OptimizedImageProps) {
  const sources = buildOptimizedSources(src)
  const base = src.replace(imageExtensionRegex, '')

  return (
    <picture>
      {sources.includes('avif') && <source srcSet={`${base}.avif`} type="image/avif" />}
      {sources.includes('webp') && <source srcSet={`${base}.webp`} type="image/webp" />}
      <img
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        decoding={decoding}
        style={style}
        {...rest}
      />
    </picture>
  )
}
