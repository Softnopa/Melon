import { NextResponse } from "next/server";
import { z } from "zod";
import { Currency } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/server-auth";
import { mapCustomer, mapActivity } from "@/lib/mappers";

const createSchema = z.object({
  name: z.string().min(1),
  melonAmount: z.number().min(0),
  totalCost: z.number().min(0),
  paidAmount: z.number().min(0),
  purchaseCost: z.number().min(0).optional(),
  currency: z.enum(["UZS", "USD"]),
  dueDate: z.string().datetime().nullable().optional(),
});

export async function GET() {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;

  const customers = await prisma.customer.findMany({
    where: { organizationId: auth.session.organizationId },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({
    customers: customers.map(mapCustomer),
  });
}

export async function POST(request: Request) {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { name, melonAmount, totalCost, paidAmount, purchaseCost, currency, dueDate } =
    parsed.data;
  const remainingDebt = Math.max(0, totalCost - paidAmount);

  const customer = await prisma.customer.create({
    data: {
      organizationId: auth.session.organizationId,
      name: name.trim(),
      melonAmount,
      totalCost,
      paidAmount,
      remainingDebt,
      purchaseCost: purchaseCost ?? 0,
      currency: currency as Currency,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  const activity = await prisma.activity.create({
    data: {
      organizationId: auth.session.organizationId,
      customerId: customer.id,
      customerName: customer.name,
      type: "CREATE",
      description: `New sale: ${melonAmount} melons`,
      amount: totalCost,
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
