import { cn } from "@/lib/utils";

const STAPPEN = ["Doel", "Ramen", "Offerte", "Gegevens"];

export function StepIndicator({ huidigeStap }: { huidigeStap: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {STAPPEN.map((label, index) => {
        const nummer = index + 1;
        const actief = nummer === huidigeStap;
        return (
          <span
            key={label}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
              actief
                ? "bg-accent-dark text-white"
                : "bg-surface-2 text-meta",
            )}
          >
            {nummer}. {label}
          </span>
        );
      })}
    </div>
  );
}
