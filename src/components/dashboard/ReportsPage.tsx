"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  Download,
  FileText,
  Package,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { downloadCsvBlob, downloadCustomersPdf, downloadHistoryPdf } from "@/lib/export-pdf";
import type { AuthUser, Currency, ReportsData } from "@/lib/types";
import { can } from "@/lib/permissions-client";

export function ReportsPage({
  user,
  customers,
  history,
}: {
  user: AuthUser;
  customers: import("@/lib/types").Customer[];
  history: import("@/lib/types").HistoryEntry[];
}) {
  const [period, setPeriod] = useState<"daily" | "weekly">("daily");
  const [reports, setReports] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!can(user.role, "view_reports")) return;
    setLoading(true);
    try {
      const data = await api.reports(period);
      setReports(data);
    } catch {
      setReports(null);
    } finally {
      setLoading(false);
    }
  }, [period, user.role]);

  useEffect(() => {
    load();
  }, [load]);

  if (!can(user.role, "view_reports")) {
    return (
      <Card className="py-12 text-center">
        <p className="text-sm text-ink/50">
          Reports are available to owners only.
        </p>
      </Card>
    );
  }

  const currencies: Currency[] = ["UZS", "USD"];

  return (
    <div className="space-y-4 pb-4">
      <div className="flex gap-2">
        {(["daily", "weekly"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold capitalize transition ${
              period === p
                ? "bg-melon-600 text-white shadow-md"
                : "bg-white/90 text-ink/60 border border-ink/10"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-ink/45">Loading reports…</div>
      ) : reports ? (
        <>
          {reports.overdueCount > 0 && (
            <Card className="!border-red-200 !bg-red-50/90">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="font-semibold text-red-800">
                    {reports.overdueCount} overdue customer(s)
                  </p>
                  <p className="text-xs text-red-600/80">Payment date has passed</p>
                </div>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-2">
            <StatCard
              icon={Package}
              label="Melons sold"
              value={String(
                Object.values(reports.byCurrency).reduce((s, b) => s + b.melonsSold, 0)
              )}
            />
            <StatCard
              icon={BarChart3}
              label="Active debts"
              value={String(reports.activeDebts)}
            />
          </div>

          {currencies.map((cur) => {
            const b = reports.byCurrency[cur];
            if (!b || (b.salesRevenue === 0 && b.debtCollected === 0 && b.outstandingDebt === 0))
              return null;
            return (
              <Card key={cur} className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wide text-melon-700">
                  {cur} summary
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <Metric label="Sales" value={formatMoney(b.salesRevenue, cur)} />
                  <Metric label="Collected" value={formatMoney(b.debtCollected, cur)} />
                  <Metric label="Profit*" value={formatMoney(b.profit, cur)} />
                  <Metric
                    label="Outstanding"
                    value={formatMoney(b.outstandingDebt, cur)}
                    danger
                  />
                </div>
                <p className="text-[10px] text-ink/40">
                  *Profit estimated from payments vs purchase cost when set
                </p>
              </Card>
            );
          })}
        </>
      ) : null}

      {can(user.role, "export_data") && (
        <Card className="space-y-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Download className="h-4 w-4" />
            Export (accountant)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                const res = await api.exportCsv("customers");
                await downloadCsvBlob(res, "customers.csv");
              }}
            >
              <FileText className="h-3.5 w-3.5" />
              CSV Customers
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                const res = await api.exportCsv("debts");
                await downloadCsvBlob(res, "debts.csv");
              }}
            >
              <FileText className="h-3.5 w-3.5" />
              CSV Debts
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                const res = await api.exportCsv("history");
                await downloadCsvBlob(res, "history.csv");
              }}
            >
              <FileText className="h-3.5 w-3.5" />
              CSV History
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                downloadCustomersPdf(customers, user.organizationName, "All Customers")
              }
            >
              PDF Customers
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="col-span-2"
              onClick={() => downloadHistoryPdf(history, user.organizationName)}
            >
              PDF History
            </Button>
          </div>
        </Card>
      )}

      {can(user.role, "manage_team") && <TeamPanel />}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package;
  label: string;
  value: string;
}) {
  return (
    <Card className="!p-3">
      <Icon className="mb-1 h-4 w-4 text-melon-600" />
      <p className="text-lg font-bold text-ink">{value}</p>
      <p className="text-[10px] text-ink/45">{label}</p>
    </Card>
  );
}

function Metric({
  label,
  value,
  danger,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-lg bg-ink/5 p-2">
      <p className="text-[10px] text-ink/40">{label}</p>
      <p className={`font-semibold ${danger ? "text-red-600" : "text-ink"}`}>{value}</p>
    </div>
  );
}

function TeamPanel() {
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [team, setTeam] = useState<{ name: string; email: string; role: string }[]>([]);

  useEffect(() => {
    api.org.invite().then((r) => setInviteCode(r.inviteCode)).catch(() => {});
    api.org.team().then((r) => setTeam(r.users)).catch(() => {});
  }, []);

  return (
    <Card className="space-y-3">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink">
        <TrendingUp className="h-4 w-4" />
        Team & roles
      </p>
      {inviteCode && (
        <div className="rounded-xl bg-melon-50 px-3 py-2">
          <p className="text-xs text-ink/50">Worker invite code</p>
          <p className="font-mono text-sm font-bold text-melon-800">{inviteCode}</p>
          <p className="mt-1 text-[10px] text-ink/40">
            Share with workers when they register
          </p>
        </div>
      )}
      <ul className="space-y-2">
        {team.map((u) => (
          <li
            key={u.email}
            className="flex items-center justify-between rounded-lg bg-ink/5 px-3 py-2 text-sm"
          >
            <span className="font-medium">{u.name}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                u.role === "OWNER"
                  ? "bg-melon-100 text-melon-800"
                  : "bg-ink/10 text-ink/60"
              }`}
            >
              {u.role}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-[10px] text-ink/40">
        Owner: full access · Worker: add sales & payments, no reports/export/delete
      </p>
    </Card>
  );
}
