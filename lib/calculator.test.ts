import { describe, it, expect } from "vitest";
import { bereken } from "./calculator";

describe("bereken — raamfolie calculator", () => {
  it("Scenario A — woonkamer, 2 ramen middelgroot", () => {
    const r = bereken({
      ramen: [
        { breedte: 1.5, hoogte: 1.2 },
        { breedte: 1.0, hoogte: 1.2 },
      ],
      afstandKm: 12,
      klanttype: "b2c",
    });
    expect(r.klantprijs).toBe(230.95);
    expect(r.autoQuote).toBe(true);
  });

  it("Scenario B — klein keukenraam, minimum-order grijpt in", () => {
    const r = bereken({
      ramen: [{ breedte: 0.8, hoogte: 1.0 }],
      afstandKm: 5,
      klanttype: "b2c",
    });
    expect(r.klantprijs).toBe(175.95);
    expect(r.autoQuote).toBe(true);
  });

  it("Scenario C — 5 ramen incl. hoog raam → review-queue", () => {
    const r = bereken({
      ramen: [
        { breedte: 1.2, hoogte: 1.3 },
        { breedte: 1.2, hoogte: 1.3 },
        { breedte: 1.2, hoogte: 1.3 },
        { breedte: 1.2, hoogte: 1.3 },
        { breedte: 1.5, hoogte: 1.0, topVanafVloer: 2.8 },
      ],
      afstandKm: 20,
      klanttype: "b2c",
    });
    expect(r.autoQuote).toBe(false);
    expect(r.flags).toContain("HOOG_RAAM");
  });

  it("Scenario D — hele woning, 8 ramen normale hoogte", () => {
    const r = bereken({
      ramen: Array(8).fill({ breedte: 1.3, hoogte: 1.15 }),
      afstandKm: 15,
      klanttype: "b2c",
    });
    expect(r.klantprijs).toBe(637.95);
    expect(r.autoQuote).toBe(true);
  });
});
