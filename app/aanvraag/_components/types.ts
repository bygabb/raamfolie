export type Klanttype = "particulier" | "zakelijk";
export type Doel = "privacy" | "zonwering" | "decoratief" | "anders";
export type Contactvoorkeur = "whatsapp" | "email";

export type Raam = {
  naam?: string;
  breedte: number;
  hoogte: number;
  foto?: File;
};

export type IntakeData = {
  klanttype: Klanttype | null;
  doel: Doel | null;
  postcode: string;
  ramen: Raam[];
  hogeRamen: boolean;
  voornaam: string;
  achternaam: string;
  email: string;
  telefoon: string;
  straat: string;
  huisnummer: string;
  contactvoorkeur: Contactvoorkeur | null;
  privacyAkkoord: boolean;
};

export const POSTCODE_REGEX = /^[1-9][0-9]{3}\s?[A-Za-z]{2}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isGeldigeTelefoon(waarde: string): boolean {
  const opgeschoond = waarde.replace(/[\s-]/g, "");
  return /^(\+31|0)[1-9][0-9]{8}$/.test(opgeschoond);
}

export const legeIntake: IntakeData = {
  klanttype: null,
  doel: null,
  postcode: "",
  ramen: [{ breedte: 0, hoogte: 0 }],
  hogeRamen: false,
  voornaam: "",
  achternaam: "",
  email: "",
  telefoon: "",
  straat: "",
  huisnummer: "",
  contactvoorkeur: null,
  privacyAkkoord: false,
};
