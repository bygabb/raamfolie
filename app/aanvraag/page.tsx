import { SignsHeader } from "@/components/SignsHeader";
import { IntakeWizard } from "./_components/IntakeWizard";

export default function AanvraagPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SignsHeader />
      <div className="mx-auto w-full max-w-[560px] px-4 py-10 md:py-14">
        <div className="flex flex-col gap-3">
          <span className="text-[11px] font-medium tracking-widest text-meta uppercase">
            Offerte aanvragen
          </span>
          <h1 className="font-display text-[2rem] leading-[1.08] font-semibold text-ink md:text-[2.75rem]">
            Raamfolie op maat — binnen 1 minuut een prijs.
          </h1>
        </div>
        <div className="mt-9">
          <IntakeWizard />
        </div>
      </div>
    </div>
  );
}
