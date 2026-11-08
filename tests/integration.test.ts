/**
 * Simulação da semana contra um Postgres real.
 * Roda só com TEST_DATABASE_URL (banco descartável!):
 *   TEST_DATABASE_URL=postgres://... npx vitest run tests/integration.test.ts
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const url = process.env.TEST_DATABASE_URL;
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined, set: () => {}, delete: () => {} }) }));
vi.mock("next/navigation", () => ({ redirect: (u: string) => { throw new Error(`redirect ${u}`); } }));

describe.skipIf(!url)("semana simulada (integração)", () => {
  let sql: import("postgres").Sql;
  let game: typeof import("@/lib/game");
  let prizes: typeof import("@/lib/prizes");
  let close: typeof import("@/lib/close");
  let wall: typeof import("@/lib/wall");
  let jobs: typeof import("@/lib/jobs");
  let checkins: typeof import("@/lib/checkins");
  let ranking: typeof import("@/lib/ranking");
  let companyId: string, campaignId: string;
  const P: Record<string, import("@/lib/types").Participant> = {};
  const setNow = (iso: string) => { process.env.FAKE_NOW = iso; };

  async function reload(id: string) {
    const [p] = await sql<import("@/lib/types").Participant[]>`select * from sipatgo.participants where id = ${id}`;
    return p;
  }

  beforeAll(async () => {
    process.env.DATABASE_URL = url;
    const { db } = await import("@/lib/db");
    sql = db();
    await sql.unsafe("drop schema if exists sipatgo cascade");
    const dir = join(process.cwd(), "supabase", "migrations");
    for (const f of readdirSync(dir).sort()) await sql.unsafe(readFileSync(join(dir, f), "utf8"));

    game = await import("@/lib/game");
    prizes = await import("@/lib/prizes");
    close = await import("@/lib/close");
    wall = await import("@/lib/wall");
    jobs = await import("@/lib/jobs");
    checkins = await import("@/lib/checkins");
    ranking = await import("@/lib/ranking");
    const { createCampaignWithDefaults } = await import("@/lib/defaults");

    [{ id: companyId }] = await sql`insert into sipatgo.companies (slug, name) values ('acme', 'ACME') returning id`;
    campaignId = await createCampaignWithDefaults(sql, companyId, { name: "SIPAT 2026", theme: "Prevenção", start_date: "2026-12-07", status: "scheduled", withPrizes: true });
    await sql`update sipatgo.campaign_days set video_duration_s = 60, youtube_video_id = 'dQw4w9WgXcQ' where campaign_id = ${campaignId}`;
    const people = [
      ["ana", "Ana Lima", "Produção"], ["bruno", "Bruno Souza", "Produção"], ["carla", "Carla Dias", "Logística"], ["davi", "Davi Reis", "Logística"],
    ];
    let n = 0;
    for (const [k, name, sector] of people) {
      const cpf = String(10000000000 + n++);
      const [p] = await sql`insert into sipatgo.participants (company_id, campaign_id, name, cpf, birth_date, sector, pin_set)
                             values (${companyId}, ${campaignId}, ${name}, ${cpf}, '1990-01-01', ${sector}, true) returning *`;
      P[k] = p as never;
    }
  });

  afterAll(async () => { delete process.env.FAKE_NOW; await sql?.end(); });

  async function playDay(p: import("@/lib/types").Participant, day: number, opts: { wrongFirst?: boolean; seconds?: number; startIso: string }) {
    setNow(opts.startIso);
    await game.startVideo(p, day);
    const t0 = new Date(opts.startIso).getTime();
    setNow(new Date(t0 + 61_000).toISOString());
    await game.completeVideo(p, day, 1);
    const view = await game.getActivityView(p, day);
    const [act] = await sql<{ type: string; config: Record<string, unknown> }[]>`select type, config from sipatgo.activities where id = ${view.activity_id}`;
    let t = t0 + 62_000;
    let last: import("@/lib/game").SubmitResult | null = null;
    for (let i = 0; i < 5; i++) {
      setNow(new Date(t).toISOString());
      await game.startItem(p, day);
      t += (opts.seconds ?? 5) * 1000;
      setNow(new Date(t).toISOString());
      const right = answerFor(act.type, act.config, i, view);
      if (opts.wrongFirst && i === 0) {
        const wrong = wrongFor(act.type, act.config, i, view);
        const w = await game.submitItem(p, day, i, wrong);
        expect(w.status).toBe("wrong");
        t += 1000; setNow(new Date(t).toISOString());
      }
      last = await game.submitItem(p, day, i, right);
      expect(last.status).toBe("correct");
    }
    return last!;
  }

  function answerFor(type: string, cfg: Record<string, unknown>, i: number, view: import("@/lib/game").ActivityView): import("@/lib/activities").Answer {
    if (type === "true_false") return { kind: "bool", value: (cfg.items as { answer: boolean }[])[i].answer };
    if (type === "timed_quiz" || type === "new_habits") return { kind: "choice", index: (cfg.items as { correct_index: number }[])[i].correct_index };
    if (type === "match_pairs") {
      const right = (cfg.pairs as { right: string }[])[i].right;
      return { kind: "pair", left: i, right: (view.public as { right: string[] }).right.indexOf(right) };
    }
    const h = (cfg.hotspots as { x: number; y: number; w: number; h: number }[])[i];
    return { kind: "click", x: h.x + h.w / 2, y: h.y + h.h / 2 };
  }
  function wrongFor(type: string, cfg: Record<string, unknown>, i: number, view: import("@/lib/game").ActivityView): import("@/lib/activities").Answer {
    if (type === "true_false") return { kind: "bool", value: !(cfg.items as { answer: boolean }[])[i].answer };
    if (type === "find_errors") return { kind: "click", x: 99, y: 2 };
    if (type === "match_pairs") {
      const right = (cfg.pairs as { right: string }[])[(i + 1) % 5].right;
      return { kind: "pair", left: i, right: (view.public as { right: string[] }).right.indexOf(right) };
    }
    const c = (cfg.items as { correct_index: number }[])[i].correct_index;
    return { kind: "choice", index: c === 0 ? 1 : 0 };
  }

  it("bloqueia antes das 08h e libera às 08h", async () => {
    setNow("2026-12-07T10:00:00Z");
    await expect(game.startVideo(P.ana, 1)).rejects.toThrow(/liberado/);
    setNow("2026-12-07T11:00:00Z");
    const today = await game.getToday(P.ana, {} as never);
    expect(today!.days.map((d) => d.state)).toEqual(["available", "locked", "locked", "locked", "locked"]);
  });

  it("não aceita dinâmica sem vídeo e barra vídeo adiantado", async () => {
    setNow("2026-12-07T11:10:00Z");
    await expect(game.submitItem(P.davi, 1, 0, { kind: "bool", value: true })).rejects.toThrow(/vídeo/);
    await game.startVideo(P.davi, 1);
    setNow("2026-12-07T11:10:10Z");
    await expect(game.completeVideo(P.davi, 1, 1)).rejects.toThrow(/adiantado/);
  });

  it("dia perfeito rápido = 50 + 500 + bônus; badges", async () => {
    const r = await playDay(P.ana, 1, { startIso: "2026-12-07T11:05:00Z", seconds: 2 }); // 08:05 local
    expect(r.day_completed).toBe(true);
    expect(r.new_badges).toEqual(expect.arrayContaining(["first_day", "perfect_day", "speedster", "early_bird"]));
    const [s] = await sql`select total_points, days_completed from sipatgo.participant_scores where participant_id = ${P.ana.id}`;
    expect(s.total_points).toBe(50 + 500 + 5 * 18); // 2s → bônus 18
    expect(s.days_completed).toBe(1);
  });

  it("refazer vale 50 sem bônus", async () => {
    await playDay(P.bruno, 1, { startIso: "2026-12-07T15:00:00Z", seconds: 10, wrongFirst: true });
    const [s] = await sql`select total_points from sipatgo.participant_scores where participant_id = ${P.bruno.id}`;
    expect(s.total_points).toBe(50 + 50 + 4 * 110);
  });

  it("recuperação no dia seguinte vale 50%, sem bônus e sem roleta", async () => {
    await playDay(P.carla, 1, { startIso: "2026-12-08T13:00:00Z", seconds: 1 });
    const [s] = await sql`select total_points from sipatgo.participant_scores where participant_id = ${P.carla.id}`;
    expect(s.total_points).toBe(25 + 5 * 50);
    const [dc] = await sql`select is_makeup from sipatgo.day_completions where participant_id = ${P.carla.id}`;
    expect(dc.is_makeup).toBe(true);
  });

  it("roleta na quarta: sorteia, baixa estoque, código e 1 giro só", async () => {
    await playDay(P.ana, 2, { startIso: "2026-12-08T11:30:00Z" });
    await playDay(P.ana, 3, { startIso: "2026-12-09T11:30:00Z" });
    setNow("2026-12-09T12:00:00Z");
    await expect(prizes.spinWheel(P.ana, 2)).rejects.toThrow(/não tem roleta/);
    const before = await sql`select sum(stock_available)::int as s from sipatgo.prizes where campaign_id = ${campaignId}`;
    const spin = await prizes.spinWheel(P.ana, 3);
    expect(spin.code).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    expect(JSON.stringify(spin)).not.toMatch(/Garrafa|chocolate|Caneca|Vale|Fone/i);
    const again = await prizes.spinWheel(P.ana, 3);
    expect(again.code).toBe(spin.code);
    const after = await sql`select sum(stock_available)::int as s from sipatgo.prizes where campaign_id = ${campaignId}`;
    expect(after[0].s).toBe(before[0].s - 1);
    const [b] = await sql`select 1 from sipatgo.participant_badges where participant_id = ${P.ana.id} and badge_code = 'streak_3'`;
    expect(b).toBeTruthy();
  });

  it("mural: aprovação pontua 30 uma vez por dia; vencedor do dia +100", async () => {
    const [post] = await sql`insert into sipatgo.wall_posts (campaign_id, participant_id, image_path, caption, day_index) values (${campaignId}, ${P.bruno.id}, 'x.jpg', 'Equipe!', 3) returning id`;
    const [post2] = await sql`insert into sipatgo.wall_posts (campaign_id, participant_id, image_path, caption, day_index) values (${campaignId}, ${P.bruno.id}, 'y.jpg', 'De novo', 3) returning id`;
    setNow("2026-12-09T14:00:00Z");
    await wall.moderatePost(P.ana.id, campaignId, post.id, true);
    await wall.moderatePost(P.ana.id, campaignId, post2.id, true);
    const pts = await sql`select points_awarded from sipatgo.wall_posts where participant_id = ${P.bruno.id} order by created_at`;
    expect(pts.map((r) => r.points_awarded).sort()).toEqual([0, 30]);
    expect((await wall.toggleVote(await reload(P.ana.id), post.id)).voted).toBe(true);
    await expect(wall.toggleVote(await reload(P.bruno.id), post.id)).rejects.toThrow(/próprio/);
    const list = await wall.listPosts(campaignId, P.ana.id);
    expect(list.find((p) => p.id === post.id)?.votes).toBe(1);
    await jobs.runTick(new Date("2026-12-10T03:30:00Z")); // 00:30 de quinta
    const [w] = await sql`select post_id from sipatgo.wall_daily_winners where campaign_id = ${campaignId} and day_index = 3`;
    expect(w.post_id).toBe(post.id);
  });

  it("check-in presencial por código, 1 por evento e só na janela", async () => {
    const [ev] = await sql`insert into sipatgo.events (campaign_id, name, starts_at, ends_at, code) values (${campaignId}, 'Palestra', '2026-12-10T12:00:00Z', '2026-12-10T14:00:00Z', 'ABC234') returning *`;
    setNow("2026-12-10T11:00:00Z");
    await expect(checkins.doCheckin(P.davi, "abc-234")).rejects.toThrow(/ainda não abriu/);
    setNow("2026-12-10T12:30:00Z");
    const r = await checkins.doCheckin(P.davi, "abc-234");
    expect(r.points).toBe(100);
    expect(r.new_badges).toContain("present");
    expect((await checkins.doCheckin(P.davi, "ABC234")).already).toBe(true);
    void ev;
  });

  it("ranking geral, setor (média inclui quem não jogou) e encerramento", async () => {
    setNow("2026-12-11T20:00:00Z");
    const g = await ranking.getRanking(P.ana, "general");
    expect((g.rows[0] as { participant_id: string }).participant_id).toBe(P.ana.id);
    const s = await ranking.getRanking(P.ana, "sector");
    expect(s.rows.length).toBe(2);
    setNow("2026-12-11T21:00:00Z"); // sexta 18:00
    await expect(game.startVideo(P.davi, 2)).rejects.toThrow(/prazo/);
    const tick = await jobs.runTick(new Date("2026-12-11T21:05:00Z"));
    expect(tick.log.join(" ")).toContain("closed");
    const [c] = await sql`select status from sipatgo.campaigns where id = ${campaignId}`;
    expect(c.status).toBe("closed");
    const podium = await sql`select participant_id from sipatgo.participant_badges where badge_code = 'podium'`;
    expect(podium.length).toBe(3);
    const team = await sql`select p.sector from sipatgo.participant_badges b join sipatgo.participants p on p.id = b.participant_id where b.badge_code = 'team_winner'`;
    expect(new Set(team.map((r) => r.sector))).toEqual(new Set(["Produção"]));
    const certs = await sql`select * from sipatgo.certificates where campaign_id = ${campaignId}`;
    expect(certs.length).toBe(1); // só Ana tem ≥ 3 dias
    expect(certs[0].participant_id).toBe(P.ana.id);
    await close.closeCampaign(campaignId); // idempotente
    expect((await sql`select count(*)::int as n from sipatgo.certificates`)[0].n).toBe(1);
  });
});
