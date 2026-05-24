import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getClientIp } from "@/lib/server-auth";
import {
  isIpBanned,
  recordFailedAttempt,
  resetFailedAttempts,
  MAX_LOGIN_ATTEMPTS,
} from "@/lib/server-ip-ban";
import { getSession, mapProfileToAuthUser } from "@/lib/session";
import { assertSupabaseEnv } from "@/lib/supabase/env";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    assertSupabaseEnv();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Supabase not configured" },
      { status: 500 }
    );
  }

  const ip = getClientIp(request);

  if (await isIpBanned(ip)) {
    return NextResponse.json(
      { error: "IP banned", banned: true, ip },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
  });

  if (error) {
    const { attempts, banned } = await recordFailedAttempt(ip);
    return NextResponse.json(
      {
        error: banned
          ? "IP banned after too many failed attempts"
          : error.message || "Invalid email or password",
        attempts,
        remaining: Math.max(0, MAX_LOGIN_ATTEMPTS - attempts),
        banned,
      },
      { status: banned ? 403 : 401 }
    );
  }

  await resetFailedAttempts(ip);

  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      {
        error:
          "Signed in to Supabase but no business profile found. Complete registration or contact support.",
      },
      { status: 403 }
    );
  }

  return NextResponse.json({ user: mapProfileToAuthUser(session) });
}
