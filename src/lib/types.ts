export type Currency = "UZS" | "USD";

export type Role = "OWNER" | "WORKER";

export type Customer = {
  id: string;
  name: string;
  melonAmount: number;
  totalCost: number;
  paidAmount: number;
  remainingDebt: number;
  purchaseCost: number;
  currency: Currency;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type HistoryEntry = {
  id: string;
  type: "create" | "edit" | "payment";
  customerId: string;
  customerName: string;
  description: string;
  amount?: number;
  currency: Currency;
  timestamp: string;
  userName?: string;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  organizationId: string;
  organizationName: string;
};

export type TabId = "add" | "customers" | "reports" | "history";

export type SortOption = "name-asc" | "name-desc" | "debt-high" | "debt-low";

export type ReportsData = {
  period: "daily" | "weekly";
  from: string;
  to: string;
  overdueCount: number;
  totalCustomers: number;
  activeDebts: number;
  byCurrency: Record<
    string,
    {
      salesRevenue: number;
      melonsSold: number;
      debtCollected: number;
      profit: number;
      outstandingDebt: number;
    }
  >;
};

export type ReceiptData = {
  kind: "sale" | "payment";
  customerName: string;
  melonAmount?: number;
  amount: number;
  totalCost?: number;
  paidAmount?: number;
  remainingDebt?: number;
  currency: Currency;
  dueDate?: string | null;
  businessName: string;
  date: string;
  referenceId: string;
};
