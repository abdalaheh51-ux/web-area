import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const comments = await db.visitorComment.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ comments });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const { id, isApproved } = await request.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    
    const updated = await db.visitorComment.update({
      where: { id },
      data: { isApproved: isApproved !== undefined ? isApproved : undefined },
    });
    return NextResponse.json({ success: true, comment: updated });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
