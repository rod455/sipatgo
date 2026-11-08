/** Endereços do site/plataforma que não podem virar /empresa. */
export const RESERVED_SLUGS = new Set([
  "admin", "api", "app", "c", "entrar", "login", "logout", "super", "verify", "www",
  "blog", "cases", "como-funciona", "contato", "demo", "funcionalidades", "materiais", "og",
  "para-quem", "precos", "privacidade", "sipat", "sobre", "termos", "clients", "samples", "site",
  "robots.txt", "sitemap.xml", "icon.svg", "opengraph-image", "favicon.ico", "_next",
]);

export const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,40}$/;

export function isCompanySlug(s: string): boolean {
  return SLUG_RE.test(s) && !RESERVED_SLUGS.has(s);
}
