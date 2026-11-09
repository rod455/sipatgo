import { sql, type Tx } from "./db";
import { now } from "./clock";
import {
  canPlay, campaignPhase, dayState, isClosed, isMakeupNow, makeupDeadline, releaseAt,
  type DayState,
} from "./calendar";
import {
  checkAnswer, itemCount, permutation, publicConfig, type Answer, type ActivityType, type PublicActivity,
} from "./activities";
import { itemScore, videoScore, VIDEO_MIN_PCT, type ActivityScoring } from "./scoring";
import { evaluateBadges } from "./badges";
import { HttpError } from "./auth";
import { pingScores } from "./realtime";
import type { Activity, Campaign, CampaignDay, Company, Participant } from "./types";

export type ClockCampaign = Campaign & { timezone: string };

export async function loadCampaign(campaignId: string): Promise<ClockCampaign | null> {
  const [c] = await sql<ClockCampaign[]>`
    select ca.*, co.timezone from sipatgo.campaigns ca
      join sipatgo.companies co on co.id = ca.company_id
     where ca.id = ${campaignId}`;
  return c ?? null;
}

export async function loadDays(campaignId: string): Promise<CampaignDay[]> {
  return sql<CampaignDay[]>`select * from sipatgo.campaign_days where campaign_id = ${campaignId} order by day_index`;
}

// ---------------------------------------------------------------------------
// Estado da semana para o participante (get-today)
// ---------------------------------------------------------------------------
export type DaySummary = {
  id: string; day_index: number; date: string; title: string; theme: string;
  state: DayState; release_at: string; has_wheel: boolean;
  video_done: boolean; items_correct: number; items_total: number;
  points: number; wheel_available: boolean; wheel_spun: boolean; activity_type: ActivityType | null;
};

export type TodayState = {
  campaign: { id: string; name: string; theme: string; phase: ReturnType<typeof campaignPhase>; makeup_deadline: string; opening_message: string | null; opening_video_url: string | null; wall_challenge: string | null; makeup_factor: number };
  days: DaySummary[];
  current_day_index: number | null;
};

export async function getToday(p: Participant, company: Company): Promise<TodayState | null> {
  if (!p.campaign_id) return null;
  const c = await loadCampaign(p.campaign_id);
  if (!c) return null;
  const t = now();
  const days = await loadDays(c.id);

  const rows = await sql<{
    day_id: string; video_done: boolean; items_correct: number; items_total: number | null;
    completion_makeup: boolean | null; points: number; spun: boolean; activity_type: ActivityType | null;
  }[]>`
    select d.id as day_id,
           exists(select 1 from sipatgo.video_views v where v.participant_id = ${p.id} and v.campaign_day_id = d.id and v.completed_at is not null) as video_done,
           (select count(*)::int from sipatgo.attempts a where a.participant_id = ${p.id} and a.activity_id = ac.id and a.is_correct) as items_correct,
           case ac.type when 'find_errors' then jsonb_array_length(ac.config->'hotspots')
                        when 'match_pairs' then jsonb_array_length(ac.config->'pairs')
                        else jsonb_array_length(ac.config->'items') end as items_total,
           dc.is_makeup as completion_makeup,
           coalesce((select sum(a.points_awarded + a.bonus_awarded)::int from sipatgo.attempts a where a.participant_id = ${p.id} and a.activity_id = ac.id), 0)
             + coalesce((select v.points_awarded from sipatgo.video_views v where v.participant_id = ${p.id} and v.campaign_day_id = d.id), 0) as points,
           exists(select 1 from sipatgo.wheel_spins w where w.participant_id = ${p.id} and w.campaign_day_id = d.id) as spun,
           ac.type as activity_type
      from sipatgo.campaign_days d
      left join sipatgo.activities ac on ac.campaign_day_id = d.id
      left join sipatgo.day_completions dc on dc.campaign_day_id = d.id and dc.participant_id = ${p.id}
     where d.campaign_id = ${c.id}`;
  const byDay = new Map(rows.map((r) => [r.day_id, r]));

  const summaries: DaySummary[] = days.map((d) => {
    const r = byDay.get(d.id);
    const completion = r?.completion_makeup === null || r?.completion_makeup === undefined ? null : { is_makeup: r.completion_makeup };
    const state = dayState(c, d, t, completion, !!p.preview_all);
    return {
      id: d.id, day_index: d.day_index, date: d.date, title: d.title, theme: d.theme,
      state, release_at: releaseAt(c, d).toISOString(), has_wheel: d.has_wheel,
      video_done: !!r?.video_done, items_correct: r?.items_correct ?? 0, items_total: r?.items_total ?? 5,
      points: r?.points ?? 0,
      wheel_available: d.has_wheel && state === "done" && !r?.spun && !isClosed(c, t),
      wheel_spun: !!r?.spun,
      activity_type: r?.activity_type ?? null,
    };
  });

  const current = summaries.find((s) => s.state === "available") ?? null;
  void company;
  return {
    campaign: {
      id: c.id, name: c.name, theme: c.theme, phase: campaignPhase(c, t, days[0]),
      makeup_deadline: makeupDeadline(c).toISOString(),
      opening_message: c.opening_message, opening_video_url: c.opening_video_url,
      wall_challenge: c.wall_challenge, makeup_factor: c.makeup_factor,
    },
    days: summaries,
    current_day_index: current?.day_index ?? null,
  };
}

// ---------------------------------------------------------------------------
// Contexto de um dia (valida acesso)
// ---------------------------------------------------------------------------
export async function dayContext(p: Participant, dayIndex: number) {
  if (!p.campaign_id) throw new HttpError(404, "Você não está em uma campanha ativa.");
  const c = await loadCampaign(p.campaign_id);
  if (!c) throw new HttpError(404, "Campanha não encontrada.");
  const [day] = await sql<CampaignDay[]>`
    select * from sipatgo.campaign_days where campaign_id = ${c.id} and day_index = ${dayIndex}`;
  if (!day) throw new HttpError(404, "Dia não encontrado.");
  const [completion] = await sql<{ is_makeup: boolean }[]>`
    select is_makeup from sipatgo.day_completions where participant_id = ${p.id} and campaign_day_id = ${day.id}`;
  const t = now();
  const state = dayState(c, day, t, completion ?? null, !!p.preview_all);
  const [activity] = await sql<Activity[]>`select * from sipatgo.activities where campaign_day_id = ${day.id}`;
  return { campaign: c, day, state, activity: activity ?? null, now: t, makeup: !p.preview_all && isMakeupNow(c, day, t) };
}

function assertPlayable(state: DayState) {
  if (state === "locked") throw new HttpError(403, "Este dia ainda não foi liberado.");
  if (state === "missed") throw new HttpError(403, "O prazo para este dia terminou.");
}

// ---------------------------------------------------------------------------
// Vídeo
// ---------------------------------------------------------------------------
export async function startVideo(p: Participant, dayIndex: number) {
  const ctx = await dayContext(p, dayIndex);
  assertPlayable(ctx.state);
  await sql`
    insert into sipatgo.video_views (participant_id, campaign_day_id, started_at, is_makeup)
    values (${p.id}, ${ctx.day.id}, ${ctx.now}, ${ctx.makeup})
    on conflict (participant_id, campaign_day_id) do nothing`;
  return { ok: true };
}

export async function completeVideo(p: Participant, dayIndex: number, watchedPct: number) {
  const ctx = await dayContext(p, dayIndex);
  if (!canPlay(ctx.state) && ctx.state !== "done" && ctx.state !== "done_makeup") assertPlayable(ctx.state);
  if (!(watchedPct >= VIDEO_MIN_PCT)) throw new HttpError(400, "Assista o vídeo até o fim para liberar a dinâmica.");

  const [view] = await sql<{ started_at: Date; completed_at: Date | null }[]>`
    select started_at, completed_at from sipatgo.video_views where participant_id = ${p.id} and campaign_day_id = ${ctx.day.id}`;
  if (!view) throw new HttpError(400, "Inicie o vídeo antes de concluí-lo.");
  if (view.completed_at) return { ok: true, points: 0, already: true };

  // anti-fraude: tempo mínimo de reprodução medido no servidor (85% da duração)
  const dur = ctx.day.video_duration_s ?? 0;
  const elapsed = (ctx.now.getTime() - new Date(view.started_at).getTime()) / 1000;
  if (dur > 0 && elapsed < dur * 0.85 - 2) {
    throw new HttpError(400, "Parece que o vídeo foi adiantado. Assista até o fim para liberar a dinâmica.");
  }
  const points = canPlay(ctx.state) ? videoScore(ctx.makeup, ctx.campaign.makeup_factor) : 0;
  await sql`
    update sipatgo.video_views
       set watched_pct = ${Math.min(1, watchedPct)}, completed_at = ${ctx.now}, is_makeup = ${ctx.makeup}, points_awarded = ${points}
     where participant_id = ${p.id} and campaign_day_id = ${ctx.day.id} and completed_at is null`;
  pingScores(ctx.campaign.id);
  return { ok: true, points };
}

// ---------------------------------------------------------------------------
// Dinâmica
// ---------------------------------------------------------------------------
export type ActivityView = {
  activity_id: string; type: ActivityType; public: PublicActivity; total: number;
  correct: { item_index: number; explanation: string; label?: string; hotspot?: { x: number; y: number; w: number; h: number } }[];
  wrong_attempts: number[]; // por item
  points: number; is_makeup: boolean; state: DayState; video_done: boolean; bonus_window_s: number;
  matched_right?: Record<number, number>; // match_pairs: posição direita → índice esquerdo já acertado
};

function seedFor(p: Participant, activityId: string) {
  return `${p.id}:${activityId}`;
}

export async function getActivityView(p: Participant, dayIndex: number): Promise<ActivityView> {
  const ctx = await dayContext(p, dayIndex);
  if (ctx.state === "locked") throw new HttpError(403, "Este dia ainda não foi liberado.");
  if (!ctx.activity) throw new HttpError(404, "A dinâmica deste dia ainda não foi configurada.");
  const a = ctx.activity;
  const [video] = await sql<{ done: boolean }[]>`
    select completed_at is not null as done from sipatgo.video_views where participant_id = ${p.id} and campaign_day_id = ${ctx.day.id}`;
  const attempts = await sql<{ item_index: number; is_correct: boolean; points: number }[]>`
    select item_index, is_correct, points_awarded + bonus_awarded as points
      from sipatgo.attempts where participant_id = ${p.id} and activity_id = ${a.id} order by created_at`;
  const total = itemCount(a.type, a.config);
  const wrong = Array(total).fill(0);
  const correct: ActivityView["correct"] = [];
  for (const at of attempts) {
    if (at.is_correct) {
      const res = explanationFor(a, at.item_index);
      correct.push({ item_index: at.item_index, ...res });
    } else if (at.item_index >= 0) wrong[at.item_index]++;
  }
  let matched_right: Record<number, number> | undefined;
  if (a.type === "match_pairs") {
    const perm = permutation(total, seedFor(p, a.id));
    matched_right = {};
    for (const c of correct) matched_right[perm.indexOf(c.item_index)] = c.item_index;
  }
  return {
    matched_right,
    activity_id: a.id, type: a.type, public: publicConfig(a.type, a.config, seedFor(p, a.id)), total, correct,
    wrong_attempts: wrong, points: attempts.reduce((s, x) => s + x.points, 0), is_makeup: ctx.makeup,
    state: ctx.state, video_done: !!video?.done || !ctx.day.youtube_video_id, bonus_window_s: a.bonus_window_s,
  };
}

function explanationFor(a: Activity, idx: number): { explanation: string; label?: string; hotspot?: { x: number; y: number; w: number; h: number } } {
  const cfg = a.config as Record<string, unknown>;
  if (a.type === "find_errors") {
    const h = (cfg.hotspots as { x: number; y: number; w: number; h: number; label: string; explanation: string }[])[idx];
    return h ? { explanation: h.explanation, label: h.label, hotspot: { x: h.x, y: h.y, w: h.w, h: h.h } } : { explanation: "" };
  }
  if (a.type === "match_pairs") return { explanation: (cfg.pairs as { explanation: string }[])[idx]?.explanation ?? "" };
  return { explanation: (cfg.items as { explanation: string }[])[idx]?.explanation ?? "" };
}

/** start-item: zera o relógio do servidor para o próximo item. */
export async function startItem(p: Participant, dayIndex: number) {
  const ctx = await dayContext(p, dayIndex);
  if (!ctx.activity) throw new HttpError(404, "Dinâmica não configurada.");
  if (!canPlay(ctx.state)) return { ok: true };
  await sql`
    insert into sipatgo.activity_clocks (participant_id, activity_id, started_at, wrong_streak)
    values (${p.id}, ${ctx.activity.id}, ${ctx.now}, 0)
    on conflict (participant_id, activity_id) do update set started_at = excluded.started_at`;
  return { ok: true };
}

export type SubmitResult = {
  status: "correct" | "wrong" | "ignored";
  item_index: number;
  points: number;
  bonus: number;
  explanation?: string;
  label?: string;
  hotspot?: { x: number; y: number; w: number; h: number };
  elapsed_ms: number;
  timed_out?: boolean;
  day_completed: boolean;
  new_badges: string[];
  hint?: boolean;
  hint_rect?: { x: number; y: number; w: number; h: number };
};

// Rate limit simples em memória (por instância): máx 30 envios / 10s
const recent = new Map<string, number[]>();
function rateLimit(key: string, max = 30, windowMs = 10_000) {
  const t = Date.now();
  const arr = (recent.get(key) ?? []).filter((x) => t - x < windowMs);
  if (arr.length >= max) throw new HttpError(429, "Calma! Muitas respostas em sequência.");
  arr.push(t);
  recent.set(key, arr);
  if (recent.size > 5000) recent.clear();
}

export async function submitItem(p: Participant, dayIndex: number, itemIndex: number, answer: Answer): Promise<SubmitResult> {
  rateLimit(p.id);
  const ctx = await dayContext(p, dayIndex);
  assertPlayable(ctx.state);
  if (ctx.state === "done" || ctx.state === "done_makeup") throw new HttpError(400, "Você já concluiu este dia.");
  const a = ctx.activity;
  if (!a) throw new HttpError(404, "Dinâmica não configurada.");

  const [video] = await sql<{ done: boolean }[]>`
    select completed_at is not null as done from sipatgo.video_views where participant_id = ${p.id} and campaign_day_id = ${ctx.day.id}`;
  if (ctx.day.youtube_video_id && !video?.done) throw new HttpError(400, "Assista o vídeo antes da dinâmica.");

  const seed = seedFor(p, a.id);
  const result = await sql.begin(async (tx: Tx) => {
    // trava a linha do relógio: serializa envios simultâneos do mesmo participante
    const [clock] = await tx<{ started_at: Date; wrong_streak: number }[]>`
      insert into sipatgo.activity_clocks (participant_id, activity_id, started_at)
      values (${p.id}, ${a.id}, ${ctx.now})
      on conflict (participant_id, activity_id) do update set participant_id = excluded.participant_id
      returning started_at, wrong_streak`;
    await tx`select 1 from sipatgo.activity_clocks where participant_id = ${p.id} and activity_id = ${a.id} for update`;

    const done = await tx<{ item_index: number }[]>`
      select item_index from sipatgo.attempts where participant_id = ${p.id} and activity_id = ${a.id} and is_correct`;
    const already = new Set(done.map((d) => d.item_index));
    const elapsed = Math.max(0, ctx.now.getTime() - new Date(clock.started_at).getTime());

    let check = checkAnswer(a.type, a.config, itemIndex, answer, seed, already);
    let timedOut = false;
    if (a.type === "timed_quiz") {
      const limit = ((a.config as { time_limit_s?: number }).time_limit_s ?? 15) * 1000;
      if (elapsed > limit + 2500 && check.status === "correct") {
        check = { status: "wrong", itemIndex };
        timedOut = true;
      }
      if (answer.kind === "choice" && answer.index === null) timedOut = true;
    }
    if (check.status === "ignored") {
      return { status: "ignored" as const, item_index: itemIndex, points: 0, bonus: 0, elapsed_ms: elapsed, day_completed: false, new_badges: [] };
    }
    if (check.status === "correct" && already.has(check.itemIndex)) {
      return { status: "ignored" as const, item_index: check.itemIndex, points: 0, bonus: 0, elapsed_ms: elapsed, day_completed: false, new_badges: [] };
    }

    // nº da tentativa para o item
    let attemptNo: number;
    if (a.type === "find_errors") {
      attemptNo = clock.wrong_streak + 1; // erros desde o último acerto
    } else {
      const [{ n }] = await tx<{ n: number }[]>`
        select count(*)::int as n from sipatgo.attempts
         where participant_id = ${p.id} and activity_id = ${a.id} and item_index = ${check.itemIndex}`;
      attemptNo = n + 1;
    }

    const isCorrect = check.status === "correct";
    const score = itemScore({
      isCorrect, isFirstAttempt: attemptNo === 1, isMakeup: ctx.makeup,
      makeupFactor: ctx.campaign.makeup_factor, elapsedMs: elapsed, scoring: a as ActivityScoring,
    });

    await tx`
      insert into sipatgo.attempts (participant_id, activity_id, item_index, attempt_no, is_correct, response_time_ms, points_awarded, bonus_awarded, is_makeup, created_at)
      values (${p.id}, ${a.id}, ${check.itemIndex}, ${attemptNo}, ${isCorrect}, ${Math.min(elapsed, 2_000_000_000)}, ${score.points}, ${score.bonus}, ${ctx.makeup}, ${ctx.now})`;

    // relógio recomeça a cada envio (o cliente chama start-item ao exibir o próximo item)
    const maxWrong = (a.config as { max_wrong_clicks?: number }).max_wrong_clicks ?? 5;
    const newStreak = a.type === "find_errors" ? (isCorrect ? 0 : clock.wrong_streak + 1) : 0;
    await tx`
      update sipatgo.activity_clocks set started_at = ${ctx.now}, wrong_streak = ${newStreak}
       where participant_id = ${p.id} and activity_id = ${a.id}`;

    let dayCompleted = false;
    const total = itemCount(a.type, a.config);
    if (isCorrect && already.size + 1 >= total) {
      dayCompleted = await completeDayTx(tx, p, ctx.day, a, ctx.makeup, ctx.now);
    }

    return {
      status: check.status,
      item_index: check.itemIndex,
      points: score.points,
      bonus: score.bonus,
      explanation: isCorrect && check.status === "correct" ? check.explanation : undefined,
      label: check.status === "correct" ? check.label : undefined,
      hotspot: check.status === "correct" ? check.hotspot : undefined,
      elapsed_ms: elapsed,
      timed_out: timedOut || undefined,
      day_completed: dayCompleted,
      new_badges: [] as string[],
      hint: a.type === "find_errors" && !isCorrect && newStreak >= maxWrong ? true : undefined,
      hint_rect: a.type === "find_errors" && !isCorrect && newStreak >= maxWrong ? hintRect(a, already) : undefined,
    };
  });

  if (result.status !== "ignored") pingScores(ctx.campaign.id);
  if (result.day_completed) {
    result.new_badges = await evaluateBadges(p.id);
  }
  return result as SubmitResult;
}

function hintRect(a: Activity, found: Set<number>) {
  const hs = (a.config as { hotspots: { x: number; y: number; w: number; h: number }[] }).hotspots;
  const i = hs.findIndex((_, idx) => !found.has(idx));
  if (i < 0) return undefined;
  const h = hs[i];
  // área ampliada, para dar a dica sem entregar o ponto exato
  return { x: Math.max(0, h.x - 8), y: Math.max(0, h.y - 8), w: Math.min(100, h.w + 16), h: Math.min(100, h.h + 16) };
}

/** complete-day: grava day_completions quando todos os itens foram acertados. */
async function completeDayTx(tx: Tx, p: Participant, day: CampaignDay, a: Activity, makeup: boolean, t: Date): Promise<boolean> {
  const [agg] = await tx<{ points: number; time_ms: number; first: number; bonus: number }[]>`
    select coalesce(sum(points_awarded + bonus_awarded), 0)::int as points,
           coalesce(sum(response_time_ms) filter (where is_correct), 0)::int as time_ms,
           count(*) filter (where is_correct and attempt_no = 1)::int as first,
           coalesce(sum(bonus_awarded), 0)::int as bonus
      from sipatgo.attempts where participant_id = ${p.id} and activity_id = ${a.id}`;
  const [video] = await tx<{ points: number }[]>`
    select points_awarded as points from sipatgo.video_views where participant_id = ${p.id} and campaign_day_id = ${day.id}`;
  const rows = await tx`
    insert into sipatgo.day_completions (participant_id, campaign_day_id, completed_at, is_makeup, total_points, total_time_ms, correct_first_try, bonus_points)
    values (${p.id}, ${day.id}, ${t}, ${makeup}, ${agg.points + (video?.points ?? 0)}, ${agg.time_ms}, ${agg.first}, ${agg.bonus})
    on conflict (participant_id, campaign_day_id) do nothing
    returning id`;
  return rows.length > 0;
}

// ---------------------------------------------------------------------------
// Resultado do dia
// ---------------------------------------------------------------------------
export async function dayResult(p: Participant, dayIndex: number) {
  const ctx = await dayContext(p, dayIndex);
  const [comp] = await sql<{ total_points: number; correct_first_try: number; bonus_points: number; is_makeup: boolean; completed_at: Date }[]>`
    select * from sipatgo.day_completions where participant_id = ${p.id} and campaign_day_id = ${ctx.day.id}`;
  const [video] = await sql<{ points_awarded: number }[]>`
    select points_awarded from sipatgo.video_views where participant_id = ${p.id} and campaign_day_id = ${ctx.day.id}`;
  const [items] = ctx.activity
    ? await sql<{ base: number; bonus: number; first: number; retry: number }[]>`
        select coalesce(sum(points_awarded),0)::int as base, coalesce(sum(bonus_awarded),0)::int as bonus,
               count(*) filter (where is_correct and attempt_no = 1)::int as first,
               count(*) filter (where is_correct and attempt_no > 1)::int as retry
          from sipatgo.attempts where participant_id = ${p.id} and activity_id = ${ctx.activity.id}`
    : [{ base: 0, bonus: 0, first: 0, retry: 0 }];
  const [spin] = await sql<{ id: string }[]>`
    select id from sipatgo.wheel_spins where participant_id = ${p.id} and campaign_day_id = ${ctx.day.id}`;
  const [rank] = await sql<{ position: number; total: number }[]>`
    select position::int, (select count(*)::int from sipatgo.v_ranking_individual where campaign_id = ${ctx.campaign.id}) as total
      from sipatgo.v_ranking_individual where participant_id = ${p.id}`;
  const badges = await sql<{ code: string; name: string; icon: string; awarded_at: Date }[]>`
    select b.code, b.name, b.icon, pb.awarded_at from sipatgo.participant_badges pb
      join sipatgo.badges b on b.code = pb.badge_code
     where pb.participant_id = ${p.id} and pb.awarded_at >= ${comp?.completed_at ?? ctx.now}::timestamptz - interval '2 minutes'
     order by b.sort`;
  return {
    day: { index: ctx.day.day_index, title: ctx.day.title, theme: ctx.day.theme },
    completed: !!comp,
    is_makeup: comp?.is_makeup ?? ctx.makeup,
    video_points: video?.points_awarded ?? 0,
    item_points: items.base,
    bonus_points: items.bonus,
    correct_first_try: items.first,
    correct_retry: items.retry,
    total: (video?.points_awarded ?? 0) + items.base + items.bonus,
    position: rank?.position ?? null,
    participants: rank?.total ?? null,
    wheel_available: ctx.day.has_wheel && !!comp && !comp.is_makeup && !spin && !isClosed(ctx.campaign, ctx.now),
    badges,
  };
}
