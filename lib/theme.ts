import type { CSSProperties } from "react";

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.padEnd(6, "0").slice(0, 6);
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Cor de texto (preto/branco) com melhor contraste sobre o fundo. */
export function readableOn(hex: string): string {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L > 0.4 ? "#111827" : "#FFFFFF";
}

export function isHexColor(s: string) {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s);
}

export function brandStyle(c: { primary_color: string; secondary_color: string; accent_color: string }): CSSProperties {
  return {
    ["--brand-primary" as string]: c.primary_color,
    ["--brand-secondary" as string]: c.secondary_color,
    ["--brand-accent" as string]: c.accent_color,
    ["--brand-primary-fg" as string]: readableOn(c.primary_color),
    ["--brand-secondary-fg" as string]: readableOn(c.secondary_color),
    ["--brand-accent-fg" as string]: readableOn(c.accent_color),
  };
}
