import { SignsHeader } from "@/components/SignsHeader";
import { prisma } from "@/lib/prisma";

export default async function BedanktPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  const aanvraag = id
    ? await prisma.aanvraag.findUnique({
        where: { id },
        include: { ramen: true },
      })
    : null;

  const voornaam = aanvraag?.voornaam ?? null;
  const verzonden = aanvraag?.status === "verzonden";

  const ondersteuning = !aanvraag
    ? "We nemen binnen 1 werkdag contact met je op."
    : verzonden
      ? `Je offerte staat in je inbox — kijk even bij ${aanvraag.email}.`
      : "We nemen binnen 1 werkdag contact met je op.";

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SignsHeader />
      <main className="mx-auto flex w-full max-w-[560px] flex-1 flex-col items-center justify-center gap-8 px-4 py-16 text-center">
        <div className="flex flex-col gap-4">
          <h1 className="font-display text-[2.25rem] leading-[1.05] font-semibold text-ink md:text-[3rem]">
            {voornaam ? `Bedankt, ${voornaam}!` : "Bedankt!"}
          </h1>
          <p className="text-base text-body">{ondersteuning}</p>
        </div>

        {aanvraag && (
          <div className="flex w-full flex-col gap-3 rounded-brand-lg bg-surface-2 p-8 text-left">
            <p className="font-display text-sm font-semibold text-ink">
              Dit hebben we ontvangen
            </p>
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-body">Aantal ramen</dt>
                <dd className="text-ink">{aanvraag.ramen.length}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-body">Klanttype</dt>
                <dd className="text-ink capitalize">{aanvraag.klanttype}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-body">Hoge ramen</dt>
                <dd className="text-ink">
                  {aanvraag.hogeRamen ? "ja" : "nee"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-body">Kenmerk</dt>
                <dd className="text-ink">{aanvraag.id}</dd>
              </div>
            </dl>
          </div>
        )}

        <a
          href="https://www.signs.nl"
          className="text-sm text-link underline underline-offset-2 hover:text-link-hover"
        >
          ← Terug naar Signs.nl
        </a>
      </main>
    </div>
  );
}
