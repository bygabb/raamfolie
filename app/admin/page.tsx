import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { euro, nlDatumTijd, relatieveTijd } from "@/lib/format";
import { StatusBadge } from "./_components/StatusBadge";

const STATUS_PILLS = [
  { waarde: "alle", label: "Alle" },
  { waarde: "nieuw", label: "Nieuw" },
  { waarde: "review", label: "Review" },
  { waarde: "verzonden", label: "Verzonden" },
  { waarde: "geaccepteerd", label: "Geaccepteerd" },
  { waarde: "afgewezen", label: "Afgewezen" },
] as const;

function startVanVandaag(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startVanWeek(): Date {
  const d = startVanVandaag();
  // Maandag als eerste dag van de week.
  const dag = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dag);
  return d;
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const actiefFilter = STATUS_PILLS.some((p) => p.waarde === status)
    ? status!
    : "alle";

  const [
    vandaagAantal,
    weekAantal,
    perStatus,
    verzondenAantal,
    geaccepteerdAantal,
    gemiddelde,
    aanvragen,
  ] = await Promise.all([
    prisma.aanvraag.count({ where: { createdAt: { gte: startVanVandaag() } } }),
    prisma.aanvraag.count({ where: { createdAt: { gte: startVanWeek() } } }),
    prisma.aanvraag.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.aanvraag.count({ where: { emailSentAt: { not: null } } }),
    prisma.aanvraag.count({ where: { acceptedAt: { not: null } } }),
    prisma.aanvraag.aggregate({
      _avg: { klantprijs: true },
      where: { emailSentAt: { not: null } },
    }),
    prisma.aanvraag.findMany({
      where: actiefFilter === "alle" ? undefined : { status: actiefFilter },
      orderBy: { createdAt: "desc" },
      include: { ramen: true },
    }),
  ]);

  const aantalPerStatus = new Map(
    perStatus.map((r) => [r.status, r._count._all]),
  );
  const totaalAantal = perStatus.reduce((som, r) => som + r._count._all, 0);

  const acceptatieRatio =
    verzondenAantal > 0
      ? Math.round((geaccepteerdAantal / verzondenAantal) * 100)
      : 0;
  const gemOfferte = gemiddelde._avg.klantprijs;

  const metrics = [
    { label: "Vandaag binnen", waarde: String(vandaagAantal) },
    { label: "Deze week", waarde: String(weekAantal) },
    { label: "Acceptatie ratio", waarde: `${acceptatieRatio}%` },
    {
      label: "Gem. offerte",
      waarde: gemOfferte != null ? euro(gemOfferte) : "—",
    },
  ];

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Aanvragen</h1>
        <form method="POST" action="/api/admin/logout">
          <button
            type="submit"
            className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent"
          >
            Uitloggen
          </button>
        </form>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">{m.label}</p>
            <p className="mt-1 text-xl font-semibold">{m.waarde}</p>
          </div>
        ))}
      </section>

      <nav className="flex flex-wrap gap-2">
        {STATUS_PILLS.map((pill) => {
          const aantal =
            pill.waarde === "alle"
              ? totaalAantal
              : (aantalPerStatus.get(pill.waarde) ?? 0);
          const actief = pill.waarde === actiefFilter;
          return (
            <Link
              key={pill.waarde}
              href={pill.waarde === "alle" ? "/admin" : `/admin?status=${pill.waarde}`}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                actief
                  ? "border-primary bg-primary/10 font-medium text-primary"
                  : "hover:bg-accent",
              )}
            >
              {pill.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs",
                  actief ? "bg-primary/15" : "bg-muted text-muted-foreground",
                )}
              >
                {aantal}
              </span>
            </Link>
          );
        })}
      </nav>

      {aanvragen.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Nog geen aanvragen binnen. Tijd om de flyers te verspreiden!
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Klant</TableHead>
                <TableHead>Plaats</TableHead>
                <TableHead>Ramen</TableHead>
                <TableHead>Bedrag</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actie</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aanvragen.map((a) => {
                const m2 = a.ramen.reduce(
                  (som, r) => som + r.breedteM * r.hoogteM,
                  0,
                );
                return (
                  <TableRow key={a.id}>
                    <TableCell
                      className="whitespace-nowrap text-muted-foreground"
                      title={nlDatumTijd(new Date(a.createdAt))}
                    >
                      {relatieveTijd(new Date(a.createdAt))}
                    </TableCell>
                    <TableCell className="font-medium">
                      {a.voornaam} {a.achternaam}
                    </TableCell>
                    <TableCell>{a.postcode}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {a.ramen.length} · {m2.toFixed(2)} m²
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {a.klantprijs != null ? euro(a.klantprijs) : "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={a.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/admin/aanvraag/${a.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Bekijken
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </main>
  );
}
