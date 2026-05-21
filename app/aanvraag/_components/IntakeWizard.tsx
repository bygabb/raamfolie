"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Stap1 } from "./Stap1";
import { Stap2 } from "./Stap2";
import { Stap3 } from "./Stap3";
import { Stap4 } from "./Stap4";
import { legeIntake, type IntakeData } from "./types";

export type VerstuurFout =
  | { type: "buitenbereik" }
  | { type: "algemeen" }
  | null;

export function IntakeWizard() {
  const router = useRouter();
  const [stap, setStap] = useState(1);
  const [data, setData] = useState<IntakeData>(legeIntake);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<VerstuurFout>(null);

  function update(wijziging: Partial<IntakeData>) {
    setData((vorige) => ({ ...vorige, ...wijziging }));
  }

  async function verstuur() {
    setBezig(true);
    setFout(null);
    try {
      const payload = {
        ...data,
        ramen: data.ramen.map((r) => ({
          naam: r.naam,
          breedte: r.breedte,
          hoogte: r.hoogte,
          fotoFilename: r.foto?.name,
        })),
      };
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);

      if (json?.error === "BUITEN_BEREIK") {
        setFout({ type: "buitenbereik" });
        return;
      }
      if (!res.ok || !json?.id) {
        setFout({ type: "algemeen" });
        return;
      }
      router.push(`/aanvraag/bedankt?id=${json.id}`);
    } catch {
      setFout({ type: "algemeen" });
    } finally {
      setBezig(false);
    }
  }

  return (
    <div className="flex w-full flex-col">
      {stap === 1 && (
        <Stap1 data={data} update={update} onVolgende={() => setStap(2)} />
      )}
      {stap === 2 && (
        <Stap2
          data={data}
          update={update}
          onVolgende={() => setStap(3)}
          onVorige={() => setStap(1)}
        />
      )}
      {stap === 3 && (
        <Stap3
          data={data}
          onVolgende={() => setStap(4)}
          onVorige={() => setStap(2)}
        />
      )}
      {stap === 4 && (
        <Stap4
          data={data}
          update={update}
          onVerstuur={verstuur}
          onVorige={() => setStap(3)}
          onTerugNaarPostcode={() => {
            setFout(null);
            setStap(1);
          }}
          bezig={bezig}
          fout={fout}
        />
      )}
    </div>
  );
}
