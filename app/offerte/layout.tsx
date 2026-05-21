import { WhatsAppButton } from "@/components/WhatsAppButton";

export default function OfferteLayout({
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
