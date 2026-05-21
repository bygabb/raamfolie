"use client";

import { Button } from "@/components/ui/button";
import { StepIndicator } from "./StepIndicator";
import type { IntakeData } from "./types";

export function Stap3({
  data,
  onVolgende,
  onVorige,
}: {
  data: IntakeData;
  onVolgende: () => void;
  onVorige: () => void;
}) {
  const aantal = data.ramen.length;

  return (
    <div className="flex flex-col gap-7">
      <StepIndicator huidigeStap={3} />

      <header className="flex flex-col gap-1">
        <h2 className="font-display text-2xl font-semibold tracking-tight-2 text-ink">
          Je offerte ligt klaar
        </h2>
      </header>

      <div className="rounded-brand bg-surface-2 p-6">
        <p className="text-sm leading-relaxed text-body">
          We hebben je offerte voor {aantal} {aantal === 1 ? "raam" : "ramen"}{" "}
          klaarstaan. Laat ons weten waar we &apos;m naartoe sturen, dan
          ontvang je &apos;m binnen 1 uur tijdens kantooruren.
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onVorige}>
          Vorige
        </Button>
        <Button className="flex-1" onClick={onVolgende}>
          Naar mijn gegevens
        </Button>
      </div>
    </div>
  );
}
