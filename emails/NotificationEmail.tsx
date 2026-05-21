import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from "@react-email/components";
import type { AanvraagModel, RaamModel } from "@/lib/generated/prisma/models";
import { euro, nlDatumTijd } from "@/lib/format";

const kleuren = {
  tekst: "#1f2937",
  zacht: "#6b7280",
  rand: "#e5e7eb",
};

const styles = {
  body: {
    backgroundColor: "#f3f4f6",
    fontFamily: "Arial, Helvetica, sans-serif",
    margin: "0",
    padding: "24px 0",
  },
  container: {
    backgroundColor: "#ffffff",
    border: `1px solid ${kleuren.rand}`,
    borderRadius: "8px",
    margin: "0 auto",
    maxWidth: "600px",
    padding: "32px",
  },
  heading: {
    color: kleuren.tekst,
    fontSize: "18px",
    fontWeight: "bold" as const,
    margin: "0 0 16px",
  },
  subkop: {
    color: kleuren.zacht,
    fontSize: "12px",
    fontWeight: "bold" as const,
    letterSpacing: "0.04em",
    margin: "20px 0 8px",
    textTransform: "uppercase" as const,
  },
  rijLabel: {
    color: kleuren.zacht,
    fontSize: "13px",
    padding: "4px 12px 4px 0",
    verticalAlign: "top" as const,
    whiteSpace: "nowrap" as const,
  },
  rijWaarde: {
    color: kleuren.tekst,
    fontSize: "13px",
    padding: "4px 0",
  },
  melding: {
    borderRadius: "6px",
    fontSize: "13px",
    lineHeight: "20px",
    margin: "16px 0 0",
    padding: "12px 16px",
  },
};

export type NotificationEmailProps = {
  aanvraag: AanvraagModel;
  ramen: RaamModel[];
  offerteVerzonden: boolean;
  adminUrl: string;
  handmatig?: boolean;
};

function Rij({ label, waarde }: { label: string; waarde: string }) {
  return (
    <tr>
      <td style={styles.rijLabel}>{label}</td>
      <td style={styles.rijWaarde}>{waarde}</td>
    </tr>
  );
}

export function NotificationEmail({
  aanvraag,
  ramen,
  offerteVerzonden,
  adminUrl,
  handmatig = false,
}: NotificationEmailProps) {
  const m2Totaal = ramen.reduce((som, r) => som + r.breedteM * r.hoogteM, 0);
  const flags: string[] = (() => {
    try {
      return JSON.parse(aanvraag.flags) as string[];
    } catch {
      return [];
    }
  })();
  const isWhatsapp = aanvraag.contactvoorkeur === "whatsapp";

  return (
    <Html lang="nl">
      <Head />
      <Preview>
        {aanvraag.autoQuote ? "[AUTO]" : "[REVIEW]"} Nieuwe aanvraag &mdash;{" "}
        {aanvraag.voornaam} {aanvraag.achternaam}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>
            Nieuwe aanvraag binnen &mdash; {aanvraag.voornaam}{" "}
            {aanvraag.achternaam}
          </Heading>

          <Text style={styles.subkop}>Samenvatting</Text>
          <table cellPadding={0} cellSpacing={0}>
            <tbody>
              <Rij label="Klanttype" waarde={aanvraag.klanttype} />
              <Rij label="Doel" waarde={aanvraag.doel} />
              <Rij label="Postcode" waarde={aanvraag.postcode} />
              <Rij label="Aantal ramen" waarde={String(ramen.length)} />
              <Rij label="m² totaal" waarde={m2Totaal.toFixed(2)} />
              <Rij
                label="Kostprijs"
                waarde={
                  aanvraag.kostprijs != null ? euro(aanvraag.kostprijs) : "—"
                }
              />
              <Rij
                label="Klantprijs"
                waarde={
                  aanvraag.klantprijs != null
                    ? `${euro(aanvraag.klantprijs)} (excl. btw)`
                    : "—"
                }
              />
              <Rij
                label="Auto-quote"
                waarde={aanvraag.autoQuote ? "ja" : "nee — review"}
              />
              <Rij
                label="Flags"
                waarde={flags.length > 0 ? flags.join(", ") : "geen"}
              />
            </tbody>
          </table>

          <Text style={styles.subkop}>Klantcontact</Text>
          <table cellPadding={0} cellSpacing={0}>
            <tbody>
              <Rij label="E-mail" waarde={aanvraag.email} />
              <Rij label="Telefoon" waarde={aanvraag.telefoon} />
              <Rij
                label="Voorkeur"
                waarde={
                  isWhatsapp
                    ? "WhatsApp ✱ — stuur de offerte zelf via WhatsApp"
                    : "E-mail"
                }
              />
            </tbody>
          </table>

          <Text style={styles.subkop}>Adres</Text>
          <Text
            style={{
              color: kleuren.tekst,
              fontSize: "13px",
              margin: "0",
            }}
          >
            {aanvraag.straat} {aanvraag.huisnummer}
            <br />
            {aanvraag.postcode}
          </Text>

          <Hr style={{ borderColor: kleuren.rand, margin: "20px 0 0" }} />

          {handmatig ? (
            <Text
              style={{ ...styles.melding, backgroundColor: "#f0fdfa", color: "#0f766e" }}
            >
              Offerte handmatig verzonden door de beheerder op{" "}
              {nlDatumTijd(new Date(aanvraag.emailSentAt ?? new Date()))}.
            </Text>
          ) : aanvraag.autoQuote ? (
            offerteVerzonden ? (
              <Text
                style={{ ...styles.melding, backgroundColor: "#ecfdf5", color: "#065f46" }}
              >
                Offerte automatisch verzonden naar klant op{" "}
                {nlDatumTijd(new Date(aanvraag.emailSentAt ?? aanvraag.createdAt))}.
              </Text>
            ) : (
              <Text
                style={{ ...styles.melding, backgroundColor: "#fffbeb", color: "#92400e" }}
              >
                Auto-quote, maar klant koos WhatsApp. De offerte is niet
                automatisch verstuurd — stuur deze zelf via WhatsApp naar{" "}
                {aanvraag.telefoon}.
              </Text>
            )
          ) : (
            <Text
              style={{ ...styles.melding, backgroundColor: "#fef2f2", color: "#991b1b" }}
            >
              Niet automatisch verzonden. Login op het admin dashboard ({adminUrl}
              ) om deze aanvraag handmatig op te volgen.
            </Text>
          )}
        </Container>
      </Body>
    </Html>
  );
}

export default NotificationEmail;
