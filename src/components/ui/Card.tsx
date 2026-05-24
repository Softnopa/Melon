import { cn } from "@/lib/cn";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/60 bg-white/80 p-4 shadow-soft backdrop-blur-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
