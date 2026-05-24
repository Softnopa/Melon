import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/server-auth";

export async function GET() {
  const auth = await requirePermission("manage_team");
  if ("error" in auth) return auth.error;

  const org = await prisma.organization.findUnique({
    where: { id: auth.session.organizationId },
    select: { inviteCode: true, name: true },
  });

  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  return NextResponse.json({
    inviteCode: org.inviteCode,
    organizationName: org.name,
  });
}
