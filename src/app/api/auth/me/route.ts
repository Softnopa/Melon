import { NextResponse } from "next/server";
import { getSession, mapProfileToAuthUser } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    return NextResponse.json({ user: mapProfileToAuthUser(session) });
  } catch (e) {
    console.error("[auth/me]", e);
    return NextResponse.json(
      { error: "Database error. Run: npx prisma db push" },
      { status: 500 }
    );
  }
}
