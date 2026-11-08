/** Constantes do site público SipatGo (sipatgo.com.br). */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://sipatgo.com.br").replace(/\/$/, "");
export const SITE_NAME = "SipatGo";
export const TAGLINE = "A SIPAT que todo mundo quer jogar.";
export const DEFAULT_DESCRIPTION =
  "Transforme a Semana de Prevenção em um jogo de 5 dias: vídeo, desafio e ranking ao vivo, somados às ações presenciais da CIPA. Pronto em dias, com a documentação organizada para comprovar a SIPAT.";
export const CONTACT_EMAIL = "contato@sipatgo.com.br";
export const PRIVACY_EMAIL = "privacidade@sipatgo.com.br";
/** Placeholder: substituir pelo CNPJ real assim que a empresa estiver registrada. */
export const CNPJ = "CNPJ 00.000.000/0000-00 (a definir)";
export const COPYRIGHT_YEAR = 2026;

/** WhatsApp comercial (só dígitos, com DDI 55). NEXT_PUBLIC_WHATSAPP_NUMBER sobrescreve. */
export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5531994826794").replace(/\D/g, "");

export function whatsappUrl(
  text = "Olá! Quero saber mais sobre a SipatGo para a SIPAT da minha empresa.",
): string | null {
  if (!WHATSAPP_NUMBER) return null;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function absoluteUrl(path = "/"): string {
  if (path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export const SOCIAL_LINKS: { label: string; href: string }[] = [
  { label: "Instagram", href: "https://www.instagram.com/sipatgo" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/sipatgo" },
  { label: "YouTube", href: "https://www.youtube.com/@sipatgo" },
];
