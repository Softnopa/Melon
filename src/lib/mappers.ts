import type { Activity, Customer, Currency as DbCurrency } from "@prisma/client";
import type { Currency, Customer as ClientCustomer, HistoryEntry } from "@/lib/types";

export function toClientCurrency(c: DbCurrency): Currency {
  return c as Currency;
}

export function mapCustomer(c: Customer): ClientCustomer {
  return {
    id: c.id,
    name: c.name,
    melonAmount: c.melonAmount,
    totalCost: c.totalCost,
    paidAmount: c.paidAmount,
    remainingDebt: c.remainingDebt,
    purchaseCost: c.purchaseCost,
    currency: toClientCurrency(c.currency),
    dueDate: c.dueDate?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export function mapActivity(a: Activity): HistoryEntry {
  return {
    id: a.id,
    type: a.type.toLowerCase() as HistoryEntry["type"],
    customerId: a.customerId,
    customerName: a.customerName,
    description: a.description,
    amount: a.amount ?? undefined,
    currency: toClientCurrency(a.currency),
    timestamp: a.createdAt.toISOString(),
    userName: a.userName ?? undefined,
  };
}

export function isOverdue(dueDate: string | null | undefined): boolean {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

export function daysUntilDue(dueDate: string | null | undefined): number | null {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
