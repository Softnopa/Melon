"use client";

import { useMemo, useState } from "react";
import { Save } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SuccessOverlay } from "@/components/ui/SuccessOverlay";
import { ReceiptModal } from "@/components/receipt/ReceiptModal";
import { formatMoney } from "@/lib/format";
import { can } from "@/lib/permissions-client";
import type { AuthUser, Currency, ReceiptData } from "@/lib/types";

export function AddDataPage({
  user,
  onSave,
}: {
  user: AuthUser;
  onSave: (body: Record<string, unknown>) => Promise<{
    customer: import("@/lib/types").Customer;
    activity: import("@/lib/types").HistoryEntry;
  }>;
}) {
  const [name, setName] = useState("");
  const [melonAmount, setMelonAmount] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [purchaseCost, setPurchaseCost] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [currency, setCurrency] = useState<Currency>("UZS");
  const [showSuccess, setShowSuccess] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [saving, setSaving] = useState(false);

  const total = parseFloat(totalCost) || 0;
  const paid = parseFloat(paidAmount) || 0;
  const remaining = useMemo(() => Math.max(0, total - paid), [total, paid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || saving) return;

    setSaving(true);
    try {
      const res = await onSave({
        name: name.trim(),
        melonAmount: parseFloat(melonAmount) || 0,
        totalCost: total,
        paidAmount: paid,
        purchaseCost: can(user.role, "set_purchase_cost")
          ? parseFloat(purchaseCost) || 0
          : 0,
        currency,
        dueDate: dueDate ? new Date(dueDate + "T12:00:00").toISOString() : null,
      });

      setReceipt({
        kind: "sale",
        customerName: res.customer.name,
        melonAmount: res.customer.melonAmount,
        amount: total,
        totalCost: total,
        paidAmount: paid,
        remainingDebt: res.customer.remainingDebt,
        currency,
        dueDate: res.customer.dueDate,
        businessName: user.organizationName,
        date: res.customer.createdAt,
        referenceId: res.customer.id,
      });

      setShowSuccess(true);
      setName("");
      setMelonAmount("");
      setTotalCost("");
      setPaidAmount("");
      setPurchaseCost("");
      setDueDate("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 pb-4">
        <Card className="space-y-4">
          <Input
            label="Customer name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sardor Bek"
          />
          <Input
            label="Melon amount"
            type="number"
            min="0"
            step="0.1"
            value={melonAmount}
            onChange={(e) => setMelonAmount(e.target.value)}
            placeholder="0"
          />
          <Input
            label="Total cost"
            type="number"
            min="0"
            step="any"
            value={totalCost}
            onChange={(e) => setTotalCost(e.target.value)}
            placeholder="0"
          />
          <Input
            label="Paid amount"
            type="number"
            min="0"
            step="any"
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
            placeholder="0"
          />
          {can(user.role, "set_purchase_cost") && (
            <Input
              label="Purchase cost (for profit)"
              type="number"
              min="0"
              step="any"
              value={purchaseCost}
              onChange={(e) => setPurchaseCost(e.target.value)}
              placeholder="What you paid for melons"
              hint="Owner only — used in profit reports"
            />
          )}
          <Input
            label="Due date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            hint="e.g. pay by Friday — overdue debts are highlighted"
          />

          <div className="rounded-xl border border-melon-200/60 bg-melon-50/80 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-melon-800/70">
              Remaining debt
            </p>
            <p className="mt-0.5 text-2xl font-bold text-melon-800">
              {formatMoney(remaining, currency)}
            </p>
            <p className="text-xs text-ink/40">Auto-calculated: total − paid</p>
          </div>

          <div>
            <span className="text-sm font-medium text-ink/80">Currency</span>
            <div className="mt-1.5 flex gap-2">
              {(["UZS", "USD"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold transition-all ${
                    currency === c
                      ? "border-melon-500 bg-melon-600 text-white shadow-md"
                      : "border-ink/10 bg-white/90 text-ink/60 hover:border-ink/20"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Button type="submit" size="lg" className="shadow-card" disabled={saving}>
          <Save className="h-5 w-5" />
          {saving ? "Saving…" : "Save Record"}
        </Button>
      </form>

      <SuccessOverlay
        show={showSuccess}
        message="Record saved!"
        onDone={() => setShowSuccess(false)}
      />
      <ReceiptModal data={receipt} onClose={() => setReceipt(null)} />
    </>
  );
}
