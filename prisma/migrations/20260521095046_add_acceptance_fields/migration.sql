/*
  Warnings:

  - The required column `token` was added to the `Aanvraag` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Aanvraag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "token" TEXT NOT NULL,
    "klanttype" TEXT NOT NULL,
    "doel" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "afstandKm" REAL,
    "hogeRamen" BOOLEAN NOT NULL DEFAULT false,
    "voornaam" TEXT NOT NULL,
    "achternaam" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefoon" TEXT NOT NULL,
    "straat" TEXT NOT NULL,
    "huisnummer" TEXT NOT NULL,
    "contactvoorkeur" TEXT NOT NULL,
    "kostprijs" REAL,
    "klantprijs" REAL,
    "autoQuote" BOOLEAN NOT NULL DEFAULT false,
    "flags" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'nieuw',
    "emailSentAt" DATETIME,
    "acceptedAt" DATETIME,
    "acceptedIp" TEXT,
    "rejectedAt" DATETIME
);
INSERT INTO "new_Aanvraag" ("achternaam", "afstandKm", "autoQuote", "contactvoorkeur", "createdAt", "doel", "email", "flags", "hogeRamen", "huisnummer", "id", "klantprijs", "klanttype", "kostprijs", "postcode", "status", "straat", "telefoon", "voornaam") SELECT "achternaam", "afstandKm", "autoQuote", "contactvoorkeur", "createdAt", "doel", "email", "flags", "hogeRamen", "huisnummer", "id", "klantprijs", "klanttype", "kostprijs", "postcode", "status", "straat", "telefoon", "voornaam" FROM "Aanvraag";
DROP TABLE "Aanvraag";
ALTER TABLE "new_Aanvraag" RENAME TO "Aanvraag";
CREATE UNIQUE INDEX "Aanvraag_token_key" ON "Aanvraag"("token");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
