import { render } from "@react-email/components";
import { Resend } from "resend";
import { NotificationEmail } from "@/emails/NotificationEmail";
import { OfferteEmail } from "@/emails/OfferteEmail";
import type { AanvraagModel, RaamModel } from "@/lib/generated/prisma/models";
import { euro, nlDatumTijd } from "@/lib/format";

const FROM_EMAIL = process.env.FROM_EMAIL
  ? `Signs.nl <${process.env.FROM_EMAIL}>`
  : "Signs.nl <onboarding@resend.dev>";

// Waar Mo de meldingen ontvangt. Placeholder tot de echte waarde in .env staat.
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL ?? "mo@example.com";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

type EmailResultaat = { verzonden: boolean };

type VerstuurArgs = {
  to: string;
  subject: string;
  html: string;
};

// Centrale verzendfunctie. Verstuurt echt via Resend wanneer er een API-key
// is; zonder key logt hij de inhoud naar de console (handig in dev).
async function verstuur({ to, subject, html }: VerstuurArgs): Promise<EmailResultaat> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log("\n─────────── E-MAIL (dev — niet echt verzonden) ───────────");
    console.log(`Aan        : ${to}`);
    console.log(`Van        : ${FROM_EMAIL}`);
    console.log(`Onderwerp  : ${subject}`);
    console.log("HTML-preview:");
    console.log(html);
    console.log("───────────────────────────────────────────────────────────\n");
    return { verzonden: true };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    if (error) {
      console.error("[email] Resend-fout:", error);
      return { verzonden: false };
    }
    return { verzonden: true };
  } catch (fout) {
    console.error("[email] Versturen mislukt:", fout);
    return { verzonden: false };
  }
}

// Sober opgemaakte transactionele e-mail voor losse statusberichten.
function eenvoudigeHtml(titel: string, regels: string[]): string {
  const body = regels
    .map(
      (regel) =>
        `<p style="color:#1f2937;font-size:14px;line-height:22px;margin:0 0 12px;">${regel}</p>`,
    )
    .join("");
  return `<!doctype html><html lang="nl"><body style="background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;margin:0;padding:24px 0;">
<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;margin:0 auto;max-width:600px;padding:32px;">
<h1 style="color:#1f2937;font-size:18px;margin:0 0 16px;">${titel}</h1>
${body}
<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0 16px;" />
<p style="color:#6b7280;font-size:12px;line-height:18px;margin:0;">Signs.nl — Spaarneweg 14, Cruquius<br/>020-3242202 — signs.nl</p>
</div></body></html>`;
}

export async function sendOfferteEmail(
  aanvraag: AanvraagModel,
  ramen: RaamModel[],
): Promise<EmailResultaat> {
  const offerteUrl = `${BASE_URL}/offerte/${aanvraag.token}`;
  const html = await render(
    OfferteEmail({ aanvraag, ramen, offerteUrl }),
  );
  return verstuur({
    to: aanvraag.email,
    subject: "Uw raamfolie offerte van Signs.nl",
    html,
  });
}

export async function sendNotificationEmail(
  aanvraag: AanvraagModel,
  ramen: RaamModel[],
): Promise<EmailResultaat> {
  // De offerte gaat alleen automatisch per mail bij auto-quote + e-mailvoorkeur.
  const offerteVerzonden =
    aanvraag.autoQuote && aanvraag.contactvoorkeur === "email";
  const prefix = aanvraag.autoQuote ? "[AUTO]" : "[REVIEW]";
  const html = await render(
    NotificationEmail({
      aanvraag,
      ramen,
      offerteVerzonden,
      adminUrl: `${BASE_URL}/admin`,
    }),
  );
  return verstuur({
    to: NOTIFICATION_EMAIL,
    subject: `${prefix} Nieuwe aanvraag — ${aanvraag.voornaam} ${aanvraag.achternaam}`,
    html,
  });
}

export async function sendAcceptatieBevestiging(
  aanvraag: AanvraagModel,
): Promise<EmailResultaat> {
  const bedrag =
    aanvraag.klantprijs != null
      ? ` (${euro(aanvraag.klantprijs * 1.21)} incl. btw)`
      : "";
  const html = eenvoudigeHtml("Bedankt voor uw akkoord", [
    `Beste ${aanvraag.voornaam}, wij hebben uw akkoord op de offerte${bedrag} ontvangen.`,
    "Wij nemen binnenkort contact met u op om de installatie in te plannen.",
    "Heeft u vragen? Bel ons gerust op 020-3242202.",
  ]);
  return verstuur({
    to: aanvraag.email,
    subject: "Bevestiging: uw raamfolie offerte is geaccepteerd",
    html,
  });
}

export async function sendStatusNotificatie(
  aanvraag: AanvraagModel,
  soort: "geaccepteerd" | "afgewezen",
): Promise<EmailResultaat> {
  const html = eenvoudigeHtml(`Offerte ${aanvraag.id} ${soort}`, [
    `${aanvraag.voornaam} ${aanvraag.achternaam} heeft offerte ${aanvraag.id} ${soort} op ${nlDatumTijd(new Date())}.`,
    `Contact: ${aanvraag.email} — ${aanvraag.telefoon}`,
  ]);
  return verstuur({
    to: NOTIFICATION_EMAIL,
    subject: `[${soort.toUpperCase()}] Offerte ${aanvraag.id} — ${aanvraag.voornaam} ${aanvraag.achternaam}`,
    html,
  });
}
