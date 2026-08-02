// Simple in-memory rate limiter for login attempts
// Tracks attempts by email + IP address

interface AttemptRecord {
  count: number
  firstAttempt: number
  lastFailedAttemptAt: number
  lockedUntil: number | null
}

const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes
const WINDOW_DURATION = 60 * 60 * 1000 // 1 hour tracking window
const COOLDOWN_DURATION = 20 * 1000 // 20 seconds between failed attempts

const attempts = new Map<string, AttemptRecord>()

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of attempts.entries()) {
    if (now - record.firstAttempt > WINDOW_DURATION && (!record.lockedUntil || now > record.lockedUntil)) {
      attempts.delete(key)
    }
  }
}, 10 * 60 * 1000)

export function getRateLimitKey(email: string, ip: string): string {
  return `${email.toLowerCase()}:${ip}`
}

export interface RateLimitStatus {
  allowed: boolean
  remainingAttempts: number
  lockedUntil: number | null
  retryAfterSeconds: number
}

export function checkRateLimit(key: string): RateLimitStatus {
  const now = Date.now()
  const record = attempts.get(key)

  // No previous attempts - allow
  if (!record) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS, lockedUntil: null, retryAfterSeconds: 0 }
  }

  // Check if currently locked out
  if (record.lockedUntil && now < record.lockedUntil) {
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: record.lockedUntil,
      retryAfterSeconds: Math.max(1, Math.ceil((record.lockedUntil - now) / 1000)),
    }
  }

  // Lockout expired - reset
  if (record.lockedUntil && now >= record.lockedUntil) {
    attempts.delete(key)
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS, lockedUntil: null, retryAfterSeconds: 0 }
  }

  // Window expired - reset
  if (now - record.firstAttempt > WINDOW_DURATION) {
    attempts.delete(key)
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS, lockedUntil: null, retryAfterSeconds: 0 }
  }

  // Apply 20-second cooldown between failed attempts
  const timeSinceLastFailure = now - record.lastFailedAttemptAt
  if (timeSinceLastFailure < COOLDOWN_DURATION) {
    return {
      allowed: false,
      remainingAttempts: Math.max(0, MAX_ATTEMPTS - record.count),
      lockedUntil: null,
      retryAfterSeconds: Math.max(1, Math.ceil((COOLDOWN_DURATION - timeSinceLastFailure) / 1000)),
    }
  }

  // Still within attempts limit
  if (record.count < MAX_ATTEMPTS) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - record.count, lockedUntil: null, retryAfterSeconds: 0 }
  }

  // Max attempts reached - lock out
  return { allowed: false, remainingAttempts: 0, lockedUntil: record.lockedUntil, retryAfterSeconds: 0 }
}

export function recordFailedAttempt(key: string): { lockedUntil: number | null; remainingAttempts: number; retryAfterSeconds: number } {
  const now = Date.now()
  let record = attempts.get(key)

  if (!record || now - record.firstAttempt > WINDOW_DURATION) {
    record = { count: 1, firstAttempt: now, lastFailedAttemptAt: now, lockedUntil: null }
  } else {
    record.count += 1
    record.lastFailedAttemptAt = now
  }

  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION
  }

  attempts.set(key, record)

  return {
    lockedUntil: record.lockedUntil,
    remainingAttempts: Math.max(0, MAX_ATTEMPTS - record.count),
    retryAfterSeconds: record.lockedUntil ? 0 : Math.max(1, Math.ceil(COOLDOWN_DURATION / 1000)),
  }
}

export function clearRateLimit(key: string): void {
  attempts.delete(key)
}

export function getLockoutTimeRemaining(key: string): number {
  const record = attempts.get(key)
  if (!record || !record.lockedUntil) return 0
  return Math.max(0, record.lockedUntil - Date.now())
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const remoteAddr = request.headers.get('x-vercel-forwarded-for')

  if (forwarded) return forwarded.split(',')[0].trim()
  if (realIP) return realIP
  if (remoteAddr) return remoteAddr.split(',')[0].trim()

  return 'unknown'
}

export const RATE_LIMIT_CONFIG = {
  MAX_ATTEMPTS,
  LOCKOUT_DURATION,
  WINDOW_DURATION,
  COOLDOWN_DURATION,
}
