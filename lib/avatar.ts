import { createAvatar } from "@dicebear/core";
import { adventurer, avataaars, bottts } from "@dicebear/collection";
import type { AvatarConfig, AvatarGender } from "./types";

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
    { key: "features", label: "Detalhes", kind: "variant" },
  ],
  avataaars: [
    { key: "skinColor", label: "Pele", kind: "color" },
    { key: "top", label: "Cabelo", kind: "variant" },
    { key: "hairColor", label: "Cor do cabelo", kind: "color" },
    { key: "facialHair", label: "Barba", kind: "variant" },
    { key: "facialHairColor", label: "Cor da barba", kind: "color" },
    { key: "eyes", label: "Olhos", kind: "variant" },
    { key: "eyebrows", label: "Sobrancelhas", kind: "variant" },
    { key: "mouth", label: "Boca", kind: "variant" },
    { key: "accessories", label: "Óculos", kind: "variant" },
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

/** Paletas ampliadas (o DiceBear aceita qualquer hex). */
export const SKIN_TONES = [
  "ffe0bd", "f8d5b8", "f2d3b1", "eac086", "ecad80", "d9a066",
  "c68642", "ae5d29", "9e5622", "8d5524", "763900", "4a2c1a",
];
export const HAIR_COLORS = [
  "0e0e0e", "2c1b18", "4a312c", "562306", "6a4e35", "724133", "a55728",
  "b58143", "d6b370", "e5d7a3", "afafaf", "e8e1e1", "c93305", "dba3be", "592454", "3eac2c",
];

// ---------------------------------------------------------------------------
// Filtro por gênero (classificação visual dos estilos do DiceBear)
// ---------------------------------------------------------------------------
const RANDOM_EXCLUDED_TOPS = ["hat", "hijab", "turban", "winterHat1", "winterHat02", "winterHat03", "winterHat04"];
const AVATAAARS_NEUTRAL_TOP = ["hat", "turban", "winterHat1", "winterHat02", "winterHat03", "winterHat04"];
const GENDER_RULES: Record<string, { m?: (v: string) => boolean; f?: (v: string) => boolean; hideFor?: AvatarGender[] }> = {
  "adventurer.hair": { m: (v) => v.startsWith("short"), f: (v) => v.startsWith("long") },
  "adventurer.earrings": { hideFor: ["m"] },
  "adventurer.features": { f: (v) => v !== "mustache" },
  "avataaars.top": {
    m: (v) => AVATAAARS_NEUTRAL_TOP.includes(v) || ["dreads01", "dreads02", "frizzle", "shaggy", "shaggyMullet", "shortCurly", "shortFlat",
      "shortRound", "shortWaved", "sides", "theCaesar", "theCaesarAndSidePart", "fro", "dreads"].includes(v),
    f: (v) => AVATAAARS_NEUTRAL_TOP.includes(v) || ["hijab", "bob", "bun", "curly", "curvy", "dreads", "frida", "fro", "froBand",
      "longButNotTooLong", "miaWallace", "shavedSides", "straight01", "straight02", "straightAndStrand", "bigHair"].includes(v),
  },
  "avataaars.facialHair": { hideFor: ["f"] },
  "avataaars.facialHairColor": { hideFor: ["f"] },
};

/** Expressões permitidas (fora: vomitando, chorando, bravo, tonto...). */
const PLEASANT: Record<string, string[]> = {
  "avataaars.mouth": ["default", "smile", "twinkle", "serious", "tongue", "eating"],
  "avataaars.eyes": ["default", "happy", "wink", "side", "squint", "surprised", "hearts"],
  "avataaars.eyebrows": ["default", "defaultNatural", "flatNatural", "raisedExcited", "raisedExcitedNatural", "upDown", "upDownNatural"],
};

type Schema = { properties?: Record<string, { items?: { enum?: string[]; pattern?: string }; default?: unknown }> };

function rawValues(style: AvatarStyle, key: string): string[] {
  const schema = (AVATAR_STYLES[style] as unknown as { schema: Schema }).schema;
  const prop = schema.properties?.[key];
  const enumVals = prop?.items?.enum;
  if (enumVals?.length) return [...enumVals].sort();
  const def = prop?.default;
  return Array.isArray(def) ? (def as string[]) : [];
}

/** Categoria visível para o gênero? */
export function categoryVisible(style: AvatarStyle, key: string, gender?: AvatarGender | null): boolean {
  const rule = GENDER_RULES[`${style}.${key}`];
  return !(gender && rule?.hideFor?.includes(gender));
}

/** Valores de uma opção, filtrados pelo gênero quando houver. */
export function optionValues(style: AvatarStyle, key: string, gender?: AvatarGender | null): string[] {
  if (key === "skinColor" && style !== "bottts") return SKIN_TONES;
  if (key === "hairColor" || key === "facialHairColor") return HAIR_COLORS;
  const pleasant = PLEASANT[`${style}.${key}`];
  const vals = pleasant ?? rawValues(style, key);
  const rule = GENDER_RULES[`${style}.${key}`];
  const pred = gender ? rule?.[gender] : undefined;
  return pred ? vals.filter(pred) : vals;
}

const OPTIONAL_KEYS: Record<string, string> = {
  glasses: "glassesProbability", earrings: "earringsProbability", features: "featuresProbability",
  facialHair: "facialHairProbability", accessories: "accessoriesProbability",
};

/** Cabelos que o sorteio automático do avataaars pode escolher. */
export function autoTopPool(gender?: AvatarGender | null): string[] {
  return optionValues("avataaars", "top", gender).filter((v) => !RANDOM_EXCLUDED_TOPS.includes(v));
}

function escapeAttr(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

export function renderAvatarSvg(cfg: AvatarConfig | null | undefined, fallbackSeed = "sipatgo", background?: string): string {
  if (cfg?.style === "photo" && cfg.photo_url) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><image href="${escapeAttr(cfg.photo_url)}" x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice"/></svg>`;
  }
  const c: AvatarConfig = cfg && AVATAR_STYLES[cfg.style as AvatarStyle] ? cfg : { style: "adventurer", seed: fallbackSeed, options: {} };
  const style = c.style as AvatarStyle;
  const opts: Record<string, unknown> = { seed: c.seed || fallbackSeed };

  // Sorteio restrito a expressões simpáticas
  for (const [k, v] of Object.entries(PLEASANT)) {
    const [st, key] = k.split(".");
    if (st === style) opts[key] = v;
  }
  // Sem escolha explícita, o sorteio do DiceBear fica restrito ao gênero
  if (c.gender) {
    for (const cat of AVATAR_CATEGORIES[style]) {
      const rule = GENDER_RULES[`${style}.${cat.key}`];
      if (!rule) continue;
      if (rule.hideFor?.includes(c.gender) && OPTIONAL_KEYS[cat.key]) opts[OPTIONAL_KEYS[cat.key]] = 0;
      else if (rule[c.gender]) opts[cat.key] = optionValues(style, cat.key, c.gender);
    }
    if (style === "avataaars") opts.topProbability = 100;
  }
  // No sorteio automático, nada de chapéu/gorro cobrindo o cabelo (continuam escolhíveis)
  if (style === "avataaars") opts.top = autoTopPool(c.gender);
  for (const [k, v] of Object.entries(c.options ?? {})) {
    if (v === undefined || v === null || v === "") continue;
    if (v === "none" && OPTIONAL_KEYS[k]) { opts[OPTIONAL_KEYS[k]] = 0; continue; }
    if (c.gender && !categoryVisible(style, k, c.gender)) continue;
    opts[k] = Array.isArray(v) ? v : [String(v).replace(/^#/, "")];
    if (OPTIONAL_KEYS[k]) opts[OPTIONAL_KEYS[k]] = 100;
  }
  const bg = (c.options?.backgroundColor as string | undefined) ?? background;
  if (bg) opts.backgroundColor = [String(bg).replace(/^#/, "")];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createAvatar(AVATAR_STYLES[style] as any, opts as any).toString();
}

/**
 * Normaliza o que vem do cliente. Foto só é aceita se a URL for do nosso
 * Storage (prefixo informado pelo servidor).
 */
export function sanitizeAvatar(input: unknown, seed: string, photoPrefix?: string | null): AvatarConfig {
  const i = (input ?? {}) as Partial<AvatarConfig>;
  const gender: AvatarGender | undefined = i.gender === "m" || i.gender === "f" ? i.gender : undefined;
  const cleanSeed = typeof i.seed === "string" ? i.seed.slice(0, 60) : seed;
  if (i.style === "photo") {
    if (!photoPrefix || typeof i.photo_url !== "string" || !i.photo_url.startsWith(photoPrefix) || i.photo_url.length > 500) {
      throw new Error("Foto inválida.");
    }
    return { style: "photo", seed: cleanSeed, options: {}, gender, photo_url: i.photo_url };
  }
  const style: AvatarStyle = i.style && i.style in AVATAR_STYLES ? (i.style as AvatarStyle) : "adventurer";
  const options: AvatarConfig["options"] = {};
  const allowed = new Set([...AVATAR_CATEGORIES[style].map((c) => c.key), "backgroundColor"]);
  for (const [k, v] of Object.entries(i.options ?? {})) {
    if (!allowed.has(k)) continue;
    if (typeof v === "string" && /^[#A-Za-z0-9_-]{1,40}$/.test(v)) options[k] = v;
  }
  return { style, seed: cleanSeed, options, gender };
}
