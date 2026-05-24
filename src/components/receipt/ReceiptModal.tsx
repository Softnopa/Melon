"use client";

import { useRef } from "react";
import { X, Printer, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { formatMoney, formatDate } from "@/lib/format";
import type { ReceiptData } from "@/lib/types";
import { isOverdue, daysUntilDue } from "@/lib/mappers";

export function ReceiptModal({
  data,
  onClose,
}: {
  data: ReceiptData | null;
  onClose: () => void;
}) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (!data) return;
    const text = [
      `🍈 ${data.businessName}`,
      data.kind === "sale" ? "SALE RECEIPT" : "PAYMENT RECEIPT",
      `Customer: ${data.customerName}`,
      data.melonAmount != null ? `Melons: ${data.melonAmount}` : null,
      `Amount: ${formatMoney(data.amount, data.currency)}`,
      data.remainingDebt != null
        ? `Balance due: ${formatMoney(data.remainingDebt, data.currency)}`
        : null,
      data.dueDate ? `Due: ${new Date(data.dueDate).toLocaleDateString()}` : null,
      `Ref: ${data.referenceId.slice(0, 8)}`,
    ]
      .filter(Boolean)
      .join("\n");

    if (navigator.share) {
      await navigator.share({ title: "Melon Business Receipt", text });
    } else {
      await navigator.clipboard.writeText(text);
      alert("Receipt copied to clipboard");
    }
  };

  if (!data) return null;

  const overdue = isOverdue(data.dueDate);
  const days = daysUntilDue(data.dueDate);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 p-4 backdrop-blur-sm sm:items-center print:bg-white print:p-0"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md print:max-w-none print:shadow-none"
        >
          <div
            ref={printRef}
            id="receipt-print"
            className="rounded-2xl bg-white p-6 shadow-card print:rounded-none print:shadow-none"
          >
            <div className="mb-4 flex items-start justify-between print:hidden">
              <h2 className="text-lg font-bold text-ink">Receipt</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1 text-ink/40 hover:bg-ink/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-dashed border-ink/15 pb-4 text-center">
              <p className="text-2xl">🍈</p>
              <p className="mt-1 text-lg font-bold text-ink">{data.businessName}</p>
              <p className="text-xs font-semibold uppercase tracking-widest text-melon-600">
                {data.kind === "sale" ? "Sale Invoice" : "Payment Receipt"}
              </p>
              <p className="mt-1 text-xs text-ink/45">{formatDate(data.date)}</p>
            </div>

            <div className="space-y-3 py-4 text-sm">
              <Row label="Customer" value={data.customerName} />
              {data.melonAmount != null && (
                <Row label="Melons" value={String(data.melonAmount)} />
              )}
              {data.totalCost != null && (
                <Row label="Total" value={formatMoney(data.totalCost, data.currency)} />
              )}
              <Row label={data.kind === "payment" ? "Paid now" : "Paid"} value={formatMoney(data.amount, data.currency)} />
              {data.paidAmount != null && data.kind === "sale" && (
                <Row label="Total paid" value={formatMoney(data.paidAmount, data.currency)} />
              )}
              {data.remainingDebt != null && (
                <Row
                  label="Balance due"
                  value={formatMoney(data.remainingDebt, data.currency)}
                  highlight={data.remainingDebt > 0}
                />
              )}
              {data.dueDate && (
                <Row
                  label="Due date"
                  value={new Date(data.dueDate).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                  highlight={overdue}
                />
              )}
              {days != null && data.remainingDebt != null && data.remainingDebt > 0 && (
                <p
                  className={`text-center text-xs font-medium ${
                    overdue ? "text-red-600" : days <= 2 ? "text-amber-600" : "text-ink/45"
                  }`}
                >
                  {overdue
                    ? "OVERDUE — payment was due"
                    : days === 0
                      ? "Due today"
                      : `Due in ${days} day(s)`}
                </p>
              )}
              <Row label="Reference" value={data.referenceId.slice(0, 8).toUpperCase()} />
            </div>

            <p className="border-t border-dashed border-ink/15 pt-3 text-center text-xs text-ink/40">
              Powered by Aziz · Thank you!
            </p>

            <div className="mt-4 flex gap-2 print:hidden">
              <Button variant="secondary" size="md" className="flex-1" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button size="md" className="flex-1" onClick={handlePrint}>
                <Printer className="h-4 w-4" />
                Print
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-ink/50">{label}</span>
      <span className={`font-semibold ${highlight ? "text-red-600" : "text-ink"}`}>
        {value}
      </span>
    </div>
  );
}
