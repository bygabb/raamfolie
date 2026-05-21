import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { AanvraagModel, RaamModel } from "@/lib/generated/prisma/models";
import { euro, nlDatum, offerteBedragen } from "@/lib/format";

const kleuren = {
  tekst: "#1f2937",
  zacht: "#6b7280",
  rand: "#e5e7eb",
  accent: "#1e3a5f",
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
    fontSize: "20px",
    fontWeight: "bold" as const,
    margin: "0 0 16px",
  },
  tekst: {
    color: kleuren.tekst,
    fontSize: "14px",
    lineHeight: "22px",
    margin: "0 0 12px",
  },
  th: {
    borderBottom: `2px solid ${kleuren.rand}`,
    color: kleuren.zacht,
    fontSize: "12px",
    padding: "8px 4px",
    textAlign: "left" as const,
  },
  td: {
    borderBottom: `1px solid ${kleuren.rand}`,
    color: kleuren.tekst,
    fontSize: "13px",
    padding: "8px 4px",
  },
  totaalLabel: {
    color: kleuren.zacht,
    fontSize: "13px",
    padding: "4px 4px",
    textAlign: "right" as const,
  },
  totaalWaarde: {
    color: kleuren.tekst,
    fontSize: "13px",
    padding: "4px 4px",
    textAlign: "right" as const,
    width: "120px",
  },
  button: {
    backgroundColor: kleuren.accent,
    borderRadius: "6px",
    color: "#ffffff",
    display: "block",
    fontSize: "15px",
    fontWeight: "bold" as const,
    padding: "14px 24px",
    textAlign: "center" as const,
    textDecoration: "none",
  },
  footer: {
    color: kleuren.zacht,
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
      <Head />
      <Preview>Uw vrijblijvende raamfolie offerte van Signs.nl</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>
            Uw raamfolie offerte van Signs.nl
          </Heading>

          <Text style={styles.tekst}>
            Beste {aanvraag.voornaam}, bedankt voor uw aanvraag. Hierbij uw
            vrijblijvende offerte voor de installatie van raamfolie.
          </Text>

          <table
            width="100%"
            cellPadding={0}
            cellSpacing={0}
            style={{ borderCollapse: "collapse", margin: "16px 0" }}
          >
            <thead>
              <tr>
                <th style={styles.th}>Raam</th>
                <th style={styles.th}>Afmeting</th>
                <th style={{ ...styles.th, textAlign: "right" }}>m&sup2;</th>
              </tr>
            </thead>
            <tbody>
              {ramen.map((raam, index) => {
                const breedteCm = Math.round(raam.breedteM * 100);
                const hoogteCm = Math.round(raam.hoogteM * 100);
                const m2 = raam.breedteM * raam.hoogteM;
                return (
                  <tr key={raam.id}>
                    <td style={styles.td}>{raam.naam || `Raam ${index + 1}`}</td>
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
                    fontWeight: "bold",
                    color: kleuren.tekst,
                  }}
                >
                  Totaal incl. btw
                </td>
                <td style={{ ...styles.totaalWaarde, fontWeight: "bold" }}>
                  {euro(totaal)}
                </td>
              </tr>
            </tbody>
          </table>

          <Text style={{ ...styles.tekst, color: kleuren.zacht }}>
            Geldig tot {nlDatum(geldigTot)}.
          </Text>

          <Section style={{ margin: "24px 0" }}>
            <Button style={styles.button} href={offerteUrl}>
              Bekijk en accepteer uw offerte
            </Button>
          </Section>

          <Hr style={{ borderColor: kleuren.rand, margin: "24px 0 16px" }} />

          <Text style={styles.footer}>
            Signs.nl &mdash; Spaarneweg 14, Cruquius
            <br />
            020-3242202 &mdash; signs.nl
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default OfferteEmail;
