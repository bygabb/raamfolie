import { cn } from "@/lib/utils";

export function StepIndicator({ huidigeStap }: { huidigeStap: number }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((stap) => (
          <span
            key={stap}
            className={cn(
              "size-2 rounded-full transition-colors",
              stap <= huidigeStap ? "bg-primary" : "bg-muted-foreground/25",
            )}
          />
        ))}
      </div>
      <p className="text-xs font-medium text-muted-foreground">
        Stap {huidigeStap} van 4
      </p>
    </div>
  );
}
