type RateLimitUser = {
  id?: string
  email?: string
  role?: string
} | null

const RATE_LIMIT_WINDOW_MS = 20 * 1000
const rateLimitStore = new Map<string, number>()

export interface RateLimitResult {
  allowed: boolean
  retryAfter: number
}

function getClientIdentifier(user: RateLimitUser, fallback: string): string {
  if (user?.id) return `user:${user.id}`
  if (user?.email) return `email:${user.email.toLowerCase()}`
  return `ip:${fallback}`
}

function cleanupExpiredEntries(now: number) {
  for (const [key, timestamp] of rateLimitStore.entries()) {
    if (now - timestamp > RATE_LIMIT_WINDOW_MS) {
      rateLimitStore.delete(key)
    }
  }
}

export function checkRateLimit({
  user,
  endpoint,
  identifier,
  now = Date.now(),
  windowMs = RATE_LIMIT_WINDOW_MS,
}: {
  user: RateLimitUser
  endpoint: string
  identifier?: string
  now?: number
  windowMs?: number
}): RateLimitResult {
  if (user?.role === 'admin') {
    return { allowed: true, retryAfter: 0 }
  }

  cleanupExpiredEntries(now)

  const clientKey = `${endpoint}:${getClientIdentifier(user, identifier || 'anonymous')}`
  const lastRequestAt = rateLimitStore.get(clientKey)

  if (lastRequestAt && now - lastRequestAt < windowMs) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((windowMs - (now - lastRequestAt)) / 1000)),
    }
  }

  rateLimitStore.set(clientKey, now)
  return { allowed: true, retryAfter: 0 }
}
