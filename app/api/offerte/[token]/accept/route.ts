import { NextResponse } from "next/server";
import { sendAcceptatieBevestiging, sendStatusNotificatie } from "@/lib/email";
import { prisma } from "@/lib/prisma";

function leesIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip");
}

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/offerte/[token]/accept">,
) {
  const { token } = await ctx.params;
  const terug = NextResponse.redirect(
    new URL(`/offerte/${token}`, request.url),
    303,
  );

  const aanvraag = await prisma.aanvraag.findUnique({ where: { token } });
  if (!aanvraag) {
    return NextResponse.json({ error: "NIET_GEVONDEN" }, { status: 404 });
  }

  // Al beslist → niets wijzigen, gewoon terug naar de offertepagina.
  if (aanvraag.acceptedAt || aanvraag.rejectedAt) return terug;

  const bijgewerkt = await prisma.aanvraag.update({
    where: { token },
    data: {
      acceptedAt: new Date(),
      acceptedIp: leesIp(request),
      status: "geaccepteerd",
    },
  });

  try {
    await sendAcceptatieBevestiging(bijgewerkt);
    await sendStatusNotificatie(bijgewerkt, "geaccepteerd");
  } catch (fout) {
    console.error(`[offerte] accept-mail mislukt voor ${bijgewerkt.id}:`, fout);
  }

  console.log(
    `[offerte] ${bijgewerkt.id} geaccepteerd door ${bijgewerkt.voornaam} ${bijgewerkt.achternaam}`,
  );

  return terug;
}
