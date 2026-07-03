import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const items = await db.portfolioItem.findMany({ orderBy: { order: "desc" } });
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const body = await request.json();

    // Clean data - remove id, convert empty strings to defaults
    const { id, ...data } = body;
    const cleanData: Record<string, unknown> = {}
    const nullableFields = ['imageUrl', 'gallery1', 'gallery2', 'gallery3', 'externalUrl']
    for (const [key, value] of Object.entries(data)) {
      if (value === '' || value === undefined) {
        cleanData[key] = nullableFields.includes(key) ? null : ''
      } else {
        cleanData[key] = value
      }
    }

    // Auto-assign order: highest existing order + 1 (newest on top)
    const maxOrderItem = await db.portfolioItem.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true },
    })
    cleanData.order = (maxOrderItem?.order || 0) + 1

    const item = await db.portfolioItem.create({ data: cleanData });
    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    console.error("Portfolio create error:", error);
    return NextResponse.json({ error: "Failed to create: " + (error instanceof Error ? error.message : 'unknown') }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const { id, ...rawData } = await request.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    // Clean data - convert empty strings to defaults
    const cleanData: Record<string, unknown> = {}
    const nullableFields = ['imageUrl', 'gallery1', 'gallery2', 'gallery3', 'externalUrl']
    for (const [key, value] of Object.entries(rawData)) {
      if (value === '' || value === undefined) {
        cleanData[key] = nullableFields.includes(key) ? null : ''
      } else {
        cleanData[key] = value
      }
    }

    const item = await db.portfolioItem.update({ where: { id }, data: cleanData });
    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Portfolio update error:", error);
    return NextResponse.json({ error: "Failed to update: " + (error instanceof Error ? error.message : 'unknown') }, { status: 500 });
  }
}
