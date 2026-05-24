import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/server-auth";
import { formatMoney } from "@/lib/format";

function csvEscape(val: string | number) {
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(request: Request) {
  const auth = await requirePermission("export_data");
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "customers";
  const orgId = auth.session.organizationId;

  let csv = "";
  let filename = "export.csv";

  if (type === "customers" || type === "debts") {
    const customers = await prisma.customer.findMany({
      where: { organizationId: orgId },
      orderBy: { name: "asc" },
    });
    const rows =
      type === "debts"
        ? customers.filter((c) => c.remainingDebt > 0)
        : customers;

    csv = [
      "Name,Melons,Total Cost,Paid,Remaining Debt,Currency,Due Date,Purchase Cost",
      ...rows.map((c) =>
        [
          csvEscape(c.name),
          c.melonAmount,
          c.totalCost,
          c.paidAmount,
          c.remainingDebt,
          c.currency,
          c.dueDate?.toISOString().slice(0, 10) ?? "",
          c.purchaseCost,
        ].join(",")
      ),
    ].join("\n");
    filename = type === "debts" ? "debts.csv" : "customers.csv";
  } else if (type === "history") {
    const activities = await prisma.activity.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    csv = [
      "Date,Type,Customer,Description,Amount,Currency,By",
      ...activities.map((a) =>
        [
          a.createdAt.toISOString(),
          a.type,
          csvEscape(a.customerName),
          csvEscape(a.description),
          a.amount ?? "",
          a.currency,
          csvEscape(a.userName ?? ""),
        ].join(",")
      ),
    ].join("\n");
    filename = "history.csv";
  } else {
    return NextResponse.json({ error: "Invalid export type" }, { status: 400 });
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

// Used by client PDF generator — return JSON snapshot
export async function POST() {
  const auth = await requirePermission("export_data");
  if ("error" in auth) return auth.error;

  const orgId = auth.session.organizationId;
  const [customers, history] = await Promise.all([
    prisma.customer.findMany({ where: { organizationId: orgId } }),
    prisma.activity.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ]);

  return NextResponse.json({
    customers: customers.map((c) => ({
      ...c,
      dueDate: c.dueDate?.toISOString() ?? null,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      formattedDebt: formatMoney(c.remainingDebt, c.currency as "UZS" | "USD"),
    })),
    history: history.map((h) => ({
      ...h,
      createdAt: h.createdAt.toISOString(),
    })),
    exportedAt: new Date().toISOString(),
    organization: auth.session.organizationName,
  });
}
