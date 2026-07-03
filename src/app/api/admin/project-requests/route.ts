import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const requests = await db.projectRequest.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ requests });
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
    const { id, status, adminNotes } = await request.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    
    const updated = await db.projectRequest.update({
      where: { id },
      data: { 
        ...(status && { status }),
        ...(adminNotes !== undefined && { adminNotes }),
      },
    });
    return NextResponse.json({ success: true, request: updated });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
