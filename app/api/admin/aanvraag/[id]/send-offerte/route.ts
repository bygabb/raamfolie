import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-guard";
import { sendNotificationEmail, sendOfferteEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/admin/aanvraag/[id]/send-offerte">,
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "GEEN_TOEGANG" }, { status: 401 });
  }
  const { id } = await ctx.params;

  let override: number | undefined;
  try {
    const body = (await request.json()) as { klantprijsOverride?: unknown };
    if (
      typeof body.klantprijsOverride === "number" &&
      body.klantprijsOverride > 0
    ) {
      override = Math.round(body.klantprijsOverride * 100) / 100;
    }
  } catch {
    // geen body — gebruik bestaande klantprijs
  }

  const bestaat = await prisma.aanvraag.findUnique({ where: { id } });
  if (!bestaat) {
    return NextResponse.json({ error: "NIET_GEVONDEN" }, { status: 404 });
  }

  const aanvraag = await prisma.aanvraag.update({
    where: { id },
    data: {
      ...(override != null ? { klantprijs: override } : {}),
      emailSentAt: new Date(),
      status: "verzonden",
    },
    include: { ramen: true },
  });

  try {
    await sendOfferteEmail(aanvraag, aanvraag.ramen);
    await sendNotificationEmail(aanvraag, aanvraag.ramen, { handmatig: true });
  } catch (fout) {
    console.error(`[admin] offerte-mail mislukt voor ${id}:`, fout);
  }

  console.log(`[admin] offerte handmatig verzonden voor ${id}`);
  return NextResponse.json({ ok: true });
}
