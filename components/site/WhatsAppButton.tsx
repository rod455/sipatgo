"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { whatsappUrl } from "@/content/site/site";
import { cn } from "@/lib/utils";
import { track } from "./analytics";

const DISMISS_KEY = "sg_wa_banner_closed";

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className} fill="currentColor">
      <path d="M16.04 3C9 3 3.3 8.7 3.3 15.74c0 2.25.59 4.45 1.71 6.39L3.2 28.8l6.84-1.79a12.7 12.7 0 0 0 6 1.53h.01c7.03 0 12.74-5.71 12.74-12.75 0-3.4-1.33-6.6-3.73-9A12.66 12.66 0 0 0 16.04 3Zm0 23.38h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-4.06 1.06 1.08-3.96-.25-.41a10.56 10.56 0 0 1-1.62-5.62c0-5.85 4.76-10.6 10.62-10.6 2.83 0 5.5 1.1 7.5 3.11a10.53 10.53 0 0 1 3.1 7.5c0 5.86-4.76 10.63-10.57 10.63Zm5.82-7.95c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.72.16-.21.32-.82 1.04-1.01 1.25-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59a9.6 9.6 0 0 1-1.78-2.21c-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.12 1.09-1.12 2.66s1.15 3.09 1.31 3.3c.16.21 2.26 3.45 5.47 4.84.76.33 1.36.53 1.83.68.77.24 1.47.21 2.02.13.62-.09 1.89-.77 2.16-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37Z" />
    </svg>
  );
}

/**
 * Banner flutuante à direita: ícone verde + chamada para o WhatsApp.
 * Aparece após alguns segundos; pode ser fechado (vira só o ícone redondo).
 */
export function WhatsAppButton({ message }: { message?: string }) {
  const href = whatsappUrl(message);
  const [visible, setVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try { if (sessionStorage.getItem(DISMISS_KEY)) setCollapsed(true); } catch { /* sem storage */ }
    const t = setTimeout(() => setVisible(true), 1800);
    return () => clearTimeout(t);
  }, []);

  if (!href) return null;
  const onClick = () => track("whatsapp_click", { label: collapsed ? "floating_icon" : "floating_banner" });
  const close = () => {
    setCollapsed(true);
    try { sessionStorage.setItem(DISMISS_KEY, "1"); } catch { /* ok */ }
  };

  if (collapsed) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} aria-label="Falar com a SipatGo no WhatsApp"
        className="no-print fixed right-4 bottom-4 z-40 inline-flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition hover:scale-105 focus-visible:ring-4 focus-visible:ring-sg-yellow-400/70 focus-visible:outline-none md:right-6 md:bottom-6">
        <WhatsAppGlyph className="size-8" />
      </a>
    );
  }

  return (
    <div
      className={cn(
        "no-print fixed right-0 bottom-4 z-40 transition-all duration-500 ease-out md:bottom-6",
        visible ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-full opacity-0",
      )}
    >
      <div className="relative flex w-[min(80vw,290px)] md:w-[380px] overflow-hidden rounded-l-2xl bg-white shadow-[0_18px_50px_-12px_rgba(11,31,51,.35)] ring-1 ring-sg-navy-900/10">
        <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick}
          className="flex items-center justify-center bg-[#25D366] px-3 text-white transition hover:bg-[#1EBE5A] md:px-5" aria-hidden tabIndex={-1}>
          <WhatsAppGlyph className="size-8 md:size-11" />
        </a>
        <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick}
          className="flex-1 py-2.5 pr-8 pl-3 md:py-4 md:pr-10 md:pl-4 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-sg-yellow-400/70">
          <p className="font-display text-[15px] font-extrabold leading-tight text-sg-navy-900 md:text-[17px]">Quer planejar sua SIPAT?</p>
          <p className="mt-0.5 text-[13px] leading-snug text-sg-navy-700 md:mt-1 md:text-[15px]">Fale com a gente pelo WhatsApp</p>
        </a>
        <button type="button" onClick={close} aria-label="Fechar"
          className="absolute top-1.5 right-1.5 rounded-full p-1 text-sg-gray-600 transition hover:bg-sg-sand-50 hover:text-sg-navy-900">
          <X className="size-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
