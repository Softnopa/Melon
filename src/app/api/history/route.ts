import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession, requirePermission } from "@/lib/server-auth";
import { mapActivity } from "@/lib/mappers";

export async function GET() {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;

  const activities = await prisma.activity.findMany({
    where: { organizationId: auth.session.organizationId },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({
    history: activities.map(mapActivity),
  });
}

export async function DELETE() {
  const auth = await requirePermission("clear_history");
  if ("error" in auth) return auth.error;

  await prisma.activity.deleteMany({
    where: { organizationId: auth.session.organizationId },
  });

  return NextResponse.json({ ok: true });
}
