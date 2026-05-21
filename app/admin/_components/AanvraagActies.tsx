"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  id: string;
  token: string;
  status: string;
  klantprijs: number | null;
};

export function AanvraagActies({ id, token, status, klantprijs }: Props) {
  const router = useRouter();
  const [prijs, setPrijs] = useState(
    klantprijs != null ? String(klantprijs) : "",
  );
  const [bezig, setBezig] = useState<string | null>(null);
  const [melding, setMelding] = useState<{ ok: boolean; tekst: string } | null>(
    null,
  );

  async function doe(
    actie: string,
    pad: string,
    body?: Record<string, unknown>,
  ) {
    setBezig(actie);
    setMelding(null);
    try {
      const res = await fetch(`/api/admin/aanvraag/${id}/${pad}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });
      if (!res.ok) {
        setMelding({ ok: false, tekst: "Er ging iets mis. Probeer opnieuw." });
        return;
      }
      setMelding({ ok: true, tekst: "Gelukt." });
      router.refresh();
    } catch {
      setMelding({ ok: false, tekst: "Netwerkfout. Probeer opnieuw." });
    } finally {
      setBezig(null);
    }
  }

  const isAfgewezen = status === "afgewezen";

  return (
    <div className="flex flex-col gap-4">
      {status === "review" && (
        <div className="flex flex-col gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3">
          <Label htmlFor="klantprijs">Klantprijs (€, excl. btw)</Label>
          <Input
            id="klantprijs"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={prijs}
            onChange={(e) => setPrijs(e.target.value)}
          />
          <Button
            disabled={bezig !== null}
            onClick={() =>
              doe("send", "send-offerte", {
                klantprijsOverride: prijs === "" ? undefined : Number(prijs),
              })
            }
          >
            {bezig === "send" ? "Versturen…" : "Stuur offerte naar klant"}
          </Button>
        </div>
      )}

      <Button
        variant="outline"
        disabled={bezig !== null}
        onClick={() => doe("resend", "resend-email")}
      >
        {bezig === "resend" ? "Versturen…" : "Stuur offerte-email opnieuw"}
      </Button>

      {!isAfgewezen && (
        <Button
          variant="destructive"
          disabled={bezig !== null}
          onClick={() => {
            if (
              window.confirm(
                "Weet u zeker dat u deze aanvraag wilt afwijzen? De klant ontvangt geen offerte meer.",
              )
            ) {
              doe("reject", "reject");
            }
          }}
        >
          {bezig === "reject" ? "Bezig…" : "Markeer als afgewezen"}
        </Button>
      )}

      <a
        href={`/offerte/${token}`}
        target="_blank"
        rel="noreferrer"
        className="text-sm text-primary hover:underline"
      >
        Bekijk zoals klant &apos;m ziet ↗
      </a>

      {melding && (
        <p
          className={
            melding.ok
              ? "text-sm text-green-700"
              : "text-sm text-destructive"
          }
        >
          {melding.tekst}
        </p>
      )}
    </div>
  );
}
