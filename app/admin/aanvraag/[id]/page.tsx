import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { euro, nlDatumTijd, offerteBedragen } from "@/lib/format";
import { AanvraagActies } from "../../_components/AanvraagActies";
import { StatusBadge } from "../../_components/StatusBadge";

// Spiegelt de markup-factoren uit lib/calculator.ts (CFG).
const MARKUP: Record<string, number> = {
  particulier: 2.1,
  zakelijk: 1.85,
};

function Kaart({
  titel,
  children,
}: {
  titel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <h2 className="text-sm font-semibold">{titel}</h2>
      {children}
    </section>
  );
}

function Regel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

export default async function AanvraagDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const aanvraag = await prisma.aanvraag.findUnique({
    where: { id },
    include: { ramen: true },
  });
  if (!aanvraag) notFound();

  const m2Totaal = aanvraag.ramen.reduce(
    (som, r) => som + r.breedteM * r.hoogteM,
    0,
  );
  const markup = MARKUP[aanvraag.klanttype] ?? null;
  const klantprijs = aanvraag.klantprijs ?? 0;
  const { btw, totaal } = offerteBedragen(klantprijs);

  const tijdlijn = [
    {
      titel: "Aanvraag binnengekomen",
      datum: aanvraag.createdAt,
      extra: null as string | null,
    },
    ...(aanvraag.emailSentAt
      ? [
          {
            titel: "Offerte verzonden",
            datum: aanvraag.emailSentAt,
            extra: null,
          },
        ]
      : []),
    ...(aanvraag.acceptedAt
      ? [
          {
            titel: "Geaccepteerd door klant",
            datum: aanvraag.acceptedAt,
            extra: aanvraag.acceptedIp
              ? `IP ${aanvraag.acceptedIp}`
              : null,
          },
        ]
      : []),
    ...(aanvraag.rejectedAt
      ? [{ titel: "Afgewezen", datum: aanvraag.rejectedAt, extra: null }]
      : []),
  ];

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6">
      <Link
        href="/admin"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Terug naar alle aanvragen
      </Link>

      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold">
          Aanvraag {aanvraag.id.slice(0, 8)} — {aanvraag.voornaam}{" "}
          {aanvraag.achternaam}
        </h1>
        <StatusBadge status={aanvraag.status} />
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Kaart titel="Klantgegevens">
          <Regel label="Naam">
            {aanvraag.voornaam} {aanvraag.achternaam}
          </Regel>
          <Regel label="E-mail">
            <a
              href={`mailto:${aanvraag.email}`}
              className="text-primary hover:underline"
            >
              {aanvraag.email}
            </a>
          </Regel>
          <Regel label="Telefoon">
            <a
              href={`tel:${aanvraag.telefoon}`}
              className="text-primary hover:underline"
            >
              {aanvraag.telefoon}
            </a>
          </Regel>
          <Regel label="Adres">
            {aanvraag.straat} {aanvraag.huisnummer}, {aanvraag.postcode}
          </Regel>
          <Regel label="Contactvoorkeur">
            {aanvraag.contactvoorkeur === "whatsapp" ? (
              <span className="font-medium text-emerald-700">
                WhatsApp — bel/app de klant zelf
              </span>
            ) : (
              "E-mail"
            )}
          </Regel>
        </Kaart>

        <Kaart titel="Aanvraagdetails">
          <Regel label="Klanttype">{aanvraag.klanttype}</Regel>
          <Regel label="Doel">{aanvraag.doel}</Regel>
          <Regel label="Postcode">{aanvraag.postcode}</Regel>
          <Regel label="Afstand">
            {aanvraag.afstandKm != null
              ? `${aanvraag.afstandKm} km`
              : "onbekend"}
          </Regel>
          <Regel label="Hoge ramen">
            {aanvraag.hogeRamen ? "ja" : "nee"}
          </Regel>
          <Regel label="Aantal ramen">{aanvraag.ramen.length}</Regel>
          <Regel label="Totaal m²">{m2Totaal.toFixed(2)} m²</Regel>
        </Kaart>
      </div>

      <Kaart titel="Ramen">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naam</TableHead>
                <TableHead>Breedte</TableHead>
                <TableHead>Hoogte</TableHead>
                <TableHead>m²</TableHead>
                <TableHead>Foto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aanvraag.ramen.map((raam, index) => (
                <TableRow key={raam.id}>
                  <TableCell>{raam.naam || `Raam ${index + 1}`}</TableCell>
                  <TableCell>{Math.round(raam.breedteM * 100)} cm</TableCell>
                  <TableCell>{Math.round(raam.hoogteM * 100)} cm</TableCell>
                  <TableCell>
                    {(raam.breedteM * raam.hoogteM).toFixed(2)}
                  </TableCell>
                  <TableCell>{raam.fotoFilename || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Kaart>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Kaart titel="Prijsopbouw">
          <Regel label="Kostprijs">
            {aanvraag.kostprijs != null ? euro(aanvraag.kostprijs) : "—"}
          </Regel>
          <Regel label="Markup">{markup != null ? `${markup}×` : "—"}</Regel>
          <Regel label="Klantprijs excl. btw">{euro(klantprijs)}</Regel>
          <Regel label="Btw 21%">{euro(btw)}</Regel>
          <div className="flex justify-between gap-4 border-t pt-2 text-sm font-semibold">
            <span>Klantprijs incl. btw</span>
            <span>{euro(totaal)}</span>
          </div>
        </Kaart>

        <Kaart titel="Tijdlijn">
          <ol className="flex flex-col gap-3">
            {tijdlijn.map((stap, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{stap.titel}</span>
                  <span className="text-xs text-muted-foreground">
                    {nlDatumTijd(new Date(stap.datum))}
                    {stap.extra ? ` · ${stap.extra}` : ""}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </Kaart>
      </div>

      <Kaart titel="Acties">
        <AanvraagActies
          id={aanvraag.id}
          token={aanvraag.token}
          status={aanvraag.status}
          klantprijs={aanvraag.klantprijs}
        />
      </Kaart>
    </main>
  );
}
