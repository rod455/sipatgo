import { sql } from "./db";
import { localHour } from "./dates";

export type BadgeFacts = {
  completions: { day_index: number; is_makeup: boolean; correct_first_try: number; bonus_points: number; completed_at: Date }[];
  approvedPosts: number;
  topPosts: number;
  familyDone: number;
  checkins: number;
  timezone: string;
};

/** Regras puras (testáveis). Pódio e time campeão são concedidos no encerramento. */
export function badgesFromFacts(f: BadgeFacts): string[] {
  const out: string[] = [];
  const onTime = new Set(f.completions.filter((c) => !c.is_makeup).map((c) => c.day_index));
  if (f.completions.some((c) => c.day_index === 1)) out.push("first_day");
  let run = 0, best = 0;
  for (let i = 1; i <= 5; i++) {
    run = onTime.has(i) ? run + 1 : 0;
    best = Math.max(best, run);
  }
  if (best >= 3) out.push("streak_3");
  if (onTime.size >= 5) out.push("streak_5");
  if (f.completions.some((c) => c.correct_first_try >= 5)) out.push("perfect_day");
  if (f.completions.length >= 5 && f.completions.reduce((s, c) => s + c.correct_first_try, 0) >= 25) out.push("perfect_week");
  if (f.completions.some((c) => c.bonus_points >= 80)) out.push("speedster");
  if (f.completions.some((c) => !c.is_makeup && localHour(new Date(c.completed_at), f.timezone) < 9)) out.push("early_bird");
  if (f.approvedPosts > 0) out.push("social");
  if (f.topPosts > 0) out.push("top_post");
  if (f.familyDone > 0) out.push("family");
  if (f.familyDone >= 5) out.push("family_week");
  if (f.checkins > 0) out.push("present");
  return out;
}

/** Avalia e grava badges novos. Retorna os códigos recém-conquistados. */
export async function evaluateBadges(participantId: string): Promise<string[]> {
  const [p] = await sql<{ campaign_id: string | null; timezone: string }[]>`
    select p.campaign_id, c.timezone from sipatgo.participants p join sipatgo.companies c on c.id = p.company_id
     where p.id = ${participantId}`;
  if (!p?.campaign_id) return [];
  const completions = await sql<BadgeFacts["completions"]>`
    select d.day_index, dc.is_makeup, dc.correct_first_try, dc.bonus_points, dc.completed_at
      from sipatgo.day_completions dc join sipatgo.campaign_days d on d.id = dc.campaign_day_id
     where dc.participant_id = ${participantId} and d.campaign_id = ${p.campaign_id}`;
  const [counts] = await sql<{ posts: number; top: number; family: number; checkins: number }[]>`
    select
      (select count(*)::int from sipatgo.wall_posts where participant_id = ${participantId} and campaign_id = ${p.campaign_id} and status = 'approved') as posts,
      (select count(*)::int from sipatgo.wall_daily_winners w join sipatgo.wall_posts wp on wp.id = w.post_id
        where wp.participant_id = ${participantId} and w.campaign_id = ${p.campaign_id}) as top,
      (select count(*)::int from sipatgo.family_game_completions f
         join sipatgo.family_games g on g.id = f.family_game_id
         join sipatgo.campaign_days d on d.id = g.campaign_day_id
        where f.participant_id = ${participantId} and d.campaign_id = ${p.campaign_id}) as family,
      (select count(*)::int from sipatgo.checkins ck join sipatgo.events e on e.id = ck.event_id
        where ck.participant_id = ${participantId} and e.campaign_id = ${p.campaign_id}) as checkins`;
  const codes = badgesFromFacts({
    completions, approvedPosts: counts.posts, topPosts: counts.top, familyDone: counts.family,
    checkins: counts.checkins, timezone: p.timezone,
  });
  return awardBadges(participantId, codes);
}

export async function awardBadges(participantId: string, codes: string[]): Promise<string[]> {
  if (!codes.length) return [];
  const rows = await sql<{ badge_code: string }[]>`
    insert into sipatgo.participant_badges (participant_id, badge_code)
    select ${participantId}, unnest(${codes}::text[])
    on conflict do nothing
    returning badge_code`;
  return rows.map((r) => r.badge_code);
}
