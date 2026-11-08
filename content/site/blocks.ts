/**
 * Blocos de conteúdo rico (sem MDX). Texto aceita **negrito** e [links](/caminho).
 */
export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string; id?: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "callout"; text: string; title?: string; tone?: "info" | "warning" | "tip" }
  | { type: "quote"; text: string; cite?: string }
  | { type: "cta"; text: string; href: string; label: string };

export type GuideSection = { id: string; title: string; blocks: Block[] };

export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Conta palavras de um conjunto de blocos (útil para conferir o tamanho dos guias). */
export function wordCount(blocks: Block[]): number {
  const text = blocks
    .map((b) => {
      switch (b.type) {
        case "ul":
        case "ol":
          return b.items.join(" ");
        case "cta":
          return b.text;
        default:
          return b.text;
      }
    })
    .join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}
