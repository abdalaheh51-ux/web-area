import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, createSession, setSessionCookie } from "@/lib/auth";
import { getRateLimitKey, checkRateLimit, recordFailedAttempt, clearRateLimit, getClientIP, RATE_LIMIT_CONFIG } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Rate limiting
    const ip = getClientIP(request)
    const rateLimitKey = getRateLimitKey(email, ip)
    const rateLimitStatus = checkRateLimit(rateLimitKey)

    if (!rateLimitStatus.allowed) {
      const remainingMinutes = rateLimitStatus.lockedUntil
        ? Math.ceil((rateLimitStatus.lockedUntil - Date.now()) / 60000)
        : 0
      return NextResponse.json({
        error: `Too many attempts. Try again in ${remainingMinutes} minutes.`,
        locked: true,
        remainingMinutes,
      }, { status: 429 })
    }

    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });

    // Always record failed attempt if user not found or password wrong
    if (!user) {
      const result = recordFailedAttempt(rateLimitKey)
      return NextResponse.json({
        error: "Invalid email or password",
        remainingAttempts: result.remainingAttempts,
        ...(result.lockedUntil && { locked: true, remainingMinutes: Math.ceil(RATE_LIMIT_CONFIG.LOCKOUT_DURATION / 60000) }),
      }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      const result = recordFailedAttempt(rateLimitKey)
      return NextResponse.json({
        error: "Invalid email or password",
        remainingAttempts: result.remainingAttempts,
        ...(result.lockedUntil && { locked: true, remainingMinutes: Math.ceil(RATE_LIMIT_CONFIG.LOCKOUT_DURATION / 60000) }),
      }, { status: 401 });
    }

    // Success - clear rate limit
    clearRateLimit(rateLimitKey)

    const token = await createSession(user.id);
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "An error occurred during login" }, { status: 500 });
  }
}
