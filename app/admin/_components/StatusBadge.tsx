import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; klasse: string }> = {
  nieuw: { label: "Nieuw", klasse: "bg-link/10 text-link" },
  review: { label: "Review", klasse: "bg-amber-100 text-amber-900" },
  verzonden: { label: "Verzonden", klasse: "bg-accent-dark/10 text-accent-dark" },
  geaccepteerd: { label: "Geaccepteerd", klasse: "bg-green-100 text-green-700" },
  afgewezen: { label: "Afgewezen", klasse: "bg-meta/15 text-meta" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? {
    label: status,
    klasse: "bg-meta/15 text-meta",
  };
  return (
    <Badge className={cn("border-transparent", config.klasse)}>
      {config.label}
    </Badge>
  );
}
