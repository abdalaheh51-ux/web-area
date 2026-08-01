import { NextRequest, NextResponse } from 'next/server'

const RATE_LIMIT_WINDOW_MS = 20 * 1000
const rateLimitStore = new Map<string, number>()
const SESSION_COOKIE = 'webarea-session'

function getClientIdentifier(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()

  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()

  return 'unknown'
}

function getRateLimitKeys(request: NextRequest, userEmail?: string | null) {
  const ip = getClientIdentifier(request)
  const keys = [`api:ip:${ip}`]

  if (userEmail) {
    keys.push(`api:email:${userEmail.toLowerCase()}`)
  }

  return keys
}

function cleanupExpiredEntries(now: number) {
  for (const [key, timestamp] of rateLimitStore.entries()) {
    if (now - timestamp > RATE_LIMIT_WINDOW_MS) {
      rateLimitStore.delete(key)
    }
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const isExempt = Boolean(request.cookies.get(SESSION_COOKIE)?.value)

  if (isExempt) {
    return NextResponse.next()
  }

  const now = Date.now()
  cleanupExpiredEntries(now)

  const keys = getRateLimitKeys(request)
  const matchingKey = keys.find((key) => {
    const lastRequestAt = rateLimitStore.get(key)
    return lastRequestAt && now - lastRequestAt < RATE_LIMIT_WINDOW_MS
  })

  if (matchingKey) {
    const lastRequestAt = rateLimitStore.get(matchingKey) || now
    return NextResponse.json(
      {
        error: `Too many requests. Please wait ${Math.ceil((RATE_LIMIT_WINDOW_MS - (now - lastRequestAt)) / 1000)}s.`,
      },
      { status: 429 },
    )
  }

  for (const key of keys) {
    rateLimitStore.set(key, now)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}
