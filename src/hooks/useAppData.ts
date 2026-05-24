"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Customer, HistoryEntry } from "@/lib/types";

export function useAppData() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const [c, h] = await Promise.all([
        api.customers.list(),
        api.history.list(),
      ]);
      setCustomers(c.customers);
      setHistory(h.history);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addCustomer = useCallback(
    async (body: Parameters<typeof api.customers.create>[0]) => {
      const res = await api.customers.create(body);
      setCustomers((prev) => [res.customer, ...prev]);
      setHistory((prev) => [res.activity, ...prev]);
      return res;
    },
    []
  );

  const updateCustomer = useCallback(
    async (id: string, body: Parameters<typeof api.customers.update>[1]) => {
      const res = await api.customers.update(id, body);
      setCustomers((prev) => prev.map((c) => (c.id === id ? res.customer : c)));
      setHistory((prev) => [res.activity, ...prev]);
      return res;
    },
    []
  );

  const deleteCustomer = useCallback(async (id: string) => {
    await api.customers.delete(id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const addPayment = useCallback(async (id: string, amount: number) => {
    const res = await api.customers.payment(id, amount);
    setCustomers((prev) => prev.map((c) => (c.id === id ? res.customer : c)));
    setHistory((prev) => [res.activity, ...prev]);
    return res;
  }, []);

  const clearHistory = useCallback(async () => {
    await api.history.clear();
    setHistory([]);
  }, []);

  return {
    customers,
    history,
    loading,
    error,
    refresh,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addPayment,
    clearHistory,
  };
}
