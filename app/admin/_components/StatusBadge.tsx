import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; klasse: string }> = {
  nieuw: { label: "Nieuw", klasse: "bg-blue-100 text-blue-700" },
  review: { label: "Review", klasse: "bg-amber-100 text-amber-800" },
  verzonden: { label: "Verzonden", klasse: "bg-teal-100 text-teal-700" },
  geaccepteerd: { label: "Geaccepteerd", klasse: "bg-green-100 text-green-700" },
  afgewezen: { label: "Afgewezen", klasse: "bg-gray-100 text-gray-600" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? {
    label: status,
    klasse: "bg-gray-100 text-gray-600",
  };
  return (
    <Badge className={cn("border-transparent", config.klasse)}>
      {config.label}
    </Badge>
  );
}
