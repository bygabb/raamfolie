import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function TapCard({
  icon: Icon,
  label,
  geselecteerd,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  geselecteerd: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={geselecteerd}
      className={cn(
        "flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2.5 rounded-brand border-2 bg-surface-2 p-6 text-center transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink",
        geselecteerd
          ? "border-ink"
          : "border-transparent hover:-translate-y-0.5 hover:shadow-sm",
      )}
    >
      <Icon
        className={cn("size-7", geselecteerd ? "text-ink" : "text-body")}
      />
      <span className="font-display text-sm font-semibold text-ink">
        {label}
      </span>
    </button>
  );
}
