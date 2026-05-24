import { NextResponse } from "next/server";
import { getSession, type SessionPayload } from "@/lib/session";
import { can, type Permission } from "@/lib/permissions";

export async function requireSession(): Promise<
  { session: SessionPayload } | { error: NextResponse }
> {
  const session = await getSession();
  if (!session) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session };
}

export async function requirePermission(
  permission: Permission
): Promise<{ session: SessionPayload } | { error: NextResponse }> {
  const result = await requireSession();
  if ("error" in result) return result;
  if (!can(result.session.role, permission)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return result;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}
