import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { euro, nlDatum, offerteBedragen } from "@/lib/format";

export default async function OffertePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const aanvraag = await prisma.aanvraag.findUnique({
    where: { token },
    include: { ramen: true },
  });

  if (!aanvraag) notFound();

  const klantprijs = aanvraag.klantprijs ?? 0;
  const { subtotaal, btw, totaal } = offerteBedragen(klantprijs);
  const geldigTot = new Date(aanvraag.createdAt);
  geldigTot.setDate(geldigTot.getDate() + 14);

  return (
    <main className="mx-auto flex w-full max-w-[600px] flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">Uw raamfolie offerte</h1>
        <p className="text-sm text-muted-foreground">
          Voor {aanvraag.voornaam} {aanvraag.achternaam}
        </p>
      </header>

      {aanvraag.acceptedAt ? (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">
          U heeft deze offerte op {nlDatum(new Date(aanvraag.acceptedAt))}{" "}
          geaccepteerd. We nemen contact op voor het inplannen.
        </div>
      ) : aanvraag.rejectedAt ? (
        <div className="rounded-xl border border-muted bg-muted/40 p-4 text-sm text-muted-foreground">
          Deze offerte is op {nlDatum(new Date(aanvraag.rejectedAt))} afgewezen.
        </div>
      ) : null}

      <section className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="p-3 font-medium">Raam</th>
              <th className="p-3 font-medium">Afmeting</th>
              <th className="p-3 text-right font-medium">m²</th>
            </tr>
          </thead>
          <tbody>
            {aanvraag.ramen.map((raam, index) => {
              const breedteCm = Math.round(raam.breedteM * 100);
              const hoogteCm = Math.round(raam.hoogteM * 100);
              const m2 = raam.breedteM * raam.hoogteM;
              return (
                <tr key={raam.id} className="border-b last:border-b-0">
                  <td className="p-3">{raam.naam || `Raam ${index + 1}`}</td>
                  <td className="p-3">
                    {breedteCm}×{hoogteCm} cm
                  </td>
                  <td className="p-3 text-right tabular-nums">
                    {m2.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="flex flex-col gap-1.5 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotaal (excl. btw)</span>
          <span className="tabular-nums">{euro(subtotaal)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Btw 21%</span>
          <span className="tabular-nums">{euro(btw)}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Totaal incl. btw</span>
          <span className="tabular-nums">{euro(totaal)}</span>
        </div>
      </section>

      <p className="text-xs text-muted-foreground">
        Geldig tot {nlDatum(geldigTot)}.
      </p>

      {!aanvraag.acceptedAt && !aanvraag.rejectedAt && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <form
            method="POST"
            action={`/api/offerte/${aanvraag.token}/accept`}
            className="flex-1"
          >
            <button
              type="submit"
              className="w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
            >
              Offerte accepteren
            </button>
          </form>
          <form
            method="POST"
            action={`/api/offerte/${aanvraag.token}/reject`}
            className="flex-1"
          >
            <button
              type="submit"
              className="w-full rounded-md border px-4 py-3 text-sm font-semibold"
            >
              Niet akkoord
            </button>
          </form>
        </div>
      )}

      <footer className="border-t pt-4 text-xs text-muted-foreground">
        Signs.nl — Spaarneweg 14, Cruquius
        <br />
        020-3242202 — signs.nl
      </footer>
    </main>
  );
}
