"use client";

import { useState } from "react";
import { Home, Building2, EyeOff, Sun, Star, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepIndicator } from "./StepIndicator";
import { TapCard } from "./TapCard";
import { POSTCODE_REGEX, type Doel, type IntakeData, type Klanttype } from "./types";

export function Stap1({
  data,
  update,
  onVolgende,
}: {
  data: IntakeData;
  update: (wijziging: Partial<IntakeData>) => void;
  onVolgende: () => void;
}) {
  const [postcodeFout, setPostcodeFout] = useState(false);

  const postcodeGeldig = POSTCODE_REGEX.test(data.postcode.trim());
  const kanVerder = data.klanttype !== null && data.doel !== null && postcodeGeldig;

  const klanttypes: { waarde: Klanttype; label: string; icon: typeof Home }[] = [
    { waarde: "particulier", label: "Particulier", icon: Home },
    { waarde: "zakelijk", label: "Zakelijk", icon: Building2 },
  ];

  const doelen: { waarde: Doel; label: string; icon: typeof Home }[] = [
    { waarde: "privacy", label: "Privacy", icon: EyeOff },
    { waarde: "zonwering", label: "Zonwering", icon: Sun },
    { waarde: "decoratief", label: "Decoratief", icon: Star },
    { waarde: "anders", label: "Iets anders", icon: MoreHorizontal },
  ];

  return (
    <div className="flex flex-col gap-7">
      <StepIndicator huidigeStap={1} />

      <span className="w-fit rounded-full bg-surface-2 px-3.5 py-1.5 text-xs font-medium text-accent-dark">
        Binnen 1 uur tijdens kantooruren
      </span>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-base font-semibold text-ink">
          Voor wie?
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {klanttypes.map((k) => (
            <TapCard
              key={k.waarde}
              icon={k.icon}
              label={k.label}
              geselecteerd={data.klanttype === k.waarde}
              onClick={() => update({ klanttype: k.waarde })}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-base font-semibold text-ink">
          Wat wil je bereiken?
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {doelen.map((d) => (
            <TapCard
              key={d.waarde}
              icon={d.icon}
              label={d.label}
              geselecteerd={data.doel === d.waarde}
              onClick={() => update({ doel: d.waarde })}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <Label htmlFor="postcode" className="text-sm font-medium text-ink">
          Postcode
        </Label>
        <Input
          id="postcode"
          inputMode="text"
          placeholder="1234 AB"
          value={data.postcode}
          aria-invalid={postcodeFout}
          onChange={(e) => {
            update({ postcode: e.target.value });
            if (postcodeFout) setPostcodeFout(false);
          }}
          onBlur={() =>
            setPostcodeFout(
              data.postcode.trim().length > 0 &&
                !POSTCODE_REGEX.test(data.postcode.trim()),
            )
          }
        />
        {postcodeFout && (
          <p className="text-xs text-destructive">
            Vul een geldige postcode in, bijvoorbeeld 1234 AB.
          </p>
        )}
      </section>

      <Button
        size="lg"
        className="w-full"
        disabled={!kanVerder}
        onClick={onVolgende}
      >
        Volgende stap
      </Button>
    </div>
  );
}
