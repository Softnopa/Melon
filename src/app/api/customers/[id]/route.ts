import { NextResponse } from "next/server";
import { z } from "zod";
import { Currency } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireSession, requirePermission } from "@/lib/server-auth";
import { mapCustomer, mapActivity } from "@/lib/mappers";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  melonAmount: z.number().min(0).optional(),
  totalCost: z.number().min(0).optional(),
  paidAmount: z.number().min(0).optional(),
  purchaseCost: z.number().min(0).optional(),
  currency: z.enum(["UZS", "USD"]).optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const existing = await prisma.customer.findFirst({
    where: { id, organizationId: auth.session.organizationId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (parsed.data.purchaseCost !== undefined) {
    const perm = await requirePermission("set_purchase_cost");
    if ("error" in perm) return perm.error;
  }

  const totalCost = parsed.data.totalCost ?? existing.totalCost;
  const paidAmount = parsed.data.paidAmount ?? existing.paidAmount;
  const remainingDebt = Math.max(0, totalCost - paidAmount);

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      ...(parsed.data.name && { name: parsed.data.name.trim() }),
      ...(parsed.data.melonAmount !== undefined && { melonAmount: parsed.data.melonAmount }),
      ...(parsed.data.totalCost !== undefined && { totalCost: parsed.data.totalCost }),
      ...(parsed.data.paidAmount !== undefined && { paidAmount: parsed.data.paidAmount }),
      ...(parsed.data.purchaseCost !== undefined && {
        purchaseCost: parsed.data.purchaseCost,
      }),
      ...(parsed.data.currency && { currency: parsed.data.currency as Currency }),
      ...(parsed.data.dueDate !== undefined && {
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      }),
      remainingDebt,
    },
  });

  const activity = await prisma.activity.create({
    data: {
      organizationId: auth.session.organizationId,
      customerId: customer.id,
      customerName: customer.name,
      type: "EDIT",
      description: "Customer record updated",
      currency: customer.currency,
      userId: auth.session.userId,
      userName: auth.session.name,
    },
  });

  return NextResponse.json({
    customer: mapCustomer(customer),
    activity: mapActivity(activity),
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("delete_customer");
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const existing = await prisma.customer.findFirst({
    where: { id, organizationId: auth.session.organizationId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.customer.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
