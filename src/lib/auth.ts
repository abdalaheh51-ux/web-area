import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import crypto from 'crypto'

const SESSION_COOKIE = 'webarea-session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export interface AuthUser {
  id: string
  email: string
  name: string | null
  avatar: string | null
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function ensureAdminUserFromEnv(): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const adminPassword = process.env.ADMIN_PASSWORD
  const adminName = process.env.ADMIN_NAME?.trim() || 'Admin'

  if (!adminEmail || !adminPassword) return

  const existing = await db.user.findUnique({ where: { email: adminEmail } })
  const hashedPassword = await hashPassword(adminPassword)

  if (existing) {
    await db.user.update({
      where: { email: adminEmail },
      data: {
        role: 'admin',
        password: hashedPassword,
        name: adminName,
      },
    })
  } else {
    await db.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        password: hashedPassword,
        role: 'admin',
      },
    })
  }
}

export function generateSessionToken(): string {
  return crypto.randomUUID() + crypto.randomUUID()
}

export async function createSession(userId: string): Promise<string> {
  const token = generateSessionToken()
  await db.session.create({
    data: { userId, sessionToken: token, expiresAt: new Date(Date.now() + SESSION_MAX_AGE * 1000) },
  })
  return token
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE)?.value || null
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await getSessionToken()
  if (!token) return null

  const session = await db.session.findFirst({
    where: { sessionToken: token },
    include: { user: { select: { id: true, email: true, name: true, avatar: true, role: true } } },
  })

  return session?.user || null
}

export async function clearSession(userId: string) {
  await db.session.deleteMany({ where: { userId } })
}
