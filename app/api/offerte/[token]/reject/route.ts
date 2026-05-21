import { NextResponse } from "next/server";
import { sendStatusNotificatie } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/offerte/[token]/reject">,
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
    data: { rejectedAt: new Date(), status: "afgewezen" },
  });

  try {
    await sendStatusNotificatie(bijgewerkt, "afgewezen");
  } catch (fout) {
    console.error(`[offerte] reject-mail mislukt voor ${bijgewerkt.id}:`, fout);
  }

  console.log(
    `[offerte] ${bijgewerkt.id} afgewezen door ${bijgewerkt.voornaam} ${bijgewerkt.achternaam}`,
  );

  return terug;
}
