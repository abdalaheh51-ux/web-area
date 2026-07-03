import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, needsStore, needsERP, needsLanding, solutionType, message } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "يرجى إدخال بريد إلكتروني صحيح" },
        { status: 400 }
      );
    }

    const lead = await db.lead.create({
      data: {
        email,
        name: name || null,
        needsStore: needsStore || false,
        needsERP: needsERP || false,
        needsLanding: needsLanding || false,
        solutionType: solutionType || null,
        message: message || null,
      },
    });

    return NextResponse.json(
      { success: true, lead },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "حدث خطأ أثناء حفظ البيانات" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const leads = await db.lead.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ leads });
  } catch {
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب البيانات" },
      { status: 500 }
    );
  }
}
