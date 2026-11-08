import { sql } from "./db";
import { now } from "./clock";
import { loadCampaign, loadDays } from "./game";
import { currentDayIndex } from "./wall";

export async function campaignStats(campaignId: string, dayIndex?: number) {
  const c = (await loadCampaign(campaignId))!;
  const days = await loadDays(campaignId);
  const cur = dayIndex ?? currentDayIndex(c, days, now()) ?? 1;
  const day = days.find((d) => d.day_index === cur) ?? days[0];

  const [totals] = await sql<{ people: number; active: number; first_login: number; done_today: number; completions: number }[]>`
    select (select count(*)::int from sipatgo.participants where campaign_id = ${campaignId} and role in ('participant','leader')) as people,
           (select count(*)::int from sipatgo.participant_scores s join sipatgo.participants p on p.id = s.participant_id
             where s.campaign_id = ${campaignId} and s.days_completed > 0 and p.role in ('participant','leader')) as active,
           (select count(*)::int from sipatgo.participants where campaign_id = ${campaignId} and role in ('participant','leader') and first_login_at is not null) as first_login,
           (select count(*)::int from sipatgo.day_completions where campaign_day_id = ${day?.id ?? null}) as done_today,
           (select count(*)::int from sipatgo.day_completions dc join sipatgo.campaign_days d on d.id = dc.campaign_day_id where d.campaign_id = ${campaignId}) as completions`;

  const sectors = await sql<{ sector: string; members: number; done_today: number; adhesion_pct: number; avg_points: number; position: number }[]>`
    select r.sector, r.members, r.avg_points, coalesce(r.adhesion_pct, 0) as adhesion_pct, r.position::int,
           (select count(*)::int from sipatgo.day_completions dc join sipatgo.participants p on p.id = dc.participant_id
             where dc.campaign_day_id = ${day?.id ?? null} and p.sector = r.sector and p.campaign_id = ${campaignId}) as done_today
      from sipatgo.v_ranking_sector r where r.campaign_id = ${campaignId} order by r.position, r.sector`;

  const [funnel] = day ? await sql<{ accessed: number; video: number; activity: number; wheel: number }[]>`
    select (select count(*)::int from sipatgo.video_views where campaign_day_id = ${day.id}) as accessed,
           (select count(*)::int from sipatgo.video_views where campaign_day_id = ${day.id} and completed_at is not null) as video,
           (select count(*)::int from sipatgo.day_completions where campaign_day_id = ${day.id}) as activity,
           (select count(*)::int from sipatgo.wheel_spins where campaign_day_id = ${day.id}) as wheel` : [{ accessed: 0, video: 0, activity: 0, wheel: 0 }];

  const items = day ? await itemAccuracy(day.id) : [];
  const [pending] = await sql<{ prizes: number; posts: number }[]>`
    select (select count(*)::int from sipatgo.prize_awards a join sipatgo.prizes p on p.id = a.prize_id where p.campaign_id = ${campaignId} and a.status = 'pending') as prizes,
           (select count(*)::int from sipatgo.wall_posts where campaign_id = ${campaignId} and status = 'pending') as posts`;
  return { campaign: c, days, day, totals, sectors, funnel, items, pending };
}

/** Acerto na 1ª tentativa por item (identifica pergunta mal formulada). */
export async function itemAccuracy(campaignDayId: string) {
  const [a] = await sql<{ id: string; type: string; config: Record<string, unknown> }[]>`
    select id, type, config from sipatgo.activities where campaign_day_id = ${campaignDayId}`;
  if (!a) return [];
  const rows = await sql<{ item_index: number; tried: number; first_ok: number; avg_ms: number; wrong: number }[]>`
    select item_index,
           count(distinct participant_id) filter (where is_correct)::int as tried,
           count(*) filter (where is_correct and attempt_no = 1)::int as first_ok,
           coalesce(avg(response_time_ms) filter (where is_correct and attempt_no = 1), 0)::int as avg_ms,
           count(*) filter (where not is_correct)::int as wrong
      from sipatgo.attempts where activity_id = ${a.id} and item_index >= 0 group by item_index order by item_index`;
  const labels = itemLabels(a.type, a.config);
  return labels.map((label, i) => {
    const r = rows.find((x) => x.item_index === i);
    return { index: i, label, tried: r?.tried ?? 0, first_ok: r?.first_ok ?? 0, avg_ms: r?.avg_ms ?? 0, rate: r?.tried ? Math.round((100 * r.first_ok) / r.tried) : null };
  });
}

export function itemLabels(type: string, cfg: Record<string, unknown>): string[] {
  if (type === "find_errors") return ((cfg.hotspots as { label: string }[]) ?? []).map((h, i) => h.label || `Erro ${i + 1}`);
  if (type === "match_pairs") return ((cfg.pairs as { left: string; right: string }[]) ?? []).map((p) => `${p.left} ↔ ${p.right}`);
  return ((cfg.items as Record<string, string>[]) ?? []).map((it) => it.statement ?? it.question ?? it.situation ?? "");
}
