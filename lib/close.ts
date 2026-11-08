import { sql } from "./db";
import { now } from "./clock";
import { randomCode } from "./codes";
import { certificateHours } from "./scoring";
import { awardBadges } from "./badges";
import { notify } from "./notify";
import { pingScores } from "./realtime";
import { appBaseUrl } from "./utils";
import { isClosed } from "./calendar";
import { loadCampaign } from "./game";

/** close-campaign: idempotente. Congela, premia pódio/setor e emite certificados. */
export async function closeCampaign(campaignId: string) {
  const c = await loadCampaign(campaignId);
  if (!c) return null;
  const firstClose = c.status !== "closed";
  if (firstClose) {
    await sql`update sipatgo.campaigns set status = 'closed', closed_at = coalesce(closed_at, ${now()}) where id = ${campaignId}`;
  }

  const podium = await sql<{ participant_id: string; name: string; sector: string; total_points: number; position: number }[]>`
    select participant_id, name, sector, total_points, position::int from sipatgo.v_ranking_individual
     where campaign_id = ${campaignId} and total_points > 0 order by position, name limit 3`;
  for (const p of podium) await awardBadges(p.participant_id, ["podium"]);

  const [sector] = await sql<{ sector: string; avg_points: number }[]>`
    select sector, avg_points from sipatgo.v_ranking_sector where campaign_id = ${campaignId} and position = 1 order by sector limit 1`;
  if (sector && sector.avg_points > 0) {
    const members = await sql<{ id: string }[]>`
      select id from sipatgo.participants where campaign_id = ${campaignId} and sector = ${sector.sector} and role in ('participant','leader')`;
    for (const m of members) await awardBadges(m.id, ["team_winner"]);
  }

  const issued = await issueCertificates(campaignId);

  if (firstClose) {
    void notify({
      companyId: c.company_id, campaignId, event: "campaign.closed",
      data: {
        podium: podium.map((p) => ({ position: p.position, name: p.name, sector: p.sector, points: p.total_points })),
        sector_winner: sector?.sector ?? null, certificates: issued,
        report_url: `${appBaseUrl()}/admin/relatorios`,
      },
      dedupeKey: `closed:${campaignId}`,
    });
  }
  pingScores(campaignId);
  return { podium, sector: sector?.sector ?? null, certificates: issued };
}

export async function issueCertificates(campaignId: string): Promise<number> {
  const c = await loadCampaign(campaignId);
  if (!c) return 0;
  const days = await sql<{ video_duration_s: number | null }[]>`
    select video_duration_s from sipatgo.campaign_days where campaign_id = ${campaignId}`;
  const hours = certificateHours(days.map((d) => d.video_duration_s ?? 0), days.length || 5);
  const eligible = await sql<{ participant_id: string; days_completed: number }[]>`
    select s.participant_id, s.days_completed from sipatgo.participant_scores s
      join sipatgo.participants p on p.id = s.participant_id
     where s.campaign_id = ${campaignId} and s.days_completed >= ${c.min_days_for_certificate}
       and p.role in ('participant','leader')
       and not exists (select 1 from sipatgo.certificates ce where ce.participant_id = s.participant_id and ce.campaign_id = ${campaignId})`;
  for (const e of eligible) {
    const code = `${randomCode(4)}-${randomCode(4)}-${randomCode(2)}`;
    await sql`
      insert into sipatgo.certificates (participant_id, campaign_id, code, hours, days_completed)
      values (${e.participant_id}, ${campaignId}, ${code}, ${hours}, ${e.days_completed})
      on conflict (participant_id, campaign_id) do nothing`;
  }
  return eligible.length;
}

/** Garante o fechamento "preguiçoso" se o job ainda não rodou. */
export async function ensureClosedIfDue(campaignId: string) {
  const c = await loadCampaign(campaignId);
  if (c && c.status !== "closed" && c.status !== "draft" && isClosed(c, now())) await closeCampaign(campaignId);
}
