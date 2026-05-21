import {
  Body,
  Container,
  Font,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { AanvraagModel, RaamModel } from "@/lib/generated/prisma/models";
import { euro, nlDatumTijd } from "@/lib/format";

const INK = "#131519";
const BODY = "#82878e";
const META = "#a7acb2";
const SURFACE = "#f1f8f8";

const DISPLAY = "'Bricolage Grotesque', sans-serif";
const SANS = "'Kumbh Sans', Arial, Helvetica, sans-serif";

const styles = {
  body: {
    backgroundColor: "#ffffff",
    fontFamily: SANS,
    margin: "0",
    padding: "24px 0",
  },
  container: {
    margin: "0 auto",
    maxWidth: "600px",
    padding: "24px",
  },
  heading: {
    color: INK,
    fontFamily: DISPLAY,
    fontSize: "22px",
    fontWeight: "700" as const,
    letterSpacing: "-1px",
    margin: "0 0 20px",
  },
  kaart: {
    backgroundColor: SURFACE,
    borderRadius: "20px",
    margin: "0 0 16px",
    padding: "20px 24px",
  },
  subkop: {
    color: META,
    fontSize: "11px",
    fontWeight: "700" as const,
    letterSpacing: "0.06em",
    margin: "0 0 10px",
    textTransform: "uppercase" as const,
  },
  rijLabel: {
    color: BODY,
    fontSize: "13px",
    padding: "3px 12px 3px 0",
    verticalAlign: "top" as const,
    whiteSpace: "nowrap" as const,
  },
  rijWaarde: {
    color: INK,
    fontSize: "13px",
    padding: "3px 0",
  },
  melding: {
    borderRadius: "20px",
    fontSize: "13px",
    lineHeight: "20px",
    margin: "8px 0 0",
    padding: "14px 20px",
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
      <Head>
        <Font
          fontFamily="Bricolage Grotesque"
          fallbackFontFamily="sans-serif"
          fontWeight={700}
        />
        <Font
          fontFamily="Kumbh Sans"
          fallbackFontFamily="sans-serif"
          fontWeight={400}
        />
      </Head>
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

          <Section style={styles.kaart}>
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
                    aanvraag.kostprijs != null
                      ? euro(aanvraag.kostprijs)
                      : "—"
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
          </Section>

          <Section style={styles.kaart}>
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
                <Rij
                  label="Adres"
                  waarde={`${aanvraag.straat} ${aanvraag.huisnummer}, ${aanvraag.postcode}`}
                />
              </tbody>
            </table>
          </Section>

          {handmatig ? (
            <Text
              style={{
                ...styles.melding,
                backgroundColor: "#f0fdfa",
                color: "#0f766e",
              }}
            >
              Offerte handmatig verzonden door de beheerder op{" "}
              {nlDatumTijd(new Date(aanvraag.emailSentAt ?? new Date()))}.
            </Text>
          ) : aanvraag.autoQuote ? (
            offerteVerzonden ? (
              <Text
                style={{
                  ...styles.melding,
                  backgroundColor: "#ecfdf5",
                  color: "#065f46",
                }}
              >
                Offerte automatisch verzonden naar klant op{" "}
                {nlDatumTijd(
                  new Date(aanvraag.emailSentAt ?? aanvraag.createdAt),
                )}
                .
              </Text>
            ) : (
              <Text
                style={{
                  ...styles.melding,
                  backgroundColor: "#fffbeb",
                  color: "#92400e",
                }}
              >
                Auto-quote, maar klant koos WhatsApp. De offerte is niet
                automatisch verstuurd — stuur deze zelf via WhatsApp naar{" "}
                {aanvraag.telefoon}.
              </Text>
            )
          ) : (
            <Text
              style={{
                ...styles.melding,
                backgroundColor: "#fef2f2",
                color: "#991b1b",
              }}
            >
              Niet automatisch verzonden. Login op het admin dashboard (
              {adminUrl}) om deze aanvraag handmatig op te volgen.
            </Text>
          )}
        </Container>
      </Body>
    </Html>
  );
}

export default NotificationEmail;
