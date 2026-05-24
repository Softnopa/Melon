import { cn } from "@/lib/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function Input({ label, hint, className, id, ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label htmlFor={inputId} className="block space-y-1.5">
      <span className="text-sm font-medium text-ink/80">{label}</span>
      <input
        id={inputId}
        className={cn(
          "w-full rounded-xl border border-ink/10 bg-white/90 px-4 py-3 text-base text-ink shadow-sm transition-all",
          "placeholder:text-ink/30 focus:border-melon-500 focus:outline-none focus:ring-2 focus:ring-melon-500/20",
          className
        )}
        {...props}
      />
      {hint && <span className="text-xs text-ink/45">{hint}</span>}
    </label>
  );
}
