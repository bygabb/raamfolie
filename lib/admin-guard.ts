import { cookies } from "next/headers";
import { COOKIE_NAAM, verifySession } from "@/lib/admin-auth";

// Sessiecontrole voor admin-API-routes. De proxy beschermt /admin/*-pagina's;
// de muterende API-routes controleren daarnaast zelf.
export async function isAdmin(): Promise<boolean> {
  const cookie = (await cookies()).get(COOKIE_NAAM)?.value;
  return verifySession(cookie);
}
