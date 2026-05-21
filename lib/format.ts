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
