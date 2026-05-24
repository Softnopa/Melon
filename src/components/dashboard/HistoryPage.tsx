"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, Pencil, PlusCircle, Wallet, Trash2, FileText } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ReceiptModal } from "@/components/receipt/ReceiptModal";
import { formatDate, formatMoney } from "@/lib/format";
import { can } from "@/lib/permissions-client";
import type { AuthUser, HistoryEntry, ReceiptData } from "@/lib/types";

const typeConfig = {
  create: { icon: PlusCircle, color: "text-melon-600 bg-melon-100", label: "New sale" },
  edit: { icon: Pencil, color: "text-blue-600 bg-blue-100", label: "Edit" },
  payment: { icon: Wallet, color: "text-amber-600 bg-amber-100", label: "Payment" },
};

export function HistoryPage({
  user,
  history,
  customers,
  onClear,
}: {
  user: AuthUser;
  history: HistoryEntry[];
  customers: import("@/lib/types").Customer[];
  onClear: () => Promise<void>;
}) {
  const [confirmClear, setConfirmClear] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  const handleClear = async () => {
    if (!can(user.role, "clear_history")) return;
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    await onClear();
    setConfirmClear(false);
  };

  const openReceipt = (entry: HistoryEntry) => {
    const customer = customers.find((c) => c.id === entry.customerId);
    setReceipt({
      kind: entry.type === "payment" ? "payment" : "sale",
      customerName: entry.customerName,
      amount: entry.amount ?? 0,
      currency: entry.currency,
      remainingDebt: customer?.remainingDebt,
      dueDate: customer?.dueDate,
      businessName: user.organizationName,
      date: entry.timestamp,
      referenceId: entry.id,
    });
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink/50">
          {history.length} event{history.length !== 1 ? "s" : ""}
        </p>
        {can(user.role, "clear_history") && (
          <Button
            size="sm"
            variant={confirmClear ? "danger" : "secondary"}
            onClick={handleClear}
            onBlur={() => setTimeout(() => setConfirmClear(false), 200)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {confirmClear ? "Confirm clear" : "Clear history"}
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <Card className="py-12 text-center">
          <History className="mx-auto h-10 w-10 text-ink/20" />
          <p className="mt-3 text-sm text-ink/45">No activity yet</p>
        </Card>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence mode="popLayout">
            {history.map((entry, i) => {
              const cfg = typeConfig[entry.type];
              const Icon = cfg.icon;
              return (
                <motion.li
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <Card className="!p-3">
                    <div className="flex gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.color}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">
                              {cfg.label}
                            </p>
                            <p className="font-semibold text-ink">{entry.customerName}</p>
                          </div>
                          {entry.amount != null && (
                            <p className="shrink-0 text-sm font-bold text-melon-700">
                              {formatMoney(entry.amount, entry.currency)}
                            </p>
                          )}
                        </div>
                        <p className="mt-0.5 text-sm text-ink/55">{entry.description}</p>
                        <p className="mt-1 text-xs text-ink/35">
                          {formatDate(entry.timestamp)}
                          {entry.userName ? ` · ${entry.userName}` : ""}
                        </p>
                        {(entry.type === "payment" || entry.type === "create") && (
                          <button
                            type="button"
                            onClick={() => openReceipt(entry)}
                            className="mt-2 flex items-center gap-1 text-xs font-medium text-melon-700"
                          >
                            <FileText className="h-3 w-3" />
                            View receipt
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      <ReceiptModal data={receipt} onClose={() => setReceipt(null)} />
    </div>
  );
}
