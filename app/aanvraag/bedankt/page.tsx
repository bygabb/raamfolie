export default function BedanktPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col items-center justify-center gap-4 px-4 py-8 text-center">
      <h1 className="text-2xl font-semibold">Bedankt!</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Uw aanvraag is binnen. Wij sturen uw offerte binnen 1 uur tijdens
        kantooruren.
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
