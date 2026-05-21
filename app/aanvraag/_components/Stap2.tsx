"use client";

import { useRef } from "react";
import { Minus, Plus, Camera, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepIndicator } from "./StepIndicator";
import type { IntakeData, Raam } from "./types";

const MIN_RAMEN = 1;
const MAX_RAMEN = 20;

function leegRaam(): Raam {
  return { breedte: 0, hoogte: 0 };
}

function RaamKaart({
  index,
  raam,
  onWijzig,
}: {
  index: number;
  raam: Raam;
  onWijzig: (wijziging: Partial<Raam>) => void;
}) {
  const fotoInput = useRef<HTMLInputElement>(null);

  return (
    <Card variant="white" size="sm">
      <p className="font-display text-sm font-semibold text-ink">
        Raam {index + 1}
      </p>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`naam-${index}`} className="text-sm font-medium text-ink">
          Naam (optioneel)
        </Label>
        <Input
          id={`naam-${index}`}
          placeholder="bijv. woonkamer voor"
          value={raam.naam ?? ""}
          onChange={(e) => onWijzig({ naam: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor={`breedte-${index}`}
            className="text-sm font-medium text-ink"
          >
            Breedte (cm)
          </Label>
          <Input
            id={`breedte-${index}`}
            type="number"
            inputMode="numeric"
            min={0}
            value={raam.breedte || ""}
            onChange={(e) => onWijzig({ breedte: Number(e.target.value) })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor={`hoogte-${index}`}
            className="text-sm font-medium text-ink"
          >
            Hoogte (cm)
          </Label>
          <Input
            id={`hoogte-${index}`}
            type="number"
            inputMode="numeric"
            min={0}
            value={raam.hoogte || ""}
            onChange={(e) => onWijzig({ hoogte: Number(e.target.value) })}
          />
        </div>
      </div>

      <input
        ref={fotoInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onWijzig({ foto: e.target.files?.[0] })}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => fotoInput.current?.click()}
      >
        {raam.foto ? (
          <>
            <Check className="text-accent-dark" />
            {raam.foto.name}
          </>
        ) : (
          <>
            <Camera />
            Foto toevoegen
          </>
        )}
      </Button>
    </Card>
  );
}

export function Stap2({
  data,
  update,
  onVolgende,
  onVorige,
}: {
  data: IntakeData;
  update: (wijziging: Partial<IntakeData>) => void;
  onVolgende: () => void;
  onVorige: () => void;
}) {
  const ramen = data.ramen;

  function zetAantal(nieuwAantal: number) {
    const doel = Math.min(MAX_RAMEN, Math.max(MIN_RAMEN, nieuwAantal));
    if (doel === ramen.length) return;
    if (doel > ramen.length) {
      update({
        ramen: [
          ...ramen,
          ...Array.from({ length: doel - ramen.length }, leegRaam),
        ],
      });
    } else {
      update({ ramen: ramen.slice(0, doel) });
    }
  }

  function wijzigRaam(index: number, wijziging: Partial<Raam>) {
    update({
      ramen: ramen.map((r, i) => (i === index ? { ...r, ...wijziging } : r)),
    });
  }

  const kanVerder = ramen.every((r) => r.breedte > 0 && r.hoogte > 0);

  return (
    <div className="flex flex-col gap-7">
      <StepIndicator huidigeStap={2} />

      <header className="flex flex-col gap-1.5">
        <h2 className="font-display text-2xl font-semibold tracking-tight-2 text-ink">
          Welke ramen?
        </h2>
        <p className="text-sm text-body">Vul de afmetingen per raam in.</p>
      </header>

      <div className="flex items-center justify-between rounded-brand bg-surface-2 p-5">
        <span className="font-display text-sm font-semibold text-ink">
          Aantal ramen
        </span>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Eén raam minder"
            disabled={ramen.length <= MIN_RAMEN}
            onClick={() => zetAantal(ramen.length - 1)}
          >
            <Minus />
          </Button>
          <span className="w-6 text-center font-display text-base font-semibold tabular-nums text-ink">
            {ramen.length}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Eén raam meer"
            disabled={ramen.length >= MAX_RAMEN}
            onClick={() => zetAantal(ramen.length + 1)}
          >
            <Plus />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {ramen.map((raam, index) => (
          <RaamKaart
            key={index}
            index={index}
            raam={raam}
            onWijzig={(wijziging) => wijzigRaam(index, wijziging)}
          />
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={ramen.length >= MAX_RAMEN}
        onClick={() => zetAantal(ramen.length + 1)}
      >
        <Plus />
        Voeg raam toe
      </Button>

      <div className="flex flex-col gap-2 rounded-brand bg-surface-2 p-5">
        <label htmlFor="hoge-ramen" className="flex items-start gap-3">
          <Checkbox
            id="hoge-ramen"
            className="mt-0.5"
            checked={data.hogeRamen}
            onCheckedChange={(staat) => update({ hogeRamen: staat === true })}
          />
          <span className="text-sm leading-snug text-ink">
            Heeft één van de ramen een bovenkant hoger dan 2,5 meter vanaf de
            vloer?
          </span>
        </label>
        <p className="pl-7 text-xs text-body">
          Bijvoorbeeld bij een hoog plafond of bovenraam. We komen dan met
          ladder of steiger.
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onVorige}>
          Vorige
        </Button>
        <Button className="flex-1" disabled={!kanVerder} onClick={onVolgende}>
          Volgende stap
        </Button>
      </div>
    </div>
  );
}
