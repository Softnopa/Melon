import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/server-auth";

type Period = "daily" | "weekly";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function periodRange(period: Period): { from: Date; to: Date } {
  const to = new Date();
  const from = startOfDay(to);
  if (period === "weekly") {
    from.setDate(from.getDate() - 6);
  }
  return { from, to };
}

export async function GET(request: Request) {
  const auth = await requirePermission("view_reports");
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const period = (searchParams.get("period") === "weekly" ? "weekly" : "daily") as Period;
  const { from, to } = periodRange(period);
  const orgId = auth.session.organizationId;

  const [customers, payments, creates, overdueCount] = await Promise.all([
    prisma.customer.findMany({ where: { organizationId: orgId } }),
    prisma.activity.findMany({
      where: {
        organizationId: orgId,
        type: "PAYMENT",
        createdAt: { gte: from, lte: to },
      },
    }),
    prisma.activity.findMany({
      where: {
        organizationId: orgId,
        type: "CREATE",
        createdAt: { gte: from, lte: to },
      },
    }),
    prisma.customer.count({
      where: {
        organizationId: orgId,
        remainingDebt: { gt: 0 },
        dueDate: { lt: startOfDay(new Date()) },
      },
    }),
  ]);

  type Bucket = {
    salesRevenue: number;
    melonsSold: number;
    debtCollected: number;
    profit: number;
    outstandingDebt: number;
  };

  const byCurrency: Record<string, Bucket> = {
    UZS: { salesRevenue: 0, melonsSold: 0, debtCollected: 0, profit: 0, outstandingDebt: 0 },
    USD: { salesRevenue: 0, melonsSold: 0, debtCollected: 0, profit: 0, outstandingDebt: 0 },
  };

  for (const c of creates) {
    const cur = c.currency;
    if (!byCurrency[cur]) continue;
    byCurrency[cur].salesRevenue += c.amount ?? 0;
  }

  for (const c of customers) {
    const cur = c.currency;
    if (!byCurrency[cur]) continue;
    byCurrency[cur].outstandingDebt += c.remainingDebt;
    if (c.createdAt >= from && c.createdAt <= to) {
      byCurrency[cur].melonsSold += c.melonAmount;
    }
  }

  for (const p of payments) {
    const cur = p.currency;
    if (!byCurrency[cur]) continue;
    byCurrency[cur].debtCollected += p.amount ?? 0;
    const cust = customers.find((c) => c.id === p.customerId);
    if (cust && cust.purchaseCost > 0 && cust.totalCost > 0) {
      const margin = (cust.totalCost - cust.purchaseCost) / cust.totalCost;
      byCurrency[cur].profit += (p.amount ?? 0) * margin;
    } else {
      byCurrency[cur].profit += p.amount ?? 0;
    }
  }

  return NextResponse.json({
    period,
    from: from.toISOString(),
    to: to.toISOString(),
    overdueCount,
    byCurrency,
    totalCustomers: customers.length,
    activeDebts: customers.filter((c) => c.remainingDebt > 0).length,
  });
}
