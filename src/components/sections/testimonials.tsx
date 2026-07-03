'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, MessageSquare, Send, Loader2, Quote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/hooks/use-language'
import type { TranslationKeys } from '@/lib/i18n'

interface Comment {
  id: string
  name: string | null
  comment: string
  rating: number
  createdAt: string
}

function timeAgo(dateString: string, t: TranslationKeys): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) {
    return t.testimonialsJustNow
  }
  if (minutes < 60) {
    return `${minutes} ${t.testimonialsMinutesAgo}`
  }
  if (hours < 24) {
    return `${hours} ${t.testimonialsHoursAgo}`
  }
  if (days < 30) {
    return `${days} ${t.testimonialsDaysAgo}`
  }
  // Fallback to a short date string
  return date.toLocaleDateString()
}

export default function Testimonials() {
  const { t, dir } = useLanguage()
  const { toast } = useToast()

  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch('/api/comments', { cache: 'no-store' })
      const data = await res.json()
      if (data?.comments) {
        setComments(data.comments)
      }
    } catch {
      // silent fail - keep empty list
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) {
      toast({
        title: t.testimonialsCommentRequired,
        variant: 'destructive',
      })
      return
    }
    if (comment.trim().length > 500) {
      toast({
        title: t.testimonialsCommentTooLong,
        variant: 'destructive',
      })
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || null,
          comment: comment.trim(),
          rating,
        }),
      })
      const data = await res.json()
      if (data?.success) {
        toast({
          title: t.testimonialsSuccessTitle,
          description: t.testimonialsSuccessDesc,
        })
        setName('')
        setComment('')
        setRating(5)
        // Comments need approval first - so don't add to list immediately
      } else {
        toast({
          title: t.testimonialsErrorTitle,
          description: data?.error,
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: t.testimonialsErrorTitle,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayedRating = hoverRating ?? rating

  return (
    <section
      id="testimonials"
      dir={dir}
      className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20"
    >
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {t.testimonialsRecentComments}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            {t.testimonialsTitle}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t.testimonialsSubtitle}
          </p>
        </motion.div>

        {/* Comment Form */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <Card className="border-2 border-primary/20 shadow-lg shadow-primary/5 overflow-hidden">
            <CardContent className="p-6">
              <div className="mb-5">
                <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  {t.testimonialsFormTitle}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t.testimonialsFormSubtitle}
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name (optional) */}
                <div>
                  <label
                    htmlFor="comment-name"
                    className="text-sm font-medium mb-1.5 block"
                  >
                    {t.testimonialsNameLabel}{' '}
                    <span className="text-muted-foreground text-xs">
                      {t.testimonialsNameOptional}
                    </span>
                  </label>
                  <Input
                    id="comment-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.testimonialsNamePlaceholder}
                    maxLength={50}
                  />
                </div>

                {/* Rating */}
                <div>
                  <label
                    className="text-sm font-medium mb-1.5 block"
                    id="rating-label"
                  >
                    {t.testimonialsRatingLabel}
                  </label>
                  <div
                    className="flex gap-1 items-center"
                    role="radiogroup"
                    aria-labelledby="rating-label"
                  >
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = star <= displayedRating
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          onFocus={() => setHoverRating(star)}
                          onBlur={() => setHoverRating(null)}
                          aria-label={`${star} star${star > 1 ? 's' : ''}`}
                          aria-checked={rating === star}
                          role="radio"
                          className="p-1 rounded-md transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <Star
                            className={`w-7 h-7 transition-all duration-150 ${
                              isActive
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-muted-foreground/30'
                            }`}
                          />
                        </button>
                      )
                    })}
                    <Badge
                      variant="secondary"
                      className="ms-2 bg-amber-400/10 text-amber-600 border-amber-400/20"
                    >
                      {displayedRating}/5
                    </Badge>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label
                    htmlFor="comment-text"
                    className="text-sm font-medium mb-1.5 block"
                  >
                    {t.testimonialsCommentLabel}
                  </label>
                  <Textarea
                    id="comment-text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t.testimonialsCommentPlaceholder}
                    maxLength={500}
                    rows={4}
                    className="resize-none"
                  />
                  <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                    <span />
                    <span
                      className={
                        comment.length >= 500
                          ? 'text-destructive font-medium'
                          : ''
                      }
                    >
                      {comment.length}/500
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>
                    {isSubmitting
                      ? t.testimonialsSubmitting
                      : t.testimonialsSubmit}
                  </span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Comments List */}
        <div>
          <motion.div
            className="flex items-center justify-between mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Quote className="w-5 h-5 text-amber-500" />
              {t.testimonialsRecentComments}
              {!isLoading && comments.length > 0 && (
                <Badge variant="secondary" className="ms-1">
                  {comments.length}
                </Badge>
              )}
            </h3>
          </motion.div>

          {isLoading ? (
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <Card key={i} className="border-border/60">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                        <div className="h-2.5 w-20 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2.5 w-full bg-muted rounded animate-pulse" />
                      <div className="h-2.5 w-5/6 bg-muted rounded animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-dashed border-2 bg-background/50">
                <CardContent className="p-10 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <MessageSquare className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">
                    {t.testimonialsNoComments}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t.testimonialsNoCommentsDesc}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-4 max-h-[640px] overflow-y-auto pe-1">
              <AnimatePresence initial={false}>
                {comments.map((c, i) => {
                  const displayName = c.name?.trim() || t.testimonialsAnonymous
                  const initial = displayName.charAt(0).toUpperCase()
                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                    >
                      <Card className="border-border/60 hover:border-primary/30 transition-colors duration-200">
                        <CardContent className="p-4">
                          {/* Header: avatar + name + time */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-amber-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {initial}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-sm truncate">
                                  {displayName}
                                </p>
                                {!c.name?.trim() && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] py-0 px-1.5 text-muted-foreground"
                                  >
                                    {t.testimonialsAnonymous}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-muted-foreground text-xs">
                                {timeAgo(c.createdAt, t)}
                              </p>
                            </div>
                          </div>

                          {/* Stars */}
                          <div className="flex gap-0.5 mb-2.5">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <Star
                                key={idx}
                                className={`h-4 w-4 ${
                                  idx < c.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-muted-foreground/25'
                                }`}
                              />
                            ))}
                          </div>

                          {/* Comment text */}
                          <p className="text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {c.comment}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
