import { MessageCircle } from "lucide-react";

// Zwevende WhatsApp-knop voor publieke pagina's.
// Mobiel: cirkel met icoon. Desktop: pill met icoon + tekst.
export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/31203242202"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat met ons via WhatsApp"
      className="fixed right-5 bottom-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp font-medium text-white shadow-lg transition hover:opacity-90 sm:h-auto sm:w-auto sm:gap-2 sm:px-5 sm:py-3"
    >
      <MessageCircle className="size-6 sm:size-5" />
      <span className="hidden sm:inline">Chat met ons</span>
    </a>
  );
}
