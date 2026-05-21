import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-guard";
import { sendOfferteEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/admin/aanvraag/[id]/resend-email">,
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "GEEN_TOEGANG" }, { status: 401 });
  }
  const { id } = await ctx.params;

  const aanvraag = await prisma.aanvraag.findUnique({
    where: { id },
    include: { ramen: true },
  });
  if (!aanvraag) {
    return NextResponse.json({ error: "NIET_GEVONDEN" }, { status: 404 });
  }

  try {
    await sendOfferteEmail(aanvraag, aanvraag.ramen);
    await prisma.aanvraag.update({
      where: { id },
      data: { emailSentAt: new Date() },
    });
  } catch (fout) {
    console.error(`[admin] opnieuw versturen mislukt voor ${id}:`, fout);
    return NextResponse.json({ error: "MAIL_MISLUKT" }, { status: 500 });
  }

  console.log(`[admin] offerte-mail opnieuw verzonden voor ${id}`);
  return NextResponse.json({ ok: true });
}
