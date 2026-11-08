import { sql } from "./db";
import { now } from "./clock";
import { HttpError } from "./auth";
import { loadCampaign, loadDays } from "./game";
import { currentDayIndex } from "./wall";
import type { Participant } from "./types";

export type RankRow = {
  participant_id: string; name: string; sector: string; avatar_config: unknown;
  points: number; position: number; badges: string[]; me: boolean;
};
export type SectorRow = { sector: string; members: number; avg_points: number; adhesion_pct: number; position: number; mine: boolean };

export async function getRanking(p: Participant, tab: "general" | "today" | "sector", day?: number) {
  if (!p.campaign_id) throw new HttpError(400, "Sem campanha.");
  const c = await loadCampaign(p.campaign_id);
  if (!c) throw new HttpError(404, "Campanha não encontrada.");
  if (tab === "sector") {
    const rows = await sql<SectorRow[]>`
      select sector, members, avg_points, coalesce(adhesion_pct, 0) as adhesion_pct, position::int, sector = ${p.sector} as mine
        from sipatgo.v_ranking_sector where campaign_id = ${c.id} order by position, sector`;
    return { tab, rows };
  }
  if (tab === "today") {
    const days = await loadDays(c.id);
    const d = day ?? currentDayIndex(c, days, now()) ?? 1;
    const rows = await sql<RankRow[]>`
      select p.id as participant_id, p.name, p.sector, p.avatar_config,
             coalesce(r.points, 0)::int as points,
             (rank() over (order by coalesce(r.points, 0) desc, coalesce(r.time_ms, 9e15) asc))::int as position,
             coalesce((select array_agg(pb.badge_code) from sipatgo.participant_badges pb where pb.participant_id = p.id), '{}') as badges,
             p.id = ${p.id} as me
        from sipatgo.participants p
        left join sipatgo.v_ranking_daily r on r.participant_id = p.id and r.day_index = ${d}
       where p.campaign_id = ${c.id} and p.role in ('participant','leader')
       order by position, p.name`;
    return { tab, day: d, rows };
  }
  const rows = await sql<RankRow[]>`
    select participant_id, name, sector, avatar_config, total_points as points, position::int, badges,
           participant_id = ${p.id} as me
      from sipatgo.v_ranking_individual where campaign_id = ${c.id}
     order by position, name`;
  return { tab, rows };
}
