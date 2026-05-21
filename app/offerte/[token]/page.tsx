import { notFound } from "next/navigation";
import { SignsHeader } from "@/components/SignsHeader";
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

  const beslist = aanvraag.acceptedAt || aanvraag.rejectedAt;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SignsHeader subtitle="Je offerte van Signs.nl" />

      <main className="mx-auto flex w-full max-w-[640px] flex-col gap-8 px-4 py-10 md:py-14">
        <header className="flex flex-col gap-2">
          <span className="text-[11px] font-medium tracking-widest text-meta uppercase">
            Offerte
          </span>
          <h1 className="font-display text-[2rem] leading-[1.1] font-semibold text-ink md:text-[2.5rem]">
            Je raamfolie offerte
          </h1>
          <p className="text-base text-body">
            Voor {aanvraag.voornaam} {aanvraag.achternaam}
          </p>
        </header>

        {aanvraag.acceptedAt ? (
          <div className="rounded-brand border border-accent-dark/30 bg-surface-2 p-5 text-sm text-accent-dark">
            Je hebt deze offerte op {nlDatum(new Date(aanvraag.acceptedAt))}{" "}
            geaccepteerd. We nemen contact met je op om in te plannen.
          </div>
        ) : aanvraag.rejectedAt ? (
          <div className="rounded-brand border border-brand-border bg-surface-2 p-5 text-sm text-body">
            Deze offerte is op {nlDatum(new Date(aanvraag.rejectedAt))}{" "}
            afgewezen.
          </div>
        ) : null}

        <section className="flex flex-col gap-6 rounded-brand-lg border border-brand-border bg-white p-6 md:p-8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border text-left text-xs text-meta">
                  <th className="pb-3 font-medium">Raam</th>
                  <th className="pb-3 font-medium">Afmeting</th>
                  <th className="pb-3 text-right font-medium">m²</th>
                </tr>
              </thead>
              <tbody>
                {aanvraag.ramen.map((raam, index) => {
                  const breedteCm = Math.round(raam.breedteM * 100);
                  const hoogteCm = Math.round(raam.hoogteM * 100);
                  const m2 = raam.breedteM * raam.hoogteM;
                  return (
                    <tr
                      key={raam.id}
                      className="border-b border-brand-border last:border-b-0"
                    >
                      <td className="py-3 text-ink">
                        {raam.naam || `Raam ${index + 1}`}
                      </td>
                      <td className="py-3 text-body">
                        {breedteCm}×{hoogteCm} cm
                      </td>
                      <td className="py-3 text-right tabular-nums text-body">
                        {m2.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between text-sm text-body">
              <span>Subtotaal (excl. btw)</span>
              <span className="tabular-nums">{euro(subtotaal)}</span>
            </div>
            <div className="flex justify-between text-sm text-body">
              <span>Btw 21%</span>
              <span className="tabular-nums">{euro(btw)}</span>
            </div>
            <div className="flex items-baseline justify-between border-t border-brand-border pt-3">
              <span className="font-display text-base font-semibold text-ink">
                Totaal incl. btw
              </span>
              <span className="font-display text-3xl font-semibold tracking-tight-2 tabular-nums text-ink">
                {euro(totaal)}
              </span>
            </div>
          </div>

          <p className="text-xs text-meta">Geldig tot {nlDatum(geldigTot)}.</p>
        </section>

        {!beslist && (
          <div className="flex flex-col gap-3 sm:flex-row">
            <form
              method="POST"
              action={`/api/offerte/${aanvraag.token}/accept`}
              className="flex-1"
            >
              <button
                type="submit"
                className="w-full rounded-full bg-ink px-7 py-3.5 font-display font-semibold text-white transition hover:opacity-90"
              >
                Accepteer offerte
              </button>
            </form>
            <form
              method="POST"
              action={`/api/offerte/${aanvraag.token}/reject`}
              className="flex-1"
            >
              <button
                type="submit"
                className="w-full rounded-full border-2 border-ink px-7 py-3.5 font-display font-semibold text-ink transition hover:bg-ink hover:text-white"
              >
                Niet doorgaan
              </button>
            </form>
          </div>
        )}

        <footer className="border-t border-brand-border pt-6 text-xs leading-relaxed text-meta">
          Signs.nl — Spaarneweg 14, 2142 EN Cruquius
          <br />
          020-324 22 02 — signs.nl
        </footer>
      </main>
    </div>
  );
}
