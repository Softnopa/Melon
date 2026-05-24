import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClientIp } from "@/lib/server-auth";
import { isIpBanned } from "@/lib/server-ip-ban";
import { mapProfileToAuthUser, mapProfileToSession } from "@/lib/session";
import { assertSupabaseEnv } from "@/lib/supabase/env";

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  organizationName: z.string().min(1).max(120).optional(),
  inviteCode: z.string().optional(),
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
    return NextResponse.json({ error: "IP banned" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { name, email, password, organizationName, inviteCode } = parsed.data;
  const normalized = email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: normalized,
    password,
    options: {
      data: { name: name.trim() },
      emailRedirectTo: `${request.headers.get("origin") ?? "http://localhost:3000"}/auth/callback`,
    },
  });

  if (authError || !authData.user) {
    return NextResponse.json(
      { error: authError?.message ?? "Could not create account" },
      { status: 400 }
    );
  }

  const supabaseId = authData.user.id;

  let organizationId: string;
  let role: "OWNER" | "WORKER" = "WORKER";

  try {
    if (inviteCode?.trim()) {
      const org = await prisma.organization.findUnique({
        where: { inviteCode: inviteCode.trim() },
      });
      if (!org) {
        throw new Error("Invalid invite code");
      }
      organizationId = org.id;
      role = "WORKER";
    } else {
      const orgCount = await prisma.organization.count();
      if (orgCount > 0) {
        throw new Error(
          "Invite code required to join existing business. Ask the owner for the team code."
        );
      }
      const org = await prisma.organization.create({
        data: { name: organizationName?.trim() || "Melon Business" },
      });
      organizationId = org.id;
      role = "OWNER";
    }

    const user = await prisma.user.create({
      data: {
        supabaseId,
        name: name.trim(),
        email: normalized,
        role,
        organizationId,
      },
      include: { organization: true },
    });

    const session = mapProfileToSession(user);

    if (!authData.session) {
      return NextResponse.json({
        user: mapProfileToAuthUser(session),
        needsEmailConfirmation: true,
        message: "Check your email to confirm your account, then sign in.",
      });
    }

    return NextResponse.json({ user: mapProfileToAuthUser(session) });
  } catch (err) {
    try {
      const admin = createAdminClient();
      await admin.auth.admin.deleteUser(supabaseId);
    } catch {
      // ignore cleanup errors
    }
    const message = err instanceof Error ? err.message : "Registration failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
