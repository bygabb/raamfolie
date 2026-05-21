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
        "flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 text-center transition-colors",
        "min-h-24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        geselecteerd
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:bg-accent",
      )}
    >
      <Icon
        className={cn(
          "size-6",
          geselecteerd ? "text-primary" : "text-muted-foreground",
        )}
      />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
