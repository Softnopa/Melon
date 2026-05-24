"use client";

import { motion } from "framer-motion";
import { PlusCircle, Users, History, BarChart3 } from "lucide-react";
import type { TabId, Role } from "@/lib/types";
import { cn } from "@/lib/cn";

const tabs: { id: TabId; label: string; icon: typeof PlusCircle }[] = [
  { id: "add", label: "Add", icon: PlusCircle },
  { id: "customers", label: "Customers", icon: Users },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "history", label: "History", icon: History },
];

export function BottomNav({
  active,
  onChange,
  role,
}: {
  active: TabId;
  onChange: (tab: TabId) => void;
  role: Role;
}) {
  return (
    <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-40 border-t border-white/50 bg-white/90 px-1 pb-2 pt-2 shadow-[0_-8px_32px_-8px_rgba(26,31,22,0.1)] backdrop-blur-lg sm:mx-auto sm:max-w-lg sm:rounded-t-2xl sm:border-x">
      <div className="flex items-stretch justify-around gap-0.5">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 transition-colors",
                isActive ? "text-melon-700" : "text-ink/40 hover:text-ink/60"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-pill"
                  className="absolute inset-1 rounded-xl bg-melon-100/80"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <span className="relative z-10">
                <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              </span>
              <span
                className={cn(
                  "relative z-10 text-[9px] font-semibold sm:text-[10px]",
                  isActive && "text-melon-800"
                )}
              >
                {label}
              </span>
              {id === "reports" && role === "WORKER" && (
                <span className="absolute right-2 top-1 z-20 h-1.5 w-1.5 rounded-full bg-ink/20" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
