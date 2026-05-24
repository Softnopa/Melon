import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/server-auth";
import { mapCustomer, mapActivity } from "@/lib/mappers";

const schema = z.object({
  amount: z.number().positive(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const existing = await prisma.customer.findFirst({
    where: { id, organizationId: auth.session.organizationId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const paidAmount = existing.paidAmount + parsed.data.amount;
  const remainingDebt = Math.max(0, existing.totalCost - paidAmount);

  const customer = await prisma.customer.update({
    where: { id },
    data: { paidAmount, remainingDebt },
  });

  const activity = await prisma.activity.create({
    data: {
      organizationId: auth.session.organizationId,
      customerId: customer.id,
      customerName: customer.name,
      type: "PAYMENT",
      description: "Payment received",
      amount: parsed.data.amount,
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
