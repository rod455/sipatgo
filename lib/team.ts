import { sql } from "./db";
import { now } from "./clock";
import { HttpError } from "./auth";
import { localDate } from "./dates";
import { loadCampaign, loadDays } from "./game";
import { currentDayIndex } from "./wall";
import { notify } from "./notify";
import type { Participant } from "./types";

export type TeamMember = {
  id: string; name: string; email: string | null; avatar_config: unknown; total_points: number; days_completed: number;
  today: "done" | "makeup" | "pending" | "none";
  days: Record<number, "done" | "makeup" | "none">;
};

export async function teamOverview(leader: Participant) {
  if (leader.role !== "leader" && leader.role !== "admin" && leader.role !== "superadmin") throw new HttpError(403, "Apenas líderes.");
  if (!leader.campaign_id) throw new HttpError(400, "Sem campanha.");
  const c = (await loadCampaign(leader.campaign_id))!;
  const days = await loadDays(c.id);
  const today = currentDayIndex(c, days, now());
  const rows = await sql<{ id: string; name: string; email: string | null; avatar_config: unknown; total_points: number; days_completed: number; statuses: { d: number; s: string }[] }[]>`
    select p.id, p.name, p.email, p.avatar_config,
           coalesce(s.total_points, 0) as total_points, coalesce(s.days_completed, 0) as days_completed,
           coalesce((select json_agg(json_build_object('d', a.day_index, 's', a.status)) from sipatgo.v_attendance a where a.participant_id = p.id), '[]') as statuses
      from sipatgo.participants p left join sipatgo.participant_scores s on s.participant_id = p.id
     where p.campaign_id = ${c.id} and p.sector = ${leader.sector} and p.role in ('participant','leader')
     order by p.name`;
  const members: TeamMember[] = rows.map((r) => {
    const map: TeamMember["days"] = {};
    for (const s of r.statuses) map[s.d] = s.s as "done" | "makeup" | "none";
    const t = today ? map[today] ?? "none" : "none";
    return { ...r, days: map, today: today ? (t === "none" ? "pending" : t) : "none" };
  });
  const [sector] = await sql<{ position: number; avg_points: number; adhesion_pct: number; sectors: number }[]>`
    select position::int, avg_points, adhesion_pct,
           (select count(*)::int from sipatgo.v_ranking_sector where campaign_id = ${c.id}) as sectors
      from sipatgo.v_ranking_sector where campaign_id = ${c.id} and sector = ${leader.sector}`;
  const doneToday = members.filter((m) => m.today === "done" || m.today === "makeup").length;
  const dateKey = localDate(now(), c.timezone);
  const [nudged] = await sql`select 1 from sipatgo.notification_log where dedupe_key = ${`nudge:${leader.id}:${dateKey}`}`;
  return {
    campaign: c, sector: leader.sector, today, members, sectorRank: sector ?? null,
    adhesionToday: members.length ? Math.round((100 * doneToday) / members.length) : 0,
    nudgedToday: !!nudged,
  };
}

/** Líder dispara lembrete para os pendentes do setor (máx. 1/dia). */
export async function leaderNudge(leader: Participant) {
  const o = await teamOverview(leader);
  if (!o.today) throw new HttpError(400, "A campanha ainda não começou.");
  const pending = o.members.filter((m) => m.today === "pending" && m.id !== leader.id);
  if (!pending.length) throw new HttpError(400, "Todo mundo do time já jogou hoje! 🎉");
  const dateKey = localDate(now(), o.campaign.timezone);
  const r = await notify({
    companyId: leader.company_id, campaignId: o.campaign.id, event: "leader.nudge",
    data: {
      leader: leader.name, sector: leader.sector, day_index: o.today,
      recipients: pending.map((m) => ({ name: m.name, email: m.email })),
    },
    dedupeKey: `nudge:${leader.id}:${dateKey}`,
  });
  if (r.duplicate) throw new HttpError(429, "Você já enviou o lembrete hoje.");
  return { sent: pending.length, withEmail: pending.filter((m) => m.email).length };
}
