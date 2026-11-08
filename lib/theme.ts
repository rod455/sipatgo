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
  // escolhe pelo maior contraste real (WCAG) entre branco e quase-preto
  const vsWhite = 1.05 / (L + 0.05);
  const vsDark = (L + 0.05) / (0.0119 + 0.05);
  return vsDark > vsWhite ? "#111827" : "#FFFFFF";
}

function toHex([r, g, b]: [number, number, number]) {
  return "#" + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
}

/** Mistura `hex` com `base` (0 = só base, 1 = só hex). */
export function mix(hex: string, base: string, amount: number): string {
  const a = hexToRgb(hex), b = hexToRgb(base);
  return toHex([0, 1, 2].map((i) => b[i] + (a[i] - b[i]) * amount) as [number, number, number]);
}

function luminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Tom escuro da cor principal para títulos (contraste ≥ 7:1 sobre fundo claro). */
export function inkOf(hex: string): string {
  for (let k = 0.75; k >= 0.15; k -= 0.05) {
    const c = mix(hex, "#000000", k);
    if ((1.05) / (luminance(c) + 0.05) >= 7) return c;
  }
  return "#111827";
}

/** Paleta derivada das 3 cores da empresa (tons claros, tinta para títulos). */
export function brandPalette(c: { primary_color: string; secondary_color: string; accent_color: string }) {
  return {
    "--brand-50": mix(c.primary_color, "#FFFFFF", 0.06),
    "--brand-100": mix(c.primary_color, "#FFFFFF", 0.13),
    "--brand-200": mix(c.primary_color, "#FFFFFF", 0.26),
    "--brand-ink": inkOf(c.primary_color),
    "--brand-muted": mix(inkOf(c.primary_color), "#FFFFFF", 0.78),
    "--brand-accent-50": mix(c.accent_color, "#FFFFFF", 0.14),
    "--brand-accent-200": mix(c.accent_color, "#FFFFFF", 0.45),
    "--brand-2-50": mix(c.secondary_color, "#FFFFFF", 0.12),
  };
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
    ...(brandPalette(c) as CSSProperties),
  };
}
