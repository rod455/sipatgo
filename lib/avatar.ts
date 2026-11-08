import { createAvatar } from "@dicebear/core";
import { adventurer, avataaars, bottts } from "@dicebear/collection";
import type { AvatarConfig } from "./types";

export const AVATAR_STYLES = { adventurer, avataaars, bottts } as const;
export type AvatarStyle = keyof typeof AVATAR_STYLES;

/** Opções editáveis por estilo (categorias do editor). Valores vêm do schema do DiceBear. */
export const AVATAR_CATEGORIES: Record<AvatarStyle, { key: string; label: string; kind: "variant" | "color" }[]> = {
  adventurer: [
    { key: "skinColor", label: "Pele", kind: "color" },
    { key: "hair", label: "Cabelo", kind: "variant" },
    { key: "hairColor", label: "Cor do cabelo", kind: "color" },
    { key: "eyes", label: "Olhos", kind: "variant" },
    { key: "eyebrows", label: "Sobrancelhas", kind: "variant" },
    { key: "mouth", label: "Boca", kind: "variant" },
    { key: "glasses", label: "Óculos", kind: "variant" },
    { key: "earrings", label: "Brincos", kind: "variant" },
  ],
  avataaars: [
    { key: "skinColor", label: "Pele", kind: "color" },
    { key: "top", label: "Cabelo", kind: "variant" },
    { key: "hairColor", label: "Cor do cabelo", kind: "color" },
    { key: "eyes", label: "Olhos", kind: "variant" },
    { key: "mouth", label: "Boca", kind: "variant" },
    { key: "facialHair", label: "Barba", kind: "variant" },
    { key: "accessories", label: "Acessórios", kind: "variant" },
    { key: "clothing", label: "Roupa", kind: "variant" },
    { key: "clothesColor", label: "Cor da roupa", kind: "color" },
  ],
  bottts: [
    { key: "baseColor", label: "Cor", kind: "color" },
    { key: "face", label: "Rosto", kind: "variant" },
    { key: "eyes", label: "Olhos", kind: "variant" },
    { key: "mouth", label: "Boca", kind: "variant" },
    { key: "top", label: "Antena", kind: "variant" },
    { key: "sides", label: "Laterais", kind: "variant" },
  ],
};

type Schema = { properties?: Record<string, { items?: { enum?: string[]; pattern?: string }; default?: unknown }> };

export function optionValues(style: AvatarStyle, key: string): string[] {
  const schema = (AVATAR_STYLES[style] as unknown as { schema: Schema }).schema;
  const prop = schema.properties?.[key];
  const enumVals = prop?.items?.enum;
  if (enumVals?.length) return enumVals;
  const def = prop?.default;
  return Array.isArray(def) ? (def as string[]) : [];
}

const OPTIONAL_KEYS: Record<string, string> = {
  glasses: "glassesProbability", earrings: "earringsProbability",
  facialHair: "facialHairProbability", accessories: "accessoriesProbability",
};

export function renderAvatarSvg(cfg: AvatarConfig | null | undefined, fallbackSeed = "sipatgo", background?: string): string {
  const c: AvatarConfig = cfg && AVATAR_STYLES[cfg.style as AvatarStyle] ? cfg : { style: "adventurer", seed: fallbackSeed, options: {} };
  const opts: Record<string, unknown> = { seed: c.seed || fallbackSeed };
  for (const [k, v] of Object.entries(c.options ?? {})) {
    if (v === undefined || v === null || v === "") continue;
    if (v === "none" && OPTIONAL_KEYS[k]) { opts[OPTIONAL_KEYS[k]] = 0; continue; }
    opts[k] = Array.isArray(v) ? v : [String(v).replace(/^#/, "")];
    if (OPTIONAL_KEYS[k]) opts[OPTIONAL_KEYS[k]] = 100;
  }
  const bg = (c.options?.backgroundColor as string | undefined) ?? background;
  if (bg) opts.backgroundColor = [String(bg).replace(/^#/, "")];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createAvatar(AVATAR_STYLES[c.style as AvatarStyle] as any, opts as any).toString();
}

export function sanitizeAvatar(input: unknown, seed: string): AvatarConfig {
  const i = (input ?? {}) as Partial<AvatarConfig>;
  const style: AvatarStyle = i.style && i.style in AVATAR_STYLES ? (i.style as AvatarStyle) : "adventurer";
  const options: AvatarConfig["options"] = {};
  const allowed = new Set([...AVATAR_CATEGORIES[style].map((c) => c.key), "backgroundColor"]);
  for (const [k, v] of Object.entries(i.options ?? {})) {
    if (!allowed.has(k)) continue;
    if (typeof v === "string" && /^[#A-Za-z0-9_-]{1,40}$/.test(v)) options[k] = v;
  }
  return { style, seed: typeof i.seed === "string" ? i.seed.slice(0, 60) : seed, options };
}
