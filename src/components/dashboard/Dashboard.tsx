"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MelonBackground } from "@/components/ui/MelonBackground";
import { Footer } from "@/components/ui/Footer";
import { BottomNav } from "@/components/dashboard/BottomNav";
import { Header } from "@/components/dashboard/Header";
import { AddDataPage } from "@/components/dashboard/AddDataPage";
import { CustomersPage } from "@/components/dashboard/CustomersPage";
import { HistoryPage } from "@/components/dashboard/HistoryPage";
import { ReportsPage } from "@/components/dashboard/ReportsPage";
import { useAppData } from "@/hooks/useAppData";
import { api } from "@/lib/api";
import type { AuthUser, TabId } from "@/lib/types";

const titles: Record<TabId, string> = {
  add: "Add Data",
  customers: "Customers",
  reports: "Reports",
  history: "History",
};

export function Dashboard({
  user,
  onLogout,
}: {
  user: AuthUser;
  onLogout: () => void;
}) {
  const [tab, setTab] = useState<TabId>("add");
  const {
    customers,
    history,
    loading,
    error,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addPayment,
    clearHistory,
    refresh,
  } = useAppData();

  const handleLogout = async () => {
    await api.auth.logout();
    onLogout();
  };

  return (
    <MelonBackground>
      <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-28 pt-6 sm:px-6">
        <Header user={user} title={titles[tab]} onLogout={handleLogout} />

        {error && (
          <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
            <button type="button" className="ml-2 underline" onClick={() => refresh()}>
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-melon-600 border-t-transparent" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              {tab === "add" && (
                <AddDataPage user={user} onSave={(body) => addCustomer(body)} />
              )}
              {tab === "customers" && (
                <CustomersPage
                  user={user}
                  customers={customers}
                  onUpdate={async (id, body) => {
                    await updateCustomer(id, body);
                  }}
                  onPayment={(id, amount) => addPayment(id, amount).then((r) => r.customer)}
                  onDelete={deleteCustomer}
                />
              )}
              {tab === "reports" && (
                <ReportsPage user={user} customers={customers} history={history} />
              )}
              {tab === "history" && (
                <HistoryPage
                  user={user}
                  history={history}
                  customers={customers}
                  onClear={clearHistory}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}

        <Footer />
      </main>

      <BottomNav active={tab} onChange={setTab} role={user.role} />
    </MelonBackground>
  );
}
