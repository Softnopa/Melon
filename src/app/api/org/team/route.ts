import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/server-auth";

export async function GET() {
  const auth = await requirePermission("manage_team");
  if ("error" in auth) return auth.error;

  const users = await prisma.User.findMany({
    where: { organizationId: auth.session.organizationId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ users });
}
