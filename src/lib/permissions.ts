import type { Role } from "@prisma/client";

export type Permission =
  | "view_totals"
  | "view_reports"
  | "export_data"
  | "clear_history"
  | "delete_customer"
  | "set_purchase_cost"
  | "manage_team"
  | "unban_ip";

const OWNER_PERMS: Permission[] = [
  "view_totals",
  "view_reports",
  "export_data",
  "clear_history",
  "delete_customer",
  "set_purchase_cost",
  "manage_team",
  "unban_ip",
];

const WORKER_PERMS: Permission[] = [];

export function can(role: Role, permission: Permission): boolean {
  if (role === "OWNER") return OWNER_PERMS.includes(permission);
  return WORKER_PERMS.includes(permission);
}
