import { describe, expect, it } from "vitest";
import { isValidCpf, maskCpf, normalizeCpf } from "@/lib/cpf";
import { isWinSlot, pickWeighted, rollWin, slotFor, WHEEL_SLOTS } from "@/lib/wheel";
import { badgesFromFacts } from "@/lib/badges";
import { generateWordSearch, matchSelection } from "@/lib/wordsearch";
import { checkinToken, parseCheckinToken, verifyCheckinMac } from "@/lib/checkin";
import { parseYoutubeId } from "@/lib/youtube";

describe("cpf", () => {
  it("normaliza, valida e mascara", () => {
    expect(normalizeCpf("123.456.789-09")).toBe("12345678909");
    expect(isValidCpf("123.456.789-09")).toBe(true);
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidCpf("123.456.789-00")).toBe(false);
    expect(maskCpf("12345678909")).toBe("***.456.789-**");
  });
});

describe("roleta", () => {
  const prizes = [
    { id: "a", weight: 1, stock_available: 5, active: true },
    { id: "b", weight: 3, stock_available: 5, active: true },
    { id: "c", weight: 100, stock_available: 0, active: true },
    { id: "d", weight: 100, stock_available: 5, active: false },
  ];
  it("nunca sorteia esgotado ou inativo e respeita pesos", () => {
    const counts: Record<string, number> = {};
    for (let i = 0; i < 4000; i++) {
      const p = pickWeighted(prizes)!;
      counts[p.id] = (counts[p.id] ?? 0) + 1;
    }
    expect(counts.c).toBeUndefined();
    expect(counts.d).toBeUndefined();
    expect(counts.b / counts.a).toBeGreaterThan(2.3);
    expect(counts.b / counts.a).toBeLessThan(3.9);
  });
  it("sem estoque = null", () => expect(pickWeighted([{ id: "x", weight: 1, stock_available: 0, active: true }])).toBeNull());
  it("chance de ganhar respeita o % configurado", () => {
    expect(rollWin(0)).toBe(false);
    expect(rollWin(100)).toBe(true);
    let wins = 0;
    for (let i = 0; i < 20000; i++) if (rollWin(30)) wins++;
    expect(wins / 20000).toBeGreaterThan(0.28);
    expect(wins / 20000).toBeLessThan(0.32);
  });
  it("a casa sorteada combina com o resultado e cobre todas as casas", () => {
    const seen = new Set<number>();
    for (let i = 0; i < 4000; i++) {
      const won = i % 2 === 0;
      const s = slotFor(won);
      expect(isWinSlot(s)).toBe(won);
      seen.add(s);
    }
    expect(seen.size).toBe(WHEEL_SLOTS);
  });
});

describe("badges", () => {
  const tz = "America/Sao_Paulo";
  const comp = (d: number, extra: Partial<{ is_makeup: boolean; correct_first_try: number; bonus_points: number; completed_at: Date }> = {}) => ({
    day_index: d, is_makeup: false, correct_first_try: 3, bonus_points: 10, completed_at: new Date(`2026-12-0${6 + d}T15:00:00Z`), ...extra,
  });
  const base = { approvedPosts: 0, topPosts: 0, familyDone: 0, checkins: 0, timezone: tz };
  it("sequências", () => {
    expect(badgesFromFacts({ ...base, completions: [comp(1), comp(2)] })).toEqual(["first_day"]);
    expect(badgesFromFacts({ ...base, completions: [comp(1), comp(2), comp(3)] })).toContain("streak_3");
    expect(badgesFromFacts({ ...base, completions: [comp(1), comp(2, { is_makeup: true }), comp(3), comp(4)] })).not.toContain("streak_3");
    expect(badgesFromFacts({ ...base, completions: [1, 2, 3, 4, 5].map((d) => comp(d)) })).toContain("streak_5");
  });
  it("gabaritou, nota máxima, relâmpago, madrugador", () => {
    const perfect = [1, 2, 3, 4, 5].map((d) => comp(d, { correct_first_try: 5 }));
    const b = badgesFromFacts({ ...base, completions: perfect });
    expect(b).toContain("perfect_day");
    expect(b).toContain("perfect_week");
    expect(badgesFromFacts({ ...base, completions: [comp(2, { bonus_points: 80 })] })).toContain("speedster");
    expect(badgesFromFacts({ ...base, completions: [comp(2, { completed_at: new Date("2026-12-08T11:30:00Z") })] })).toContain("early_bird"); // 08:30
    expect(badgesFromFacts({ ...base, completions: [comp(2, { completed_at: new Date("2026-12-08T12:30:00Z") })] })).not.toContain("early_bird");
  });
  it("social, família, presença", () => {
    const b = badgesFromFacts({ ...base, completions: [], approvedPosts: 1, topPosts: 1, familyDone: 5, checkins: 1 });
    expect(b).toEqual(expect.arrayContaining(["social", "top_post", "family", "family_week", "present"]));
  });
});

describe("caça-palavras", () => {
  it("coloca as palavras e reconhece seleção nos dois sentidos", () => {
    const ws = generateWordSearch(["Capacete", "Luva", "Óculos", "Bota", "Protetor", "EPI"], "seed-1");
    expect(ws.grid).toHaveLength(10);
    expect(ws.words).toContain("OCULOS");
    for (const p of ws.placements) {
      const end: [number, number] = [p.row + p.dr * (p.word.length - 1), p.col + p.dc * (p.word.length - 1)];
      expect(matchSelection(ws, [p.row, p.col], end)).toBe(p.word);
      expect(matchSelection(ws, end, [p.row, p.col])).toBe(p.word);
    }
  });
});

describe("check-in e youtube", () => {
  it("token HMAC", () => {
    const id = "6f1c2b3a-1111-4222-8333-944455556666";
    const t = checkinToken(id, "abc");
    const parsed = parseCheckinToken(t)!;
    expect(parsed.eventId).toBe(id);
    expect(verifyCheckinMac(id, "abc", parsed.mac)).toBe(true);
    expect(verifyCheckinMac(id, "outro", parsed.mac)).toBe(false);
  });
  it("extrai id do youtube", () => {
    expect(parseYoutubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=1")).toBe("dQw4w9WgXcQ");
    expect(parseYoutubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(parseYoutubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(parseYoutubeId("nada")).toBeNull();
  });
});
