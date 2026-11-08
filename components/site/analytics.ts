type GtagParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: "event" | "config" | "js", target: string | Date, params?: GtagParams) => void;
    dataLayer?: unknown[];
  }
}

export type SiteEvent =
  | "cta_click"
  | "form_submit"
  | "demo_start"
  | "demo_finish"
  | "whatsapp_click"
  | "download";

/** Dispara um evento GA4. No-op se o GA não estiver carregado (NEXT_PUBLIC_GA_ID ausente). */
export function track(event: SiteEvent, params: GtagParams = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  try {
    window.gtag("event", event, params);
  } catch {
    /* nunca quebra a UI por causa de analytics */
  }
}
