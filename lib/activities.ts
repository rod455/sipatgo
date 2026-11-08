import { z } from "zod";

export const ACTIVITY_TYPES = ["true_false", "timed_quiz", "find_errors", "match_pairs", "new_habits"] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  true_false: "Fato ou Fake",
  timed_quiz: "Acerte em Tempo",
  find_errors: "Encontre os Erros",
  match_pairs: "Ligue os Pares",
  new_habits: "Novos Hábitos",
};

const text = z.string().trim().min(1, "Campo obrigatório").max(500);
const expl = z.string().trim().max(800).default("");

export const trueFalseSchema = z.object({
  items: z.array(z.object({ statement: text, answer: z.boolean(), explanation: expl })).length(5, "São exatamente 5 afirmações"),
});
export const timedQuizSchema = z.object({
  items: z.array(z.object({
    question: text,
    options: z.array(text).length(4, "São 4 alternativas"),
    correct_index: z.number().int().min(0).max(3),
    explanation: expl,
  })).length(5, "São exatamente 5 perguntas"),
  time_limit_s: z.number().int().min(5).max(60).default(15),
});
export const hotspotSchema = z.object({
  id: z.string().min(1),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  w: z.number().min(1).max(100),
  h: z.number().min(1).max(100),
  label: z.string().trim().max(200).default(""),
  explanation: expl,
});
export const findErrorsSchema = z.object({
  image_url: z.string().min(1, "Envie a imagem"),
  hotspots: z.array(hotspotSchema).length(5, "Marque exatamente 5 erros"),
  max_wrong_clicks: z.number().int().min(1).max(20).default(5),
});
export const matchPairsSchema = z.object({
  pairs: z.array(z.object({ left: text, right: text, explanation: expl })).length(5, "São exatamente 5 pares"),
});
export const newHabitsSchema = z.object({
  items: z.array(z.object({
    situation: text,
    options: z.array(text).length(3, "São 3 atitudes"),
    correct_index: z.number().int().min(0).max(2),
    explanation: expl,
  })).length(5, "São exatamente 5 situações"),
});

export const CONFIG_SCHEMAS = {
  true_false: trueFalseSchema,
  timed_quiz: timedQuizSchema,
  find_errors: findErrorsSchema,
  match_pairs: matchPairsSchema,
  new_habits: newHabitsSchema,
} as const;

export type TrueFalseConfig = z.infer<typeof trueFalseSchema>;
export type TimedQuizConfig = z.infer<typeof timedQuizSchema>;
export type FindErrorsConfig = z.infer<typeof findErrorsSchema>;
export type MatchPairsConfig = z.infer<typeof matchPairsSchema>;
export type NewHabitsConfig = z.infer<typeof newHabitsSchema>;

export function validateConfig(type: ActivityType, config: unknown) {
  return CONFIG_SCHEMAS[type].safeParse(config);
}

// ---------------------------------------------------------------------------
// Embaralhamento determinístico (mesma ordem para o mesmo participante)
// ---------------------------------------------------------------------------
export function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Retorna uma permutação de [0..n-1]; perm[pos] = índice original. */
export function permutation(n: number, seed: string): number[] {
  const rnd = mulberry32(hashSeed(seed));
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // evita que o embaralhamento fique idêntico à ordem original
  if (n > 1 && arr.every((v, i) => v === i)) arr.push(arr.shift()!);
  return arr;
}

// ---------------------------------------------------------------------------
// Configuração pública (sem respostas) enviada ao cliente
// ---------------------------------------------------------------------------
export type PublicActivity =
  | { type: "true_false"; items: { statement: string }[] }
  | { type: "timed_quiz"; items: { question: string; options: string[] }[]; time_limit_s: number }
  | { type: "find_errors"; image_url: string; count: number; max_wrong_clicks: number }
  | { type: "match_pairs"; left: string[]; right: string[] }
  | { type: "new_habits"; items: { situation: string; options: string[] }[] };

export function publicConfig(type: ActivityType, config: unknown, seed: string): PublicActivity {
  switch (type) {
    case "true_false": {
      const c = config as TrueFalseConfig;
      return { type, items: c.items.map((i) => ({ statement: i.statement })) };
    }
    case "timed_quiz": {
      const c = config as TimedQuizConfig;
      return { type, items: c.items.map((i) => ({ question: i.question, options: i.options })), time_limit_s: c.time_limit_s ?? 15 };
    }
    case "find_errors": {
      const c = config as FindErrorsConfig;
      return { type, image_url: c.image_url, count: c.hotspots.length, max_wrong_clicks: c.max_wrong_clicks ?? 5 };
    }
    case "match_pairs": {
      const c = config as MatchPairsConfig;
      const perm = permutation(c.pairs.length, seed);
      return { type, left: c.pairs.map((p) => p.left), right: perm.map((orig) => c.pairs[orig].right) };
    }
    case "new_habits": {
      const c = config as NewHabitsConfig;
      return { type, items: c.items.map((i) => ({ situation: i.situation, options: i.options })) };
    }
  }
}

export function itemCount(type: ActivityType, config: unknown): number {
  switch (type) {
    case "find_errors": return (config as FindErrorsConfig).hotspots.length;
    case "match_pairs": return (config as MatchPairsConfig).pairs.length;
    default: return (config as { items: unknown[] }).items.length;
  }
}

// ---------------------------------------------------------------------------
// Correção no servidor
// ---------------------------------------------------------------------------
export type Answer =
  | { kind: "bool"; value: boolean }
  | { kind: "choice"; index: number | null } // null = tempo esgotado
  | { kind: "pair"; left: number; right: number } // right = posição na coluna embaralhada
  | { kind: "click"; x: number; y: number };

export type CheckResult =
  | { status: "correct"; itemIndex: number; explanation: string; label?: string; hotspot?: { x: number; y: number; w: number; h: number } }
  | { status: "wrong"; itemIndex: number }
  | { status: "ignored" }; // ex.: clique em hotspot já encontrado

export function checkAnswer(
  type: ActivityType,
  config: unknown,
  itemIndex: number,
  answer: Answer,
  seed: string,
  alreadyCorrect: Set<number> = new Set(),
): CheckResult {
  switch (type) {
    case "true_false": {
      const it = (config as TrueFalseConfig).items[itemIndex];
      if (!it || answer.kind !== "bool") return { status: "ignored" };
      return answer.value === it.answer
        ? { status: "correct", itemIndex, explanation: it.explanation }
        : { status: "wrong", itemIndex };
    }
    case "timed_quiz":
    case "new_habits": {
      const it = (config as TimedQuizConfig | NewHabitsConfig).items[itemIndex];
      if (!it || answer.kind !== "choice") return { status: "ignored" };
      return answer.index !== null && answer.index === it.correct_index
        ? { status: "correct", itemIndex, explanation: it.explanation }
        : { status: "wrong", itemIndex };
    }
    case "match_pairs": {
      const c = config as MatchPairsConfig;
      if (answer.kind !== "pair") return { status: "ignored" };
      const left = answer.left;
      if (!c.pairs[left] || alreadyCorrect.has(left)) return { status: "ignored" };
      const perm = permutation(c.pairs.length, seed);
      const orig = perm[answer.right];
      if (orig === undefined) return { status: "ignored" };
      return orig === left
        ? { status: "correct", itemIndex: left, explanation: c.pairs[left].explanation }
        : { status: "wrong", itemIndex: left };
    }
    case "find_errors": {
      const c = config as FindErrorsConfig;
      if (answer.kind !== "click") return { status: "ignored" };
      // tolerância de 2% ao redor do retângulo (dedo no celular)
      const tol = 2;
      const idx = c.hotspots.findIndex((h) =>
        answer.x >= h.x - tol && answer.x <= h.x + h.w + tol &&
        answer.y >= h.y - tol && answer.y <= h.y + h.h + tol);
      if (idx === -1) return { status: "wrong", itemIndex: -1 };
      if (alreadyCorrect.has(idx)) return { status: "ignored" };
      const h = c.hotspots[idx];
      return { status: "correct", itemIndex: idx, explanation: h.explanation, label: h.label, hotspot: { x: h.x, y: h.y, w: h.w, h: h.h } };
    }
  }
}

/** Configuração em branco para o editor. */
export function emptyConfig(type: ActivityType): unknown {
  const five = <T,>(f: (i: number) => T) => Array.from({ length: 5 }, (_, i) => f(i));
  switch (type) {
    case "true_false": return { items: five(() => ({ statement: "", answer: true, explanation: "" })) };
    case "timed_quiz": return { items: five(() => ({ question: "", options: ["", "", "", ""], correct_index: 0, explanation: "" })), time_limit_s: 15 };
    case "find_errors": return { image_url: "", hotspots: [], max_wrong_clicks: 5 };
    case "match_pairs": return { pairs: five(() => ({ left: "", right: "", explanation: "" })) };
    case "new_habits": return { items: five(() => ({ situation: "", options: ["", "", ""], correct_index: 0, explanation: "" })) };
  }
}
