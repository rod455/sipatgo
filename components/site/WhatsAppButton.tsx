"use client";

import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/content/site/site";
import { track } from "./analytics";

/** Botão flutuante de WhatsApp. Some se NEXT_PUBLIC_WHATSAPP_NUMBER não estiver definido. */
export function WhatsAppButton({ message }: { message?: string }) {
  const href = whatsappUrl(message);
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("whatsapp_click", { label: "floating" })}
      aria-label="Falar com a SipatGo no WhatsApp"
      className="no-print fixed right-4 bottom-4 z-40 inline-flex size-14 items-center justify-center rounded-full bg-[#25D366] text-sg-navy-900 shadow-lg shadow-black/20 transition hover:scale-105 focus-visible:ring-4 focus-visible:ring-sg-yellow-400/70 focus-visible:outline-none md:right-6 md:bottom-6"
    >
      <MessageCircle className="size-7" strokeWidth={2} aria-hidden />
    </a>
  );
}
