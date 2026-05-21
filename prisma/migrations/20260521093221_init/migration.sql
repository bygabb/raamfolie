-- CreateTable
CREATE TABLE "Aanvraag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
    "status" TEXT NOT NULL DEFAULT 'nieuw'
);

-- CreateTable
CREATE TABLE "Raam" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "naam" TEXT,
    "breedteM" REAL NOT NULL,
    "hoogteM" REAL NOT NULL,
    "fotoFilename" TEXT,
    "aanvraagId" TEXT NOT NULL,
    CONSTRAINT "Raam_aanvraagId_fkey" FOREIGN KEY ("aanvraagId") REFERENCES "Aanvraag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
