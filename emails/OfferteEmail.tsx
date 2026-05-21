import {
  Body,
  Button,
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
import { euro, nlDatum, offerteBedragen } from "@/lib/format";

const INK = "#131519";
const BODY = "#82878e";
const META = "#a7acb2";
const SURFACE = "#f1f8f8";
const RAND = "#d0d9dd";

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
    fontSize: "26px",
    fontWeight: "700" as const,
    letterSpacing: "-1px",
    margin: "0 0 16px",
  },
  tekst: {
    color: BODY,
    fontSize: "15px",
    lineHeight: "24px",
    margin: "0 0 16px",
  },
  kaart: {
    backgroundColor: SURFACE,
    borderRadius: "20px",
    margin: "0 0 20px",
    padding: "24px",
  },
  th: {
    color: META,
    fontSize: "12px",
    padding: "0 4px 10px",
    textAlign: "left" as const,
  },
  td: {
    borderTop: `1px solid ${RAND}`,
    color: INK,
    fontSize: "14px",
    padding: "10px 4px",
  },
  totaalLabel: {
    color: BODY,
    fontSize: "14px",
    padding: "3px 4px",
    textAlign: "right" as const,
  },
  totaalWaarde: {
    color: INK,
    fontSize: "14px",
    padding: "3px 4px",
    textAlign: "right" as const,
    width: "130px",
  },
  button: {
    backgroundColor: INK,
    borderRadius: "20px",
    color: "#ffffff",
    display: "block",
    fontFamily: DISPLAY,
    fontSize: "15px",
    fontWeight: "600" as const,
    padding: "14px 28px",
    textAlign: "center" as const,
    textDecoration: "none",
  },
  footer: {
    color: META,
    fontSize: "12px",
    lineHeight: "18px",
    margin: "0",
  },
};

export type OfferteEmailProps = {
  aanvraag: AanvraagModel;
  ramen: RaamModel[];
  offerteUrl: string;
};

export function OfferteEmail({ aanvraag, ramen, offerteUrl }: OfferteEmailProps) {
  const klantprijs = aanvraag.klantprijs ?? 0;
  const { subtotaal, btw, totaal } = offerteBedragen(klantprijs);
  const geldigTot = new Date(aanvraag.createdAt);
  geldigTot.setDate(geldigTot.getDate() + 14);

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
      <Preview>Je vrijblijvende raamfolie offerte van Signs.nl</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>
            Je raamfolie offerte van Signs.nl
          </Heading>

          <Text style={styles.tekst}>
            Hi {aanvraag.voornaam}, bedankt voor je aanvraag. Hierbij je
            vrijblijvende offerte voor de installatie van raamfolie.
          </Text>

          <Section style={styles.kaart}>
            <table
              width="100%"
              cellPadding={0}
              cellSpacing={0}
              style={{ borderCollapse: "collapse" }}
            >
              <thead>
                <tr>
                  <th style={styles.th}>Raam</th>
                  <th style={styles.th}>Afmeting</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>
                    m&sup2;
                  </th>
                </tr>
              </thead>
              <tbody>
                {ramen.map((raam, index) => {
                  const breedteCm = Math.round(raam.breedteM * 100);
                  const hoogteCm = Math.round(raam.hoogteM * 100);
                  const m2 = raam.breedteM * raam.hoogteM;
                  return (
                    <tr key={raam.id}>
                      <td style={styles.td}>
                        {raam.naam || `Raam ${index + 1}`}
                      </td>
                      <td style={styles.td}>
                        {breedteCm}&times;{hoogteCm} cm
                      </td>
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        {m2.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Section>

          <table
            width="100%"
            cellPadding={0}
            cellSpacing={0}
            style={{ borderCollapse: "collapse", margin: "0 0 20px" }}
          >
            <tbody>
              <tr>
                <td style={styles.totaalLabel}>Subtotaal (excl. btw)</td>
                <td style={styles.totaalWaarde}>{euro(subtotaal)}</td>
              </tr>
              <tr>
                <td style={styles.totaalLabel}>Btw 21%</td>
                <td style={styles.totaalWaarde}>{euro(btw)}</td>
              </tr>
              <tr>
                <td
                  style={{
                    ...styles.totaalLabel,
                    color: INK,
                    fontFamily: DISPLAY,
                    fontWeight: "600",
                  }}
                >
                  Totaal incl. btw
                </td>
                <td
                  style={{
                    ...styles.totaalWaarde,
                    fontFamily: DISPLAY,
                    fontSize: "20px",
                    fontWeight: "700",
                  }}
                >
                  {euro(totaal)}
                </td>
              </tr>
            </tbody>
          </table>

          <Text style={{ ...styles.tekst, color: META, fontSize: "13px" }}>
            Geldig tot {nlDatum(geldigTot)}.
          </Text>

          <Section style={{ margin: "8px 0 24px" }}>
            <Button style={styles.button} href={offerteUrl}>
              Bekijk en accepteer je offerte
            </Button>
          </Section>

          <Text style={styles.footer}>
            Signs.nl &mdash; Spaarneweg 14, 2142 EN Cruquius
            <br />
            020-324 22 02 &mdash; signs.nl
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default OfferteEmail;
