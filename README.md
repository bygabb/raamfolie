# signs-raamfolie — Raamfolie offertetool voor Signs.nl

Klant scant een QR/flyer → vult de intake in → de calculator rekent een prijs →
de aanvraag gaat automatisch als offerte naar de klant óf in de review-queue →
Mo en het team beheren alles via het admin dashboard.

> **Status:** gebouwd op branch `claude/setup-nextjs-skeleton-4Mb9p`, nog **niet
> gemerged naar `main`**. De collega merget dit als onderdeel van de eerste
> PR-review.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind v4** — let op: thema-tokens staan in CSS via `@theme` in
  `app/globals.css`, er is **geen `tailwind.config.ts`**
- **shadcn/ui** — re-skinned naar de Signs.nl-huisstijl
- **Prisma 7** + **SQLite** (lokaal) → **Postgres** (productie)
- **Resend** + **@react-email/components** voor transactionele e-mails
- **next/font/google** — Bricolage Grotesque + Kumbh Sans
- **Vitest** voor de calculator-tests

## How it works (de flow)

1. **Intake** — de klant opent `/aanvraag` (`app/aanvraag/page.tsx`) en
   doorloopt een wizard van 4 stappen (`app/aanvraag/_components/Stap1-4.tsx`):
   doel + postcode, ramen + afmetingen, teaser, en NAW-gegevens.
2. **Verzenden** — de wizard POST't naar `app/api/intake/route.ts`. Die
   valideert, rekent de afstand tot Cruquius uit (`lib/distance.ts`, Nominatim)
   en draait de prijscalculator (`lib/calculator.ts`).
3. **Auto-quote of review** — valt de aanvraag binnen de drempels, dan
   `autoQuote = true`; anders gaat hij naar de review-queue (`status = review`).
   Buiten 25 km → de klant krijgt netjes te horen dat het buiten bereik valt.
4. **E-mails** — bij een auto-quote met e-mailvoorkeur gaat de offerte direct
   naar de klant (`emails/OfferteEmail.tsx`) en een melding naar Mo
   (`emails/NotificationEmail.tsx`), beide via `lib/email.ts`. De aanvraag wordt
   opgeslagen met Prisma (`lib/prisma.ts`).
5. **Bevestiging** — de klant landt op `/aanvraag/bedankt`.
6. **Offerte bekijken** — de e-mail bevat een link naar
   `/offerte/{token}` (`app/offerte/[token]/page.tsx`). Daar accepteert of
   weigert de klant; `app/api/offerte/[token]/accept|reject/route.ts` legt dat
   vast (datum + IP) en stuurt bevestigingsmails.
7. **Admin** — Mo en team beheren alles op `/admin` (`app/admin/page.tsx`):
   metrics, statusfilters en een tabel. Op de detailpagina
   (`app/admin/aanvraag/[id]/page.tsx`) kun je een review-aanvraag handmatig
   beprijzen en versturen, een offerte opnieuw mailen of afwijzen.

## Local development

**Prerequisites:** Node 22+ en npm.

```bash
git clone <repo-url>
cd raamfolie
git checkout claude/setup-nextjs-skeleton-4Mb9p
npm install
cp .env.example .env.local      # vul daarna ADMIN_PASSWORD + ADMIN_SESSION_SECRET in
npx prisma migrate dev          # maakt de lokale SQLite-database
npm run dev
```

Zonder `RESEND_API_KEY` worden e-mails niet verstuurd maar naar de console
geprint — handig om de templates te bekijken.

**Belangrijke URLs:**

- `/aanvraag` — publieke intake-wizard
- `/offerte/{token}` — offertepagina voor de klant (token staat in de e-mail/DB)
- `/admin` — dashboard (vereist login met `ADMIN_PASSWORD`)

## Environment variables

Alle variabelen staan ook in `.env.example`.

| Variabele | Wat het doet |
|---|---|
| `DATABASE_URL` | Prisma-connectie. Lokaal: `file:./prisma/dev.db`. Productie: Postgres-URL. |
| `RESEND_API_KEY` | Resend API-key. **Leeg** = e-mails worden ge-`console.log`'t i.p.v. verstuurd (handig in dev). |
| `FROM_EMAIL` | Afzender. Tot `signs.nl` geverifieerd is bij Resend: `onboarding@resend.dev`. Daarna: `offerte@signs.nl`. |
| `NOTIFICATION_EMAIL` | Adres waar Mo de meldingen van nieuwe aanvragen ontvangt. |
| `BASE_URL` | Basis-URL voor offertelinks in e-mails. Moet gelijk zijn aan de gedeployde URL. |
| `ADMIN_PASSWORD` | Gedeeld wachtwoord voor `/admin`. |
| `ADMIN_SESSION_SECRET` | 32+ tekens willekeurig, voor HMAC-ondertekening van de admin-sessie. Genereer met `openssl rand -base64 32`. |

## Production deployment (Vercel + Postgres)

### 1. Database migreren SQLite → Postgres

SQLite werkt niet in Vercel's serverless-omgeving. Provision **Vercel Postgres**
(of Supabase) en doe het volgende:

- Wijzig in `prisma/schema.prisma` de datasource `provider` van `sqlite` naar
  `postgresql`.
- Verwijder de bestaande SQLite-migraties in `prisma/migrations/` (die zijn
  SQLite-specifiek).
- Zet `DATABASE_URL` op de Postgres-URL en draai
  `npx prisma migrate dev --name init_postgres` om verse migraties te genereren.
- Commit de nieuwe `prisma/migrations/`-map.

### 2. Vercel-project

Koppel de repo aan Vercel; Next.js wordt automatisch herkend. Voeg in
**Settings → Environment Variables** **alle** variabelen uit `.env.example` toe.
Zet `BASE_URL` op de uiteindelijke gedeployde URL (incl. custom domain).

### 3. Resend domeinverificatie

Zodat e-mails van `@signs.nl` komen i.p.v. `@resend.dev`:

- Resend dashboard → **Domains** → voeg `signs.nl` toe.
- Voeg de getoonde SPF-, DKIM- en return-path DNS-records toe aan de
  `signs.nl`-zone.
- Zodra geverifieerd: zet `FROM_EMAIL=offerte@signs.nl` in Vercel.

### 4. Google Fonts in productie

Het project laadt Bricolage Grotesque en Kumbh Sans via `next/font/google`
(tijdens de build). Kan Vercel's build-omgeving `fonts.googleapis.com` niet
bereiken (strikt netwerkbeleid), schakel dan over op `next/font/local`:

- Download beide families als woff2 vanaf Google Fonts.
- Plaats ze in `app/fonts/`.
- Vervang in `app/layout.tsx` de `next/font/google`-imports door
  `next/font/local` die naar die bestanden wijzen (zelfde `variable`-namen).

### 5. Custom domain (optioneel, aanbevolen)

Vercel → **Domains** → voeg `offerte.signs.nl` toe → zet de CNAME klaar in de
`signs.nl`-DNS. Werk daarna `BASE_URL` bij.

### 6. Eerste admin-login + smoke test

- Ga naar `/admin`, log in met `ADMIN_PASSWORD`.
- Dien vanaf je mobiel een testaanvraag in via `/aanvraag`.
- Controleer of beide e-mails aankomen (klant + Mo).
- Open de offertelink, accepteer de offerte.
- Controleer de bevestigingsmails en of het dashboard `geaccepteerd` toont.

## How to make common changes

- **Prijzen aanpassen** — wijzig het `CFG`-object in `lib/calculator.ts`. Draai
  daarna `npm run test:run`; de 4 scenario's moeten slagen (pas de
  test-verwachtingen aan als de wijziging bewust is).
- **Huisstijl aanpassen** — de tokens staan in `app/globals.css` onder `@theme`.
  Eén CSS-variabele wijzigen werkt door in alle componenten.
- **E-mailteksten** — pas `emails/OfferteEmail.tsx` en
  `emails/NotificationEmail.tsx` aan. Bekijk het resultaat door een
  testaanvraag in te dienen; zonder `RESEND_API_KEY` verschijnt de e-mail in de
  console.
- **Auth per gebruiker** (buiten scope v1) — vervang `lib/admin-auth.ts` door
  NextAuth met een `User`-model in Prisma.

## Known limitations / future work

- **Foto's** — foto-upload bewaart nu alleen de bestandsnaam. Voor echte upload:
  voeg Vercel Blob of Supabase Storage toe, laat `app/api/intake/route.ts` het
  bestand uploaden en voeg een `fotoUrl`-veld toe aan het `Raam`-model.
- **WhatsApp Business API** — de knop deeplinkt nu naar `wa.me/31203242202`.
  Voor backend-verstuurde WhatsApp-templates is WA Business API-toegang nodig
  (1-2 weken goedkeuring). De intake registreert al `contactvoorkeur`, dus de
  data ligt klaar.
- **Nominatim geocoding** — gratis maar rate-limited. Bij hoog volume: overstap
  naar Google Geocoding API of PostNL.
- **Auto-quote drempels** — max 10 ramen, 2,0 m²/raam, €1500 B2C / €3000 B2B —
  staan in `CFG` in `lib/calculator.ts`. Bijstellen zodra Mo leert van de echte
  praktijk.

## File structure

```
app/
  aanvraag/        Publieke intake-wizard (4 stappen) + bedankt-pagina
  offerte/[token]/ Klant-facing offertepagina (accepteren / weigeren)
  admin/           Beveiligd dashboard: lijst, filters, detail, acties
  api/             Route handlers: intake, offerte accept/reject, admin-acties
  layout.tsx       Root layout — laadt de fonts
  globals.css      Tailwind v4 + brand-tokens (@theme)
lib/
  calculator.ts    Prijslogica + auto-quote-drempels (CFG)
  distance.ts      Postcode → afstand tot Cruquius (Nominatim + haversine)
  email.ts         Resend-verzending met console.log-fallback
  admin-auth.ts    HMAC-sessie + wachtwoordcontrole voor /admin
  admin-guard.ts   Sessiecheck voor admin-API-routes
  prisma.ts        Prisma-client (singleton)
  format.ts        Geld-, datum- en prijsopmaak-helpers
emails/            React-email templates (offerte + notificatie)
components/        SignsHeader, WhatsAppButton + re-skinned shadcn/ui
prisma/            schema.prisma + migraties
proxy.ts           Next.js 16 proxy (voorheen middleware) — beveiligt /admin
```

## Scripts

| Script | Doel |
|---|---|
| `npm run dev` | Lokale dev-server |
| `npm run build` | Productie-build |
| `npm run start` | Productie-server (na build) |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript-check (`tsc --noEmit`) |
| `npm run test` | Vitest (watch) |
| `npm run test:run` | Vitest eenmalig (CI) |
