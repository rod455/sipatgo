import { describe, expect, it } from "vitest";
import { certificateHours, itemScore, maxDailyPoints, speedBonus, videoScore } from "@/lib/scoring";

describe("speedBonus", () => {
  it("segue a fórmula linear round(20*max(0,20-t)/20)", () => {
    expect(speedBonus(0)).toBe(20);
    expect(speedBonus(5_000)).toBe(15);
    expect(speedBonus(10_000)).toBe(10);
    expect(speedBonus(19_000)).toBe(1);
    expect(speedBonus(19_600)).toBe(0);
    expect(speedBonus(20_000)).toBe(0);
    expect(speedBonus(60_000)).toBe(0);
    expect(speedBonus(2_500)).toBe(18); // 17.5 → 18
  });
});

describe("itemScore", () => {
  const base = { makeupFactor: 0.5, elapsedMs: 4_000 };
  it("1ª tentativa correta: 100 + bônus", () => {
    expect(itemScore({ ...base, isCorrect: true, isFirstAttempt: true, isMakeup: false })).toEqual({ points: 100, bonus: 16 });
  });
  it("refazer correto: 50 sem bônus", () => {
    expect(itemScore({ ...base, isCorrect: true, isFirstAttempt: false, isMakeup: false })).toEqual({ points: 50, bonus: 0 });
  });
  it("erro: 0", () => {
    expect(itemScore({ ...base, isCorrect: false, isFirstAttempt: true, isMakeup: false })).toEqual({ points: 0, bonus: 0 });
  });
  it("recuperação: 50% e sem bônus", () => {
    expect(itemScore({ ...base, isCorrect: true, isFirstAttempt: true, isMakeup: true })).toEqual({ points: 50, bonus: 0 });
    expect(itemScore({ ...base, isCorrect: true, isFirstAttempt: false, isMakeup: true })).toEqual({ points: 25, bonus: 0 });
  });
});

describe("dia", () => {
  it("máximo diário = 650", () => expect(maxDailyPoints()).toBe(650));
  it("vídeo 50 / 25 em recuperação", () => {
    expect(videoScore(false, 0.5)).toBe(50);
    expect(videoScore(true, 0.5)).toBe(25);
  });
  it("carga horária = vídeos + 10 min/dia, arredondada para cima em meia hora", () => {
    expect(certificateHours([120, 120, 120, 120, 120], 5)).toBe(1); // 10 + 50 = 60 min
    expect(certificateHours([600, 600, 600, 600, 600], 5)).toBe(2); // 50 + 50 = 100 min → 2h
  });
});
