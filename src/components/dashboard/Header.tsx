"use client";

import { LogOut, Crown, User } from "lucide-react";
import type { AuthUser } from "@/lib/types";

export function Header({
  user,
  title,
  onLogout,
}: {
  user: AuthUser;
  title: string;
  onLogout: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 -mx-1 mb-4 flex items-center justify-between rounded-2xl bg-white/60 px-1 py-2 backdrop-blur-md">
      <div>
        <p className="text-xs font-medium text-ink/45">{user.organizationName}</p>
        <h1 className="text-lg font-bold tracking-tight text-ink">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`hidden items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold sm:flex ${
            user.role === "OWNER"
              ? "bg-melon-100 text-melon-800"
              : "bg-ink/10 text-ink/60"
          }`}
        >
          {user.role === "OWNER" ? (
            <Crown className="h-3 w-3" />
          ) : (
            <User className="h-3 w-3" />
          )}
          {user.role}
        </span>
        <button
          type="button"
          onClick={onLogout}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink/10 bg-white/80 text-ink/60 transition hover:bg-white hover:text-ink"
          aria-label="Log out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
