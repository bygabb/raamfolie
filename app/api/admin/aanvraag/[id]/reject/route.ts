import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-guard";
import { sendStatusNotificatie } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/admin/aanvraag/[id]/reject">,
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "GEEN_TOEGANG" }, { status: 401 });
  }
  const { id } = await ctx.params;

  const bestaat = await prisma.aanvraag.findUnique({ where: { id } });
  if (!bestaat) {
    return NextResponse.json({ error: "NIET_GEVONDEN" }, { status: 404 });
  }

  const aanvraag = await prisma.aanvraag.update({
    where: { id },
    data: { rejectedAt: new Date(), status: "afgewezen" },
  });

  try {
    await sendStatusNotificatie(aanvraag, "afgewezen");
  } catch (fout) {
    console.error(`[admin] reject-mail mislukt voor ${id}:`, fout);
  }

  console.log(`[admin] aanvraag ${id} handmatig afgewezen`);
  return NextResponse.json({ ok: true });
}
