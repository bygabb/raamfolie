// Eenvoudige gedeelde-wachtwoord-auth voor het admin dashboard.
// Voldoende voor 3 interne gebruikers; productie-grade auth kan later.
// Werkt met Web Crypto zodat het ook in de proxy (edge) runtime draait.

export const COOKIE_NAAM = "signs_admin";
export const SESSIE_DUUR_SEC = 8 * 60 * 60; // 8 uur

const encoder = new TextEncoder();

function hex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256(waarde: string): Promise<string> {
  return hex(await crypto.subtle.digest("SHA-256", encoder.encode(waarde)));
}

async function hmac(payload: string, secret: string): Promise<string> {
  const sleutel = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return hex(await crypto.subtle.sign("HMAC", sleutel, encoder.encode(payload)));
}

// Vergelijkt twee strings van gelijke lengte zonder vroegtijdig te stoppen.
function constanteTijdGelijk(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let verschil = 0;
  for (let i = 0; i < a.length; i++) {
    verschil |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return verschil === 0;
}

// Vergelijkt het ingevoerde wachtwoord met ADMIN_PASSWORD. Beide worden eerst
// gehasht zodat de vergelijking altijd over gelijke lengte loopt.
export async function verifyPassword(input: string): Promise<boolean> {
  const verwacht = process.env.ADMIN_PASSWORD;
  if (!verwacht) return false;
  const [a, b] = await Promise.all([sha256(input), sha256(verwacht)]);
  return constanteTijdGelijk(a, b);
}

// Maakt een ondertekende cookiewaarde: "<vervaltijd>.<hmac>".
export async function createSession(): Promise<string> {
  const secret = process.env.ADMIN_SESSION_SECRET ?? "";
  const vervalt = Date.now() + SESSIE_DUUR_SEC * 1000;
  const payload = String(vervalt);
  const handtekening = await hmac(payload, secret);
  return `${payload}.${handtekening}`;
}

export async function verifySession(
  cookieWaarde: string | undefined,
): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!cookieWaarde || !secret) return false;

  const scheiding = cookieWaarde.lastIndexOf(".");
  if (scheiding < 1) return false;

  const payload = cookieWaarde.slice(0, scheiding);
  const handtekening = cookieWaarde.slice(scheiding + 1);

  const verwacht = await hmac(payload, secret);
  if (!constanteTijdGelijk(handtekening, verwacht)) return false;

  const vervalt = Number(payload);
  if (!Number.isFinite(vervalt) || Date.now() > vervalt) return false;

  return true;
}
