const euroFormatter = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
});

const datumFormatter = new Intl.DateTimeFormat("nl-NL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const datumTijdFormatter = new Intl.DateTimeFormat("nl-NL", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function euro(bedrag: number): string {
  return euroFormatter.format(bedrag);
}

export function nlDatum(datum: Date): string {
  return datumFormatter.format(datum);
}

export function nlDatumTijd(datum: Date): string {
  return datumTijdFormatter.format(datum);
}

// Korte, leesbare relatieve tijd in het Nederlands.
export function relatieveTijd(datum: Date): string {
  const verschilSec = Math.round((Date.now() - datum.getTime()) / 1000);
  if (verschilSec < 60) return "zojuist";
  const min = Math.round(verschilSec / 60);
  if (min < 60) return `${min} min geleden`;
  const uur = Math.round(min / 60);
  if (uur < 24) return `${uur} uur geleden`;
  const dagen = Math.round(uur / 24);
  if (dagen < 14) return `${dagen} ${dagen === 1 ? "dag" : "dagen"} geleden`;
  return nlDatum(datum);
}

export const BTW_TARIEF = 0.21;

// Berekent de offerte-bedragen vanuit de klantprijs (excl. BTW).
export function offerteBedragen(klantprijsExclBtw: number) {
  const btw = klantprijsExclBtw * BTW_TARIEF;
  return {
    subtotaal: klantprijsExclBtw,
    btw,
    totaal: klantprijsExclBtw + btw,
  };
}
