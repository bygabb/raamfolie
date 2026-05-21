// Signs.nl raamfolie calculator — v1
// Zandstraalfolie standaard, B2C focus.
// B2B werkt met dezelfde functie, alleen klanttype='b2b' → andere markup.
// Aannames staan in CFG en zijn 1 plek om te tunen na de eerste echte orders.

type Raam = {
  breedte: number;          // meters
  hoogte: number;           // meters
  topVanafVloer?: number;   // meters; >2.5 = naar review (steiger/ladder-inschatting)
};

type Input = {
  ramen: Raam[];
  afstandKm: number;        // enkele reis vanaf Cruquius
  klanttype: "b2c" | "b2b";
};

type Output = {
  autoQuote: boolean;
  flags: string[];
  klantprijs: number | null;     // excl. BTW, eindigt op .95
  breakdown: {
    m2Totaal: number;
    arbeidstijdUren: number;
    materiaal: number;
    arbeid: number;
    voorrijden: number;
    kostprijs: number;
    markup: number;
  } | null;
};

// Alle aannames op één plek — verander hier zonder de logica te raken.
const CFG = {
  // Materiaal — Vink VTS Metamark M7-CR Crystal Etch Glassdecor
  // 1220mm rol @ €6,40/m → €5,25/m² | 1600mm rol @ €8,43/m → €5,27/m²
  // Met ~10% snijverlies effectief €5,80/m² → afgerond €6,00/m²
  foliePerM2: 6.00,

  // Arbeid (externe monteur, kostprijs voor Signs.nl)
  uurloon: 40.00,
  voorbereidingPerRaam: 5,      // minuten kantoor — snijden + transfer-tape
  installatiePerRaam: 30,       // minuten op locatie — schoonmaken, opmeten, plakken

  // Voorrijden
  voorrijden: 45.00,            // vast tarief binnen 25 km

  // Marge — afgestemd op €6/m² inkoop, behoudt klantprijzen uit eerste sanity-check
  markupB2C: 2.10,              // ~52% gross margin
  markupB2B: 1.85,              // ~46% gross margin

  // Drempels
  minimumOrder: 175.00,
  maxAfstandKm: 25,

  // Auto-quote criteria — alles erbuiten → review-queue
  autoMaxRamen: 10,
  autoMaxM2PerRaam: 2.0,
  autoMaxBedragB2C: 1500.00,
  autoMaxBedragB2B: 3000.00,
};

// Eindigt netjes op .95
function rondAfNaar95(prijs: number): number {
  return Math.floor(prijs) + 0.95;
}

export function bereken(input: Input): Output {
  // 1. Geografische check
  if (input.afstandKm > CFG.maxAfstandKm) {
    return {
      autoQuote: false,
      flags: ["BUITEN_25KM"],
      klantprijs: null,
      breakdown: null,
    };
  }

  // 2. Per raam metrics
  let m2Totaal = 0;
  let hogeRamen = 0;
  let groteRamen = 0;
  for (const r of input.ramen) {
    const m2 = r.breedte * r.hoogte;
    m2Totaal += m2;
    if ((r.topVanafVloer ?? 0) > 2.5) hogeRamen++;
    if (m2 > CFG.autoMaxM2PerRaam) groteRamen++;
  }

  // 3. Kostprijs
  const materiaal = m2Totaal * CFG.foliePerM2;
  const minuten = input.ramen.length * (CFG.voorbereidingPerRaam + CFG.installatiePerRaam);
  const arbeid = (minuten / 60) * CFG.uurloon;
  const voorrijden = CFG.voorrijden;
  const kostprijs = materiaal + arbeid + voorrijden;

  // 4. Klantprijs
  const markup = input.klanttype === "b2c" ? CFG.markupB2C : CFG.markupB2B;
  const ruwKlantprijs = Math.max(kostprijs * markup, CFG.minimumOrder);
  const klantprijs = rondAfNaar95(ruwKlantprijs);

  // 5. Auto-quote eligibility
  const flags: string[] = [];
  if (input.ramen.length > CFG.autoMaxRamen) flags.push("VEEL_RAMEN");
  if (groteRamen > 0) flags.push("GROOT_RAAM");
  if (hogeRamen > 0) flags.push("HOOG_RAAM");
  const maxBedrag = input.klanttype === "b2c" ? CFG.autoMaxBedragB2C : CFG.autoMaxBedragB2B;
  if (klantprijs > maxBedrag) flags.push("GROOT_BEDRAG");

  return {
    autoQuote: flags.length === 0,
    flags,
    klantprijs,
    breakdown: {
      m2Totaal: +m2Totaal.toFixed(2),
      arbeidstijdUren: +(minuten / 60).toFixed(2),
      materiaal: +materiaal.toFixed(2),
      arbeid: +arbeid.toFixed(2),
      voorrijden,
      kostprijs: +kostprijs.toFixed(2),
      markup,
    },
  };
}

// ───────────────────────────────────────────────────────────
// Voorbeeldgebruik — voer uit met `npx tsx calculator.ts`
// ───────────────────────────────────────────────────────────
if (require.main === module) {
  const cases: { naam: string; input: Input }[] = [
    {
      naam: "A. Woonkamer, 2 ramen middelgroot",
      input: {
        ramen: [
          { breedte: 1.5, hoogte: 1.2 },
          { breedte: 1.0, hoogte: 1.2 },
        ],
        afstandKm: 12,
        klanttype: "b2c",
      },
    },
    {
      naam: "B. Klein keukenraam, 1 raam (minimum-check)",
      input: {
        ramen: [{ breedte: 0.8, hoogte: 1.0 }],
        afstandKm: 5,
        klanttype: "b2c",
      },
    },
    {
      naam: "C. Thuispraktijk, 5 ramen incl 1 hoog raam",
      input: {
        ramen: [
          { breedte: 1.2, hoogte: 1.3 },
          { breedte: 1.2, hoogte: 1.3 },
          { breedte: 1.2, hoogte: 1.3 },
          { breedte: 1.2, hoogte: 1.3 },
          { breedte: 1.5, hoogte: 1.0, topVanafVloer: 2.8 },
        ],
        afstandKm: 20,
        klanttype: "b2c",
      },
    },
    {
      naam: "D. Hele woning, 8 ramen normale hoogte",
      input: {
        ramen: Array(8).fill({ breedte: 1.3, hoogte: 1.15 }),
        afstandKm: 15,
        klanttype: "b2c",
      },
    },
  ];

  for (const c of cases) {
    const r = bereken(c.input);
    console.log(`\n${c.naam}`);
    console.log(`  Auto-quote: ${r.autoQuote ? "JA" : "NEE → review-queue"}`);
    if (r.flags.length) console.log(`  Flags: ${r.flags.join(", ")}`);
    if (r.klantprijs !== null && r.breakdown) {
      console.log(`  m² totaal: ${r.breakdown.m2Totaal} | arbeidstijd: ${r.breakdown.arbeidstijdUren} u`);
      console.log(`  Kostprijs: €${r.breakdown.kostprijs} | markup: ${r.breakdown.markup}× | Klantprijs: €${r.klantprijs} (excl. BTW)`);
    }
  }
}
