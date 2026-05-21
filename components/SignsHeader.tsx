// Slimme witte headerbalk met tekstlogo. Mo vervangt "SIGNS" later
// door de echte logo-SVG.
export function SignsHeader({ subtitle }: { subtitle?: string }) {
  return (
    <header className="border-b border-brand-border bg-white">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <span className="font-display text-2xl font-bold tracking-tight-2 text-ink">
          SIGNS
        </span>
        {subtitle && (
          <span className="text-sm text-body">{subtitle}</span>
        )}
      </div>
    </header>
  );
}
