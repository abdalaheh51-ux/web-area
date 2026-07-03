'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Star, Quote, Loader2, Send, User, ChevronDown, MessageSquare } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/hooks/use-language'
import SectionBackground from '@/components/section-background'

const MAX_COMMENT_LENGTH = 500

interface VisitorComment {
  id: string
  name: string | null
  comment: string
  rating: number
  createdAt: string
}

export default function Comments() {
  const { t, dir } = useLanguage()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const [comments, setComments] = useState<VisitorComment[]>([])
  const [loading, setLoading] = useState(true)

  // Filter & pagination state
  const [filterBy, setFilterBy] = useState<'recent' | 'top'>('recent')
  const [visibleCount, setVisibleCount] = useState(3)

  // Reply state (local-only, not persisted to API)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [localReplies, setLocalReplies] = useState<Record<string, { name: string; text: string; date: string }[]>>({})

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch('/api/comments', { method: 'GET' })
      if (!res.ok) throw new Error('fetch failed')
      const data = (await res.json()) as { comments?: VisitorComment[] }
      setComments(data.comments ?? [])
    } catch {
      // silently fail — show empty state
      setComments([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = comment.trim()
    if (!trimmed) {
      toast({
        title: t.commentsErrorTitle,
        description: t.commentsTextPlaceholder,
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || null,
          comment: trimmed,
          rating,
        }),
      })

      if (!res.ok) throw new Error('submit failed')

      toast({
        title: t.commentsSuccessTitle,
        description: t.commentsSuccessDesc,
      })

      // Reset form after success
      setName('')
      setComment('')
      setRating(5)
      setHoverRating(0)

      // Refresh list (new comment may not appear until approved, but we refresh anyway)
      fetchComments()
    } catch {
      toast({
        title: t.commentsErrorTitle,
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)

    if (diffMin < 1) return t.commentsTimeJustNow
    if (diffMin < 60) return t.commentsTimeMinutesAgo.replace('{count}', String(diffMin))

    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return t.commentsTimeHoursAgo.replace('{count}', String(diffHr))

    const diffDay = Math.floor(diffHr / 24)
    if (diffDay < 7) return t.commentsTimeDaysAgo.replace('{count}', String(diffDay))

    const diffWk = Math.floor(diffDay / 7)
    return t.commentsTimeWeeksAgo.replace('{count}', String(diffWk))
  }

  // Sort comments based on the active filter (top-rated by stars, otherwise newest-first)
  const sortedComments = [...comments].sort((a, b) => {
    if (filterBy === 'top') return b.rating - a.rating
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  // Paginate via "Load More" instead of scroll
  const displayedComments = sortedComments.slice(0, visibleCount)

  const handleReply = (commentId: string) => {
    if (!replyText.trim()) return
    setLocalReplies(prev => ({
      ...prev,
      [commentId]: [...(prev[commentId] || []), {
        name: t.commentsVisitorLabel,
        text: replyText.trim(),
        date: new Date().toISOString(),
      }]
    }))
    setReplyText('')
    setReplyingTo(null)
  }

  const displayRating = hoverRating || rating
  const charCount = comment.length
  const isOverLimit = charCount > MAX_COMMENT_LENGTH

  return (
    <section
      id="comments"
      dir={dir}
      className="relative overflow-hidden w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/30 via-background to-muted/30"
    >
      <SectionBackground variant="mixed" particles={false}>
      <div className="relative mx-auto max-w-3xl">
        {/* ─── Comment Form ─── */}
        <Card className="border-2 border-primary/20 shadow-sm frosted-glass">
          <CardContent className="p-5 md:p-8">
            {/* Form header */}
            <motion.div
              className="text-center mb-6"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2">
                {t.commentsFormTitle}
              </h2>
              <p className="text-sm md:text-base text-muted-foreground">
                {t.commentsFormSubtitle}
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name input (optional) */}
              <div className="space-y-1.5">
                <Label htmlFor="comment-name" className="text-sm font-medium">
                  {t.commentsNameLabel}
                  <span className="text-muted-foreground font-normal text-xs mr-1">
                    ({t.pbOptional})
                  </span>
                </Label>
                <Input
                  id="comment-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.commentsNamePlaceholder}
                  disabled={submitting}
                  maxLength={80}
                  className={dir === 'rtl' ? 'text-right' : 'text-left'}
                />
              </div>

              {/* Star rating (5 stars, interactive with hover, default 5) */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  {t.commentsRatingLabel}
                  <span className="text-rose-500 mr-0.5">*</span>
                </Label>
                <div
                  className="flex items-center gap-1.5"
                  role="radiogroup"
                  aria-label={t.commentsRatingLabel}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onFocus={() => setHoverRating(star)}
                      onBlur={() => setHoverRating(0)}
                      aria-label={`${star} / 5`}
                      aria-checked={rating === star}
                      role="radio"
                      disabled={submitting}
                      className="rounded-md p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:opacity-60"
                    >
                      <Star
                        className={`size-7 transition-colors ${
                          star <= displayRating
                            ? 'fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400'
                            : 'fill-transparent text-muted-foreground/40'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-semibold text-muted-foreground ms-2">
                    {displayRating} / 5
                  </span>
                </div>
              </div>

              {/* Comment textarea (max 500 chars, counter) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="comment-text" className="text-sm font-medium">
                    {t.commentsTextLabel}
                    <span className="text-rose-500 mr-0.5">*</span>
                  </Label>
                  <span
                    className={`text-xs tabular-nums ${
                      isOverLimit
                        ? 'text-rose-500 font-semibold'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {charCount} / {MAX_COMMENT_LENGTH}
                  </span>
                </div>
                <Textarea
                  id="comment-text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t.commentsTextPlaceholder}
                  disabled={submitting}
                  maxLength={MAX_COMMENT_LENGTH}
                  className={`min-h-[120px] resize-none ${
                    dir === 'rtl' ? 'text-right' : 'text-left'
                  } ${isOverLimit ? 'border-rose-500 focus-visible:border-rose-500' : ''}`}
                />
              </div>

              {/* Submit button (gradient bg from-blue-600 to-blue-500) */}
              <Button
                type="submit"
                disabled={submitting || isOverLimit || !comment.trim()}
                size="lg"
                className="w-full bg-gradient-to-l from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold text-base h-12 rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-300 disabled:opacity-60 disabled:shadow-none"
              >
                {submitting ? (
                  <motion.span
                    className="inline-flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Loader2 className="size-5 animate-spin" />
                    <span>{t.commentsSubmitting}</span>
                  </motion.span>
                ) : (
                  <motion.span
                    className="inline-flex items-center gap-2"
                    whileHover={{ x: dir === 'rtl' ? -4 : 4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <span>{t.commentsSubmit}</span>
                    <Send className="size-5" />
                  </motion.span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ─── Comments List ─── */}
        <div className="mt-10">
          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-5 text-center">
            {t.commentsListTitle}
          </h3>

          {/* Filter options */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <button
              onClick={() => setFilterBy('recent')}
              className={`text-xs font-medium px-3 py-1 rounded-full transition-all ${
                filterBy === 'recent' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {dir === 'rtl' ? 'الأحدث' : 'Newest'}
            </button>
            <button
              onClick={() => setFilterBy('top')}
              className={`text-xs font-medium px-3 py-1 rounded-full transition-all ${
                filterBy === 'top' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {dir === 'rtl' ? 'الأعلى تقييماً' : 'Top Rated'}
            </button>
          </div>

          {/* Loading: 3 skeleton cards */}
          {loading && (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <Card key={i} className="border-border/60">
                  <CardContent className="p-4 flex items-start gap-3">
                    <Skeleton className="size-10 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty: dashed border card with Quote icon */}
          {!loading && comments.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-2 border-dashed border-muted-foreground/25 bg-muted/20 frosted-panel">
                <CardContent className="p-8 flex flex-col items-center justify-center text-center gap-3">
                  <div className="size-12 rounded-full bg-muted/60 flex items-center justify-center">
                    <Quote className="size-6 text-muted-foreground" />
                  </div>
                  <h4 className="text-base font-bold text-foreground">
                    {t.commentsEmptyTitle}
                  </h4>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {t.commentsEmptyDesc}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Comments list */}
          {!loading && comments.length > 0 && (
            <div className="space-y-3">
              {displayedComments.map((c, idx) => {
                const displayName = c.name?.trim() || t.commentsVisitorLabel
                const initial = displayName.charAt(0).toUpperCase()

                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.3) }}
                  >
                      <Card className="border-border/60 hover:border-border transition-colors frosted-panel">
                        <CardContent className="p-4 flex items-start gap-3">
                          {/* Avatar: first letter or User icon */}
                          <div className="shrink-0 size-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
                            {c.name ? (
                              initial
                            ) : (
                              <User className="size-5 text-primary/80" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Name + stars + time */}
                            <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-foreground">
                                  {displayName}
                                </span>
                                {/* stars (read-only) */}
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      className={`size-3 ${
                                        s <= c.rating
                                          ? 'fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400'
                                          : 'fill-transparent text-muted-foreground/30'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <time
                                className="text-xs text-muted-foreground tabular-nums"
                                dateTime={c.createdAt}
                              >
                                {formatTimeAgo(c.createdAt)}
                              </time>
                            </div>

                            {/* Comment text */}
                            <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap break-words">
                              {c.comment}
                            </p>

                            {/* Reply button */}
                            <button
                              onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
                              className="text-[10px] font-medium text-muted-foreground hover:text-blue-500 mt-2 flex items-center gap-1"
                            >
                              <MessageSquare className="w-3 h-3" />
                              {dir === 'rtl' ? 'رد' : 'Reply'}
                            </button>

                            {/* Reply form */}
                            {replyingTo === c.id && (
                              <div className="mt-2 flex gap-2">
                                <Input
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder={dir === 'rtl' ? 'اكتب ردك...' : 'Write your reply...'}
                                  className="text-xs h-8"
                                  onKeyDown={(e) => e.key === 'Enter' && handleReply(c.id)}
                                />
                                <Button size="sm" className="h-8 px-3" onClick={() => handleReply(c.id)}>
                                  {dir === 'rtl' ? 'إرسال' : 'Send'}
                                </Button>
                              </div>
                            )}

                            {/* Local replies */}
                            {localReplies[c.id]?.map((reply, replyIdx) => (
                              <div key={replyIdx} className="mt-2 ps-6 border-s-2 border-border/30">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-amber-500 flex items-center justify-center text-white text-[8px] font-bold">
                                    {reply.name.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-[10px] font-semibold">{reply.name}</span>
                                  <span className="text-[8px] text-muted-foreground">{formatTimeAgo(reply.date)}</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground">{reply.text}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
            </div>
          )}

          {/* Load More */}
          {sortedComments.length > visibleCount && (
            <div className="text-center mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVisibleCount(prev => prev + 3)}
              >
                {dir === 'rtl' ? 'تحميل المزيد' : 'Load More'}
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
      </SectionBackground>
    </section>
  )
}
