import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function genRef(): string {
  return `PRJ-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
}

export async function POST(request: NextRequest) {
  try {
    const b = await request.json();
    const { industry, description, referenceSites, features, visualStyle, budget, timeline, contactMethod, name, email, phone, bestTime } = b;
    if (!industry) return NextResponse.json({ error: "Industry required" }, { status: 400 });
    if (!contactMethod) return NextResponse.json({ error: "Contact method required" }, { status: 400 });
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
    if (!email || !email.includes("@")) return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    if ((contactMethod === "whatsapp" || contactMethod === "phone") && !phone) return NextResponse.json({ error: "Phone required" }, { status: 400 });

    let ref = genRef();
    while (await db.projectRequest.findUnique({ where: { referenceNumber: ref } })) ref = genRef();

    const pr = await db.projectRequest.create({
      data: {
        referenceNumber: ref,
        industry: industry.trim(),
        description: description?.trim() || null,
        referenceSites: JSON.stringify(referenceSites || []),
        features: JSON.stringify(features || {}),
        visualStyle: visualStyle ? JSON.stringify(visualStyle) : null,
        budget: budget || null,
        timeline: timeline || null,
        contactMethod,
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        bestTime: bestTime || null,
      },
    });
    return NextResponse.json({ success: true, referenceNumber: pr.referenceNumber, id: pr.id }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const requests = await db.projectRequest.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ requests });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
