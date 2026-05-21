import { WhatsAppButton } from "@/components/WhatsAppButton";

export default function AanvraagLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <WhatsAppButton />
    </>
  );
}
