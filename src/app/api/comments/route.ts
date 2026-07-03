import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, comment, rating } = body;
    if (!comment || typeof comment !== "string" || comment.trim().length === 0)
      return NextResponse.json({ error: "Comment is required" }, { status: 400 });
    if (comment.trim().length > 500)
      return NextResponse.json({ error: "Too long" }, { status: 400 });
    const vc = await db.visitorComment.create({ data: { name: name?.trim() || null, comment: comment.trim(), rating: rating || 5 } });
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
