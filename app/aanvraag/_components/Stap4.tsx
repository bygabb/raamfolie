"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StepIndicator } from "./StepIndicator";
import {
  EMAIL_REGEX,
  isGeldigeTelefoon,
  type Contactvoorkeur,
  type IntakeData,
} from "./types";

export function Stap4({
  data,
  update,
  onVerstuur,
  onVorige,
}: {
  data: IntakeData;
  update: (wijziging: Partial<IntakeData>) => void;
  onVerstuur: () => void;
  onVorige: () => void;
}) {
  const [emailFout, setEmailFout] = useState(false);
  const [telefoonFout, setTelefoonFout] = useState(false);

  const emailGeldig = EMAIL_REGEX.test(data.email.trim());
  const telefoonGeldig = isGeldigeTelefoon(data.telefoon);

  const kanVersturen =
    data.voornaam.trim() !== "" &&
    data.achternaam.trim() !== "" &&
    emailGeldig &&
    telefoonGeldig &&
    data.straat.trim() !== "" &&
    data.huisnummer.trim() !== "" &&
    data.contactvoorkeur !== null &&
    data.privacyAkkoord;

  return (
    <div className="flex flex-col gap-6">
      <StepIndicator huidigeStap={4} />

      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">Uw gegevens</h1>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="voornaam">Voornaam</Label>
          <Input
            id="voornaam"
            autoComplete="given-name"
            value={data.voornaam}
            onChange={(e) => update({ voornaam: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="achternaam">Achternaam</Label>
          <Input
            id="achternaam"
            autoComplete="family-name"
            value={data.achternaam}
            onChange={(e) => update({ achternaam: e.target.value })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-mailadres</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          aria-invalid={emailFout}
          value={data.email}
          onChange={(e) => {
            update({ email: e.target.value });
            if (emailFout) setEmailFout(false);
          }}
          onBlur={() =>
            setEmailFout(
              data.email.trim().length > 0 &&
                !EMAIL_REGEX.test(data.email.trim()),
            )
          }
        />
        {emailFout && (
          <p className="text-xs text-destructive">
            Vul een geldig e-mailadres in.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="telefoon">Telefoonnummer</Label>
        <Input
          id="telefoon"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="06 12345678"
          aria-invalid={telefoonFout}
          value={data.telefoon}
          onChange={(e) => {
            update({ telefoon: e.target.value });
            if (telefoonFout) setTelefoonFout(false);
          }}
          onBlur={() =>
            setTelefoonFout(
              data.telefoon.trim().length > 0 &&
                !isGeldigeTelefoon(data.telefoon),
            )
          }
        />
        {telefoonFout && (
          <p className="text-xs text-destructive">
            Vul een geldig telefoonnummer in, bijvoorbeeld 06 12345678.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="straat">Straat</Label>
          <Input
            id="straat"
            autoComplete="address-line1"
            value={data.straat}
            onChange={(e) => update({ straat: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="huisnummer">Huisnummer</Label>
          <Input
            id="huisnummer"
            value={data.huisnummer}
            onChange={(e) => update({ huisnummer: e.target.value })}
          />
        </div>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">
          Hoe wilt u uw offerte ontvangen?
        </h2>
        <RadioGroup
          value={data.contactvoorkeur ?? ""}
          onValueChange={(waarde) =>
            update({ contactvoorkeur: waarde as Contactvoorkeur })
          }
        >
          <label
            htmlFor="voorkeur-whatsapp"
            className="flex items-center gap-3 rounded-lg border p-3"
          >
            <RadioGroupItem value="whatsapp" id="voorkeur-whatsapp" />
            <span className="text-sm">WhatsApp</span>
          </label>
          <label
            htmlFor="voorkeur-email"
            className="flex items-center gap-3 rounded-lg border p-3"
          >
            <RadioGroupItem value="email" id="voorkeur-email" />
            <span className="text-sm">E-mail</span>
          </label>
        </RadioGroup>
      </section>

      <label className="flex items-start gap-3">
        <Checkbox
          id="privacy"
          className="mt-0.5"
          checked={data.privacyAkkoord}
          onCheckedChange={(staat) =>
            update({ privacyAkkoord: staat === true })
          }
        />
        <span className="text-sm leading-snug">
          Ik ga akkoord met de{" "}
          <a href="#" className="underline underline-offset-2">
            privacyverklaring
          </a>
          .
        </span>
      </label>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onVorige}>
          Vorige
        </Button>
        <Button
          className="flex-1"
          disabled={!kanVersturen}
          onClick={onVerstuur}
        >
          Verstuur aanvraag
        </Button>
      </div>
    </div>
  );
}
