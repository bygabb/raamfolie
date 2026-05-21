import { prisma } from "@/lib/prisma";

export default async function BedanktPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  const aanvraag = id
    ? await prisma.aanvraag.findUnique({ where: { id } })
    : null;

  const vervolgtekst = !aanvraag
    ? "Binnen 1 uur tijdens kantooruren ontvangt u uw offerte."
    : aanvraag.contactvoorkeur === "whatsapp"
      ? "Binnen 1 uur tijdens kantooruren neemt onze collega telefonisch contact met u op."
      : `Binnen 1 uur tijdens kantooruren ontvangt u uw offerte op ${aanvraag.email}.`;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col items-center justify-center gap-4 px-4 py-8 text-center">
      <h1 className="text-2xl font-semibold">Bedankt!</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Wij hebben uw aanvraag goed ontvangen
        {aanvraag ? ` onder kenmerk ${aanvraag.id}` : ""}. {vervolgtekst}
      </p>
      <a
        href="https://www.signs.nl"
        className="text-xs text-muted-foreground underline underline-offset-2"
      >
        ← Terug naar Signs.nl
      </a>
    </main>
  );
}
