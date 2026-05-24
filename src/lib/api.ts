export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: Record<string, unknown>
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      (data as { error?: string }).error ?? "Request failed",
      res.status,
      data as Record<string, unknown>
    );
  }

  return data as T;
}

export const api = {
  auth: {
    me: () => request<{ user: import("@/lib/types").AuthUser | null }>("/api/auth/me"),
    login: (email: string, password: string) =>
      request<{ user: import("@/lib/types").AuthUser }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    register: (body: {
      name: string;
      email: string;
      password: string;
      organizationName?: string;
      inviteCode?: string;
    }) =>
      request<{
        user: import("@/lib/types").AuthUser;
        needsEmailConfirmation?: boolean;
        message?: string;
      }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    logout: () => request<{ ok: boolean }>("/api/auth/logout", { method: "POST" }),
    banStatus: () =>
      request<{
        ip: string;
        banned: boolean;
        attempts: number;
        maxAttempts: number;
        banInfo: { bannedAt: string; reason: string } | null;
      }>("/api/auth/ban-status"),
    clearBan: () =>
      request<{ ok: boolean; ip: string }>("/api/auth/clear-ban", { method: "POST" }),
  },
  org: {
    invite: () =>
      request<{ inviteCode: string; organizationName: string }>("/api/org/invite"),
    team: () =>
      request<{
        users: { id: string; name: string; email: string; role: string; createdAt: string }[];
      }>("/api/org/team"),
  },
  customers: {
    list: () =>
      request<{ customers: import("@/lib/types").Customer[] }>("/api/customers"),
    create: (body: Record<string, unknown>) =>
      request<{
        customer: import("@/lib/types").Customer;
        activity: import("@/lib/types").HistoryEntry;
      }>("/api/customers", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: Record<string, unknown>) =>
      request<{
        customer: import("@/lib/types").Customer;
        activity: import("@/lib/types").HistoryEntry;
      }>(`/api/customers/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    delete: (id: string) =>
      request<{ ok: boolean }>(`/api/customers/${id}`, { method: "DELETE" }),
    payment: (id: string, amount: number) =>
      request<{
        customer: import("@/lib/types").Customer;
        activity: import("@/lib/types").HistoryEntry;
      }>(`/api/customers/${id}/payment`, {
        method: "POST",
        body: JSON.stringify({ amount }),
      }),
  },
  history: {
    list: () =>
      request<{ history: import("@/lib/types").HistoryEntry[] }>("/api/history"),
    clear: () => request<{ ok: boolean }>("/api/history", { method: "DELETE" }),
  },
  reports: (period: "daily" | "weekly") =>
    request<import("@/lib/types").ReportsData>(`/api/reports?period=${period}`),
  exportCsv: (type: "customers" | "debts" | "history") =>
    fetch(`/api/export?type=${type}`, { credentials: "include" }),
  exportSnapshot: () =>
    request<{ customers: unknown[]; history: unknown[]; exportedAt: string; organization: string }>(
      "/api/export",
      { method: "POST" }
    ),
};
