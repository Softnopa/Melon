import { cn } from "@/lib/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

const variants = {
  primary:
    "bg-melon-600 text-white shadow-md hover:bg-melon-700 active:scale-[0.98]",
  secondary:
    "bg-white/90 text-ink border border-ink/10 shadow-sm hover:bg-white active:scale-[0.98]",
  ghost: "bg-transparent text-ink/70 hover:bg-ink/5",
  danger: "bg-red-500 text-white hover:bg-red-600 active:scale-[0.98]",
};

const sizes = {
  sm: "px-3 py-2 text-sm rounded-lg",
  md: "px-4 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3.5 text-base rounded-xl font-semibold w-full",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
