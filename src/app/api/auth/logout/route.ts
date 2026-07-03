import { NextResponse } from "next/server";
import { getCurrentUser, clearSession, clearSessionCookie } from "@/lib/auth";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (user) {
      await clearSession(user.id);
    }
    await clearSessionCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "An error occurred during logout" }, { status: 500 });
  }
}
