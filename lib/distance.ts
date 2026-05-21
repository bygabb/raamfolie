// Geocodeert een Nederlandse postcode en berekent de hemelsbrede afstand
// tot de vestiging in Cruquius. Gebruikt Nominatim (OpenStreetMap).

const CRUQUIUS = { lat: 52.3408, lon: 4.6539 };

// In-memory cache per server-proces — voorkomt dubbel geocoden.
const cache = new Map<string, number | null>();

function normaliseer(postcode: string): string {
  return postcode.replace(/\s+/g, "").toUpperCase();
}

function haversineKm(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
): number {
  const R = 6371; // straal aarde in km
  const naarRad = (graden: number) => (graden * Math.PI) / 180;
  const dLat = naarRad(b.lat - a.lat);
  const dLon = naarRad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(naarRad(a.lat)) *
      Math.cos(naarRad(b.lat)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export async function postcodeNaarAfstand(
  postcode: string,
): Promise<number | null> {
  const sleutel = normaliseer(postcode);
  if (cache.has(sleutel)) return cache.get(sleutel)!;

  const url =
    "https://nominatim.openstreetmap.org/search?" +
    new URLSearchParams({
      postalcode: sleutel,
      country: "Netherlands",
      format: "json",
      limit: "1",
    });

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "signs-raamfolie/1.0 (offerte-tool; contact: mo@signs.nl)",
      },
    });
    if (!res.ok) {
      cache.set(sleutel, null);
      return null;
    }
    const treffers = (await res.json()) as { lat?: string; lon?: string }[];
    const eerste = treffers[0];
    if (!eerste?.lat || !eerste?.lon) {
      cache.set(sleutel, null);
      return null;
    }
    const afstand = haversineKm(CRUQUIUS, {
      lat: Number(eerste.lat),
      lon: Number(eerste.lon),
    });
    const afgerond = Math.round(afstand * 10) / 10;
    cache.set(sleutel, afgerond);
    return afgerond;
  } catch {
    // Netwerkfout — niet cachen, zodat een latere poging opnieuw kan proberen.
    return null;
  }
}
