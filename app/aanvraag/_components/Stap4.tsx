"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StepIndicator } from "./StepIndicator";
import type { VerstuurFout } from "./IntakeWizard";
import {
  EMAIL_REGEX,
  isGeldigeTelefoon,
  type Contactvoorkeur,
  type IntakeData,
} from "./types";

const labelKlasse = "text-sm font-medium text-ink";

export function Stap4({
  data,
  update,
  onVerstuur,
  onVorige,
  onTerugNaarPostcode,
  bezig,
  fout,
}: {
  data: IntakeData;
  update: (wijziging: Partial<IntakeData>) => void;
  onVerstuur: () => void;
  onVorige: () => void;
  onTerugNaarPostcode: () => void;
  bezig: boolean;
  fout: VerstuurFout;
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
    <div className="flex flex-col gap-7">
      <StepIndicator huidigeStap={4} />

      <header className="flex flex-col gap-1">
        <h2 className="font-display text-2xl font-semibold tracking-tight-2 text-ink">
          Je gegevens
        </h2>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="voornaam" className={labelKlasse}>
            Je voornaam
          </Label>
          <Input
            id="voornaam"
            autoComplete="given-name"
            value={data.voornaam}
            onChange={(e) => update({ voornaam: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="achternaam" className={labelKlasse}>
            Je achternaam
          </Label>
          <Input
            id="achternaam"
            autoComplete="family-name"
            value={data.achternaam}
            onChange={(e) => update({ achternaam: e.target.value })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email" className={labelKlasse}>
          Je e-mailadres
        </Label>
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
        <Label htmlFor="telefoon" className={labelKlasse}>
          Je telefoonnummer
        </Label>
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
          <Label htmlFor="straat" className={labelKlasse}>
            Straat
          </Label>
          <Input
            id="straat"
            autoComplete="address-line1"
            value={data.straat}
            onChange={(e) => update({ straat: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="huisnummer" className={labelKlasse}>
            Huisnummer
          </Label>
          <Input
            id="huisnummer"
            value={data.huisnummer}
            onChange={(e) => update({ huisnummer: e.target.value })}
          />
        </div>
      </div>

      <section className="flex flex-col gap-2">
        <h3 className="font-display text-base font-semibold text-ink">
          Hoe wil je je offerte ontvangen?
        </h3>
        <RadioGroup
          value={data.contactvoorkeur ?? ""}
          onValueChange={(waarde) =>
            update({ contactvoorkeur: waarde as Contactvoorkeur })
          }
        >
          <label
            htmlFor="voorkeur-whatsapp"
            className="flex items-center gap-3 rounded-brand border border-brand-border bg-white p-4"
          >
            <RadioGroupItem value="whatsapp" id="voorkeur-whatsapp" />
            <span className="text-sm text-ink">WhatsApp</span>
          </label>
          <label
            htmlFor="voorkeur-email"
            className="flex items-center gap-3 rounded-brand border border-brand-border bg-white p-4"
          >
            <RadioGroupItem value="email" id="voorkeur-email" />
            <span className="text-sm text-ink">E-mail</span>
          </label>
        </RadioGroup>
      </section>

      <label className="flex items-start gap-3">
        <Checkbox
          id="privacy"
          className="mt-0.5"
          checked={data.privacyAkkoord}
          onCheckedChange={(staat) => update({ privacyAkkoord: staat === true })}
        />
        <span className="text-sm leading-snug text-ink">
          Ik ga akkoord met de{" "}
          <a
            href="#"
            className="text-link underline underline-offset-2 hover:text-link-hover"
          >
            privacyverklaring
          </a>
          .
        </span>
      </label>

      {fout?.type === "buitenbereik" && (
        <div className="flex flex-col gap-3 rounded-brand border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900">
          <p>
            Helaas valt postcode {data.postcode || "—"} buiten ons
            verzorgingsgebied (&gt;25 km vanaf Cruquius). Bel ons gerust op{" "}
            <a href="tel:0203242202" className="font-medium underline">
              020-324 22 02
            </a>{" "}
            om de mogelijkheden te bespreken.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={onTerugNaarPostcode}
          >
            Postcode aanpassen
          </Button>
        </div>
      )}

      {fout?.type === "algemeen" && (
        <div className="rounded-brand border border-destructive/40 bg-destructive/5 p-5 text-sm text-destructive">
          Er ging iets mis bij het versturen. Controleer je verbinding en
          probeer het opnieuw.
        </div>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          disabled={bezig}
          onClick={onVorige}
        >
          Vorige
        </Button>
        <Button
          className="flex-1"
          disabled={!kanVersturen || bezig}
          onClick={onVerstuur}
        >
          {bezig
            ? "Versturen…"
            : fout?.type === "algemeen"
              ? "Opnieuw versturen"
              : "Verstuur aanvraag"}
        </Button>
      </div>
    </div>
  );
}
