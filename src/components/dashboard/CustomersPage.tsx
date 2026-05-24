"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ArrowUpDown,
  Pencil,
  Wallet,
  X,
  Check,
  Trash2,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ReceiptModal } from "@/components/receipt/ReceiptModal";
import { formatMoney } from "@/lib/format";
import { isOverdue, daysUntilDue } from "@/lib/mappers";
import { can } from "@/lib/permissions-client";
import type { AuthUser, Customer, Currency, ReceiptData, SortOption } from "@/lib/types";

const sortLabels: Record<SortOption, string> = {
  "name-asc": "Name A→Z",
  "name-desc": "Name Z→A",
  "debt-high": "Debt ↓",
  "debt-low": "Debt ↑",
};

const sortCycle: SortOption[] = ["name-asc", "name-desc", "debt-high", "debt-low"];

export function CustomersPage({
  user,
  customers,
  onUpdate,
  onPayment,
  onDelete,
}: {
  user: AuthUser;
  customers: Customer[];
  onUpdate: (id: string, body: Record<string, unknown>) => Promise<void>;
  onPayment: (id: string, amount: number) => Promise<Customer>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("name-asc");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string | number>>({});
  const [paymentAmount, setPaymentAmount] = useState("");
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = customers.filter((c) => c.name.toLowerCase().includes(q));
    switch (sort) {
      case "name-asc":
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        list = [...list].sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "debt-high":
        list = [...list].sort((a, b) => b.remainingDebt - a.remainingDebt);
        break;
      case "debt-low":
        list = [...list].sort((a, b) => a.remainingDebt - b.remainingDebt);
        break;
    }
    return list;
  }, [customers, search, sort]);

  const totalDebt = useMemo(
    () =>
      customers.reduce(
        (acc, c) => {
          acc[c.currency] = (acc[c.currency] ?? 0) + c.remainingDebt;
          return acc;
        },
        {} as Record<Currency, number>
      ),
    [customers]
  );

  const startEdit = (c: Customer) => {
    setEditingId(c.id);
    setEditForm({
      name: c.name,
      melonAmount: c.melonAmount,
      totalCost: c.totalCost,
      paidAmount: c.paidAmount,
      purchaseCost: c.purchaseCost,
      currency: c.currency,
      dueDate: c.dueDate ? c.dueDate.slice(0, 10) : "",
    });
    setPaymentId(null);
  };

  const saveEdit = async (c: Customer) => {
    const total = Number(editForm.totalCost) ?? c.totalCost;
    const paid = Number(editForm.paidAmount) ?? c.paidAmount;
    await onUpdate(c.id, {
      name: String(editForm.name ?? c.name).trim(),
      melonAmount: Number(editForm.melonAmount) ?? c.melonAmount,
      totalCost: total,
      paidAmount: paid,
      purchaseCost: Number(editForm.purchaseCost) ?? c.purchaseCost,
      currency: editForm.currency as Currency,
      dueDate: editForm.dueDate
        ? new Date(String(editForm.dueDate) + "T12:00:00").toISOString()
        : null,
    });
    setEditingId(null);
  };

  const submitPayment = async (c: Customer) => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) return;
    const updated = await onPayment(c.id, amount);
    setReceipt({
      kind: "payment",
      customerName: updated.name,
      amount,
      remainingDebt: updated.remainingDebt,
      currency: updated.currency,
      dueDate: updated.dueDate,
      businessName: user.organizationName,
      date: new Date().toISOString(),
      referenceId: updated.id,
    });
    setPaymentId(null);
    setPaymentAmount("");
  };

  return (
    <div className="space-y-4 pb-4">
      <Card className="!p-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers…"
              className="w-full rounded-xl border border-ink/10 bg-white/90 py-2.5 pl-9 pr-3 text-sm focus:border-melon-500 focus:outline-none focus:ring-2 focus:ring-melon-500/20"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              const idx = sortCycle.indexOf(sort);
              setSort(sortCycle[(idx + 1) % sortCycle.length]);
            }}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-ink/10 bg-white/90 px-3 text-xs font-semibold text-ink/70"
          >
            <ArrowUpDown className="h-4 w-4" />
            <span className="hidden sm:inline">{sortLabels[sort]}</span>
          </button>
        </div>
      </Card>

      {can(user.role, "view_totals") && (
        <Card className="!py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-ink/45">
            Total outstanding debt
          </p>
          <div className="mt-1 flex flex-wrap gap-3">
            {(["UZS", "USD"] as const).map((cur) =>
              totalDebt[cur] ? (
                <p key={cur} className="text-lg font-bold text-red-600">
                  {formatMoney(totalDebt[cur] ?? 0, cur)}
                </p>
              ) : null
            )}
            {!totalDebt.UZS && !totalDebt.USD && (
              <p className="text-lg font-bold text-melon-700">No debt</p>
            )}
          </div>
        </Card>
      )}

      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12 text-center text-sm text-ink/45"
          >
            {search ? "No customers match your search" : "No customers yet. Add your first sale!"}
          </motion.p>
        ) : (
          filtered.map((c, i) => {
            const overdue = c.remainingDebt > 0 && isOverdue(c.dueDate);
            const days = daysUntilDue(c.dueDate);
            return (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <Card
                  className={
                    overdue ? "!border-red-300 !bg-red-50/50 ring-1 ring-red-200" : ""
                  }
                >
                  {editingId === c.id ? (
                    <EditForm
                      editForm={editForm}
                      setEditForm={setEditForm}
                      showPurchaseCost={can(user.role, "set_purchase_cost")}
                      onCancel={() => setEditingId(null)}
                      onSave={() => saveEdit(c)}
                    />
                  ) : paymentId === c.id ? (
                    <div className="space-y-3">
                      <p className="font-semibold text-ink">Add payment — {c.name}</p>
                      <Input
                        label="Payment amount"
                        type="number"
                        min="0"
                        step="any"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setPaymentId(null)}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={() => submitPayment(c)}>
                          <Wallet className="h-4 w-4" />
                          Confirm
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-ink">{c.name}</h3>
                          <p className="mt-0.5 text-xs text-ink/45">
                            {c.melonAmount} melons · {c.currency}
                          </p>
                          {c.dueDate && c.remainingDebt > 0 && (
                            <p
                              className={`mt-1 flex items-center gap-1 text-xs font-medium ${
                                overdue ? "text-red-600" : "text-amber-700"
                              }`}
                            >
                              <AlertCircle className="h-3 w-3" />
                              {overdue
                                ? "Overdue"
                                : days === 0
                                  ? "Due today"
                                  : `Due in ${days}d`}
                              {" · "}
                              {new Date(c.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                            overdue
                              ? "bg-red-200 text-red-800"
                              : c.remainingDebt > 0
                                ? "bg-red-100 text-red-700"
                                : "bg-melon-100 text-melon-800"
                          }`}
                        >
                          {overdue ? "OVERDUE" : c.remainingDebt > 0 ? "Owes" : "Paid"}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="rounded-lg bg-ink/5 py-2">
                          <p className="text-ink/40">Total</p>
                          <p className="font-semibold">{formatMoney(c.totalCost, c.currency)}</p>
                        </div>
                        <div className="rounded-lg bg-ink/5 py-2">
                          <p className="text-ink/40">Paid</p>
                          <p className="font-semibold text-melon-700">
                            {formatMoney(c.paidAmount, c.currency)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-red-50 py-2">
                          <p className="text-red-400">Debt</p>
                          <p className="font-semibold text-red-600">
                            {formatMoney(c.remainingDebt, c.currency)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button size="sm" variant="secondary" onClick={() => startEdit(c)}>
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setPaymentId(c.id);
                            setPaymentAmount("");
                          }}
                          disabled={c.remainingDebt <= 0}
                        >
                          <Wallet className="h-3.5 w-3.5" />
                          Pay
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            setReceipt({
                              kind: "sale",
                              customerName: c.name,
                              melonAmount: c.melonAmount,
                              amount: c.totalCost,
                              totalCost: c.totalCost,
                              paidAmount: c.paidAmount,
                              remainingDebt: c.remainingDebt,
                              currency: c.currency,
                              dueDate: c.dueDate,
                              businessName: user.organizationName,
                              date: c.updatedAt,
                              referenceId: c.id,
                            })
                          }
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Receipt
                        </Button>
                        {can(user.role, "delete_customer") && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              if (confirm(`Delete ${c.name}?`)) onDelete(c.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </Card>
              </motion.div>
            );
          })
        )}
      </AnimatePresence>

      <ReceiptModal data={receipt} onClose={() => setReceipt(null)} />
    </div>
  );
}

function EditForm({
  editForm,
  setEditForm,
  showPurchaseCost,
  onCancel,
  onSave,
}: {
  editForm: Record<string, string | number>;
  setEditForm: (f: Record<string, string | number>) => void;
  showPurchaseCost: boolean;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-3">
      <Input
        label="Name"
        value={editForm.name ?? ""}
        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Melons"
          type="number"
          value={editForm.melonAmount ?? ""}
          onChange={(e) => setEditForm({ ...editForm, melonAmount: e.target.value })}
        />
        <div>
          <span className="text-sm font-medium text-ink/80">Currency</span>
          <select
            value={editForm.currency ?? "UZS"}
            onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })}
            className="mt-1.5 w-full rounded-xl border border-ink/10 bg-white/90 px-3 py-3 text-sm"
          >
            <option value="UZS">UZS</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Total"
          type="number"
          value={editForm.totalCost ?? ""}
          onChange={(e) => setEditForm({ ...editForm, totalCost: e.target.value })}
        />
        <Input
          label="Paid"
          type="number"
          value={editForm.paidAmount ?? ""}
          onChange={(e) => setEditForm({ ...editForm, paidAmount: e.target.value })}
        />
      </div>
      {showPurchaseCost && (
        <Input
          label="Purchase cost"
          type="number"
          value={editForm.purchaseCost ?? ""}
          onChange={(e) => setEditForm({ ...editForm, purchaseCost: e.target.value })}
        />
      )}
      <Input
        label="Due date"
        type="date"
        value={editForm.dueDate ?? ""}
        onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
      />
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={onCancel}>
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button size="sm" onClick={onSave}>
          <Check className="h-4 w-4" />
          Save
        </Button>
      </div>
    </div>
  );
}
