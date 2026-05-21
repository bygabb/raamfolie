"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Stap1 } from "./Stap1";
import { Stap2 } from "./Stap2";
import { Stap3 } from "./Stap3";
import { Stap4 } from "./Stap4";
import { legeIntake, type IntakeData } from "./types";

export function IntakeWizard() {
  const router = useRouter();
  const [stap, setStap] = useState(1);
  const [data, setData] = useState<IntakeData>(legeIntake);

  function update(wijziging: Partial<IntakeData>) {
    setData((vorige) => ({ ...vorige, ...wijziging }));
  }

  function verstuur() {
    console.log("Intake-aanvraag:", data);
    router.push("/aanvraag/bedankt");
  }

  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-col px-4 py-8">
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
        />
      )}
    </main>
  );
}
