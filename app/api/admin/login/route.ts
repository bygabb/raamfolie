import { NextResponse } from "next/server";
import {
  COOKIE_NAAM,
  SESSIE_DUUR_SEC,
  createSession,
  verifyPassword,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  let wachtwoord = "";
  try {
    const body = (await request.json()) as { password?: string };
    wachtwoord = body.password ?? "";
  } catch {
    wachtwoord = "";
  }

  if (!(await verifyPassword(wachtwoord))) {
    return NextResponse.json({ error: "WACHTWOORD_ONJUIST" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAAM, await createSession(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSIE_DUUR_SEC,
  });
  return response;
}
