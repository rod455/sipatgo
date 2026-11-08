import { describe, expect, it } from "vitest";
import { campaignPhase, dayEndsAt, dayState, isClosed, isMakeupNow, makeupDeadline, releaseAt } from "@/lib/calendar";

const c = { start_date: "2026-12-07", end_date: "2026-12-11", release_time: "08:00:00", makeup_deadline: null, status: "active", timezone: "America/Sao_Paulo" };
const days = [1, 2, 3, 4, 5].map((i) => ({ day_index: i, date: `2026-12-${String(6 + i).padStart(2, "0")}` }));
const at = (iso: string) => new Date(iso);

describe("calendário", () => {
  it("libera às 08:00 de Brasília (11:00 UTC)", () => {
    expect(releaseAt(c, days[0]).toISOString()).toBe("2026-12-07T11:00:00.000Z");
  });
  it("prazo de recuperação = sexta 18:00", () => {
    expect(makeupDeadline(c).toISOString()).toBe("2026-12-11T21:00:00.000Z");
  });
  it("estados ao longo da semana", () => {
    expect(dayState(c, days[0], at("2026-12-07T10:59:00Z"))).toBe("locked");
    expect(dayState(c, days[0], at("2026-12-07T11:00:00Z"))).toBe("available");
    expect(dayState(c, days[0], at("2026-12-08T02:59:00Z"))).toBe("available"); // 23:59 local
    expect(dayState(c, days[0], at("2026-12-08T03:00:00Z"))).toBe("makeup");    // 00:00 local
    expect(dayState(c, days[1], at("2026-12-08T03:00:00Z"))).toBe("locked");
    expect(dayState(c, days[0], at("2026-12-11T20:59:00Z"))).toBe("makeup");
    expect(dayState(c, days[0], at("2026-12-11T21:00:00Z"))).toBe("missed");
    expect(dayState(c, days[0], at("2026-12-07T12:00:00Z"), { is_makeup: false })).toBe("done");
    expect(dayState(c, days[0], at("2026-12-09T12:00:00Z"), { is_makeup: true })).toBe("done_makeup");
  });
  it("sexta: no dia certo até 18h, depois fecha", () => {
    expect(dayEndsAt(c, days[4]).toISOString()).toBe("2026-12-11T21:00:00.000Z");
    expect(isMakeupNow(c, days[4], at("2026-12-11T20:00:00Z"))).toBe(false);
    expect(isClosed(c, at("2026-12-11T21:00:00Z"))).toBe(true);
  });
  it("fase da campanha", () => {
    expect(campaignPhase(c, at("2026-12-01T00:00:00Z"), days[0])).toBe("upcoming");
    expect(campaignPhase(c, at("2026-12-09T15:00:00Z"), days[0])).toBe("running");
    expect(campaignPhase(c, at("2026-12-12T00:00:00Z"), days[0])).toBe("closed");
    expect(campaignPhase({ ...c, status: "draft" }, at("2026-12-09T15:00:00Z"), days[0])).toBe("draft");
  });
});
