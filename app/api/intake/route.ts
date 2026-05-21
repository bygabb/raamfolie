import { NextResponse } from "next/server";
import { bereken } from "@/lib/calculator";
import { postcodeNaarAfstand } from "@/lib/distance";
import { sendNotificationEmail, sendOfferteEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const MAX_AFSTAND_KM = 25;

type RaamInvoer = {
  naam?: string;
  breedte: number; // cm
  hoogte: number; // cm
  fotoFilename?: string;
};

type IntakePayload = {
  klanttype?: string;
  doel?: string;
  postcode?: string;
  ramen?: RaamInvoer[];
  hogeRamen?: boolean;
  voornaam?: string;
  achternaam?: string;
  email?: string;
  telefoon?: string;
  straat?: string;
  huisnummer?: string;
  contactvoorkeur?: string;
  privacyAkkoord?: boolean;
};

function isGevuld(waarde: unknown): waarde is string {
  return typeof waarde === "string" && waarde.trim().length > 0;
}

export async function POST(request: Request) {
  let body: IntakePayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "ONGELDIGE_INVOER", message: "Body is geen geldige JSON." },
      { status: 400 },
    );
  }

  // Server-side validatie van verplichte velden.
  const tekstVelden: (keyof IntakePayload)[] = [
    "klanttype",
    "doel",
    "postcode",
    "voornaam",
    "achternaam",
    "email",
    "telefoon",
    "straat",
    "huisnummer",
    "contactvoorkeur",
  ];
  const ontbreekt = tekstVelden.filter((veld) => !isGevuld(body[veld]));

  if (!Array.isArray(body.ramen) || body.ramen.length === 0) {
    ontbreekt.push("ramen");
  } else if (
    body.ramen.some((r) => !(r.breedte > 0) || !(r.hoogte > 0))
  ) {
    ontbreekt.push("ramen");
  }
  if (body.privacyAkkoord !== true) ontbreekt.push("privacyAkkoord");

  if (ontbreekt.length > 0) {
    return NextResponse.json(
      { error: "ONVOLLEDIG", velden: ontbreekt },
      { status: 400 },
    );
  }

  const klanttype = body.klanttype === "zakelijk" ? "b2b" : "b2c";
  const hogeRamen = body.hogeRamen === true;

  // cm → m, plus topVanafVloer als de klant hoge ramen heeft aangevinkt.
  const ramenMeters = body.ramen!.map((r) => ({
    naam: r.naam,
    breedteM: r.breedte / 100,
    hoogteM: r.hoogte / 100,
    fotoFilename: r.fotoFilename,
  }));

  const afstandKm = await postcodeNaarAfstand(body.postcode!);

  if (afstandKm !== null && afstandKm > MAX_AFSTAND_KM) {
    return NextResponse.json({ error: "BUITEN_BEREIK", afstandKm });
  }

  const resultaat = bereken({
    klanttype,
    afstandKm: afstandKm ?? 0,
    ramen: ramenMeters.map((r) => ({
      breedte: r.breedteM,
      hoogte: r.hoogteM,
      ...(hogeRamen ? { topVanafVloer: 2.8 } : {}),
    })),
  });

  // Postcode niet te geocoden → afstand onbekend, handmatig nakijken.
  const afstandOnbekend = afstandKm === null;
  const flags = afstandOnbekend
    ? [...resultaat.flags, "POSTCODE_ONBEKEND"]
    : resultaat.flags;
  const autoQuote = resultaat.autoQuote && !afstandOnbekend;
  const status = autoQuote ? "nieuw" : "review";

  const aanvraag = await prisma.aanvraag.create({
    data: {
      klanttype: body.klanttype!,
      doel: body.doel!,
      postcode: body.postcode!,
      afstandKm,
      hogeRamen,
      voornaam: body.voornaam!,
      achternaam: body.achternaam!,
      email: body.email!,
      telefoon: body.telefoon!,
      straat: body.straat!,
      huisnummer: body.huisnummer!,
      contactvoorkeur: body.contactvoorkeur!,
      kostprijs: resultaat.breakdown?.kostprijs ?? null,
      klantprijs: resultaat.klantprijs,
      autoQuote,
      flags: JSON.stringify(flags),
      status,
      ramen: {
        create: ramenMeters.map((r) => ({
          naam: r.naam ?? null,
          breedteM: r.breedteM,
          hoogteM: r.hoogteM,
          fotoFilename: r.fotoFilename ?? null,
        })),
      },
    },
    include: { ramen: true },
  });

  console.log(
    `[intake] nieuwe aanvraag ${aanvraag.id} — ${body.voornaam} ${body.achternaam}, ` +
      `${ramenMeters.length} raam/ramen, afstand ${afstandKm ?? "onbekend"} km, ` +
      `klantprijs €${resultaat.klantprijs ?? "-"}, status ${status}`,
  );

  // E-mails versturen — losstaand van de DB-opslag: een mislukte mail mag
  // de aanvraag niet ongedaan maken.
  try {
    const offertePerMail =
      autoQuote && aanvraag.contactvoorkeur === "email";

    if (offertePerMail) {
      const offerte = await sendOfferteEmail(aanvraag, aanvraag.ramen);
      if (offerte.verzonden) {
        await prisma.aanvraag.update({
          where: { id: aanvraag.id },
          data: { emailSentAt: new Date() },
        });
      }
    }

    await sendNotificationEmail(aanvraag, aanvraag.ramen);
  } catch (fout) {
    console.error(`[intake] e-mail versturen mislukt voor ${aanvraag.id}:`, fout);
  }

  return NextResponse.json({
    id: aanvraag.id,
    autoQuote,
    klantprijs: resultaat.klantprijs,
    status,
    flags,
  });
}
