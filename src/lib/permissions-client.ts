import type { Role } from "@/lib/types";
import type { Permission } from "@/lib/permissions";

export function can(role: Role, _p: Permission): boolean {
  if (role === "OWNER") return true;
  return false;
}