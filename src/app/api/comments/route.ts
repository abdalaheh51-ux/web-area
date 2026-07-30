import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const rateLimit = checkRateLimit({
      user,
      endpoint: '/api/comments',
      identifier: request.headers.get('x-forwarded-for') || undefined,
    })

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateLimit.retryAfter}s.` },
        { status: 429 },
      )
    }

    const body = await request.json();
    const { name, comment, rating, email } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!comment || typeof comment !== "string" || comment.trim().length === 0) {
      return NextResponse.json({ error: "Comment is required" }, { status: 400 });
    }
    if (comment.trim().length > 500) {
      return NextResponse.json({ error: "Too long" }, { status: 400 });
    }
    if (!email || typeof email !== "string" || email.trim().toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: "Registered email required" }, { status: 401 });
    }

    const vc = await db.visitorComment.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        comment: comment.trim(),
        rating: rating || 5,
      },
    });

    return NextResponse.json({ success: true, id: vc.id }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const comments = await db.visitorComment.findMany({ where: { isApproved: true }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ comments });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
