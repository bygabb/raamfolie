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
    <div className="flex flex-col gap-6">
      <StepIndicator huidigeStap={3} />

      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">Uw offerte ligt klaar</h1>
      </header>

      <p className="text-sm leading-relaxed text-muted-foreground">
        Wij hebben uw offerte voor {aantal} {aantal === 1 ? "raam" : "ramen"}{" "}
        klaarstaan. Laat ons weten waar we &apos;m naartoe sturen, dan ontvangt
        u &apos;m binnen 1 uur tijdens kantooruren.
      </p>

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
