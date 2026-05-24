import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Role } from "@prisma/client";

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  role: Role;
  organizationId: string;
  organizationName: string;
};

export function mapProfileToSession(
  profile: {
    id: string;
    email: string;
    name: string;
    role: Role;
    organizationId: string;
    organization: { name: string };
  }
): SessionPayload {
  return {
    userId: profile.id,
    email: profile.email,
    name: profile.name,
    role: profile.role,
    organizationId: profile.organizationId,
    organizationName: profile.organization.name,
  };
}

export function mapProfileToAuthUser(session: SessionPayload) {
  return {
    id: session.userId,
    email: session.email,
    name: session.name,
    role: session.role as "OWNER" | "WORKER",
    organizationId: session.organizationId,
    organizationName: session.organizationName,
  };
}

/** Loads app profile for the current Supabase auth user. */
export async function getSession(): Promise<SessionPayload | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const profile = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: { organization: true },
  });

  if (!profile) return null;

  return mapProfileToSession(profile);
}
