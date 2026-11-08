import { sql } from "./db";
import { now } from "./clock";
import { isClosed, releaseAt } from "./calendar";
import { addDays, localDate, localMinutes, zonedInstant } from "./dates";
import { loadDays, type ClockCampaign } from "./game";
import { closeCampaign } from "./close";
import { electDailyWinner, votingDeadline } from "./wall";
import { notify } from "./notify";
import { campaignUrl } from "./utils";

/**
 * Job único e idempotente ("tick"), chamado a cada hora (Vercel Cron ou pg_cron).
 * Cada ação usa dedupe_key, então rodar várias vezes não duplica nada.
 *  - 08h  day.released        (liberação do dia + lembrete geral)
 *  - 14h  reminder.pending    (quem ainda não fez o dia)
 *  - 20h  daily.summary       (resumo para o RH)
 *  - 00h  mural: mais votado do dia anterior
 *  - sexta 18h: close-campaign
 */
export async function runTick(at: Date = now()) {
  const campaigns = await sql<(ClockCampaign & { slug: string })[]>`
    select ca.*, co.timezone, co.slug from sipatgo.campaigns ca join sipatgo.companies co on co.id = ca.company_id
     where ca.status in ('scheduled','active')`;
  const log: string[] = [];

  for (const c of campaigns) {
    const days = await loadDays(c.id);
    if (!days.length) continue;

    if (isClosed(c, at)) {
      await closeCampaign(c.id);
      log.push(`${c.id}: closed`);
      continue;
    }
    if (c.status === "scheduled" && at >= releaseAt(c, days[0])) {
      await sql`update sipatgo.campaigns set status = 'active' where id = ${c.id}`;
      log.push(`${c.id}: activated`);
    }

    const today = localDate(at, c.timezone);
    const minutes = localMinutes(at, c.timezone);
    const day = days.find((d) => d.date === today);
    const url = campaignUrl(c.slug);

    if (day) {
      const rel = releaseAt(c, day);
      // liberação (até 6h depois do horário, para não disparar retroativo)
      if (at >= rel && at.getTime() - rel.getTime() < 6 * 3600_000) {
        const r = await notify({
          companyId: c.company_id, campaignId: c.id, event: "day.released",
          data: { day_index: day.day_index, title: day.title, theme: day.theme, url },
          dedupeKey: `release:${day.id}`,
        });
        if (r.sent || r.skipped) log.push(`${c.id}: released d${day.day_index}`);
      }
      // lembrete 14h para quem não concluiu
      if (minutes >= 14 * 60 && minutes < 20 * 60) {
        const pending = await sql<{ name: string; email: string }[]>`
          select p.name, p.email from sipatgo.participants p
           where p.campaign_id = ${c.id} and p.role in ('participant','leader') and p.email is not null and p.email <> ''
             and not exists (select 1 from sipatgo.day_completions dc where dc.participant_id = p.id and dc.campaign_day_id = ${day.id})`;
        await notify({
          companyId: c.company_id, campaignId: c.id, event: "reminder.pending",
          data: { day_index: day.day_index, title: day.title, url, makeup_reminder: day.day_index === 4, recipients: pending },
          dedupeKey: `reminder:${day.id}`,
        });
      }
      // resumo 20h
      if (minutes >= 20 * 60) {
        const [s] = await sql<{ total: number; done: number; makeup: number; spins: number; posts: number }[]>`
          select
            (select count(*)::int from sipatgo.participants where campaign_id = ${c.id} and role in ('participant','leader')) as total,
            (select count(*)::int from sipatgo.day_completions where campaign_day_id = ${day.id} and not is_makeup) as done,
            (select count(*)::int from sipatgo.day_completions dc join sipatgo.campaign_days d on d.id = dc.campaign_day_id
               where d.campaign_id = ${c.id} and dc.is_makeup and dc.completed_at::date = ${today}::date) as makeup,
            (select count(*)::int from sipatgo.wheel_spins where campaign_day_id = ${day.id}) as spins,
            (select count(*)::int from sipatgo.wall_posts where campaign_id = ${c.id} and status = 'pending') as posts`;
        await notify({
          companyId: c.company_id, campaignId: c.id, event: "daily.summary",
          data: { day_index: day.day_index, ...s, adhesion_pct: s.total ? Math.round((100 * s.done) / s.total) : 0 },
          dedupeKey: `summary:${day.id}`,
        });
      }
    }

    // mural: elege o vencedor de cada dia já encerrado (até a votação fechar)
    const vd = votingDeadline(c, days);
    for (const d of days) {
      const dayOver = at >= zonedInstant(addDays(d.date, 1), "00:00", c.timezone);
      const votingDay = zonedInstant(d.date, "00:00", c.timezone) <= vd;
      if (dayOver && votingDay) {
        const [exists] = await sql`select 1 from sipatgo.wall_daily_winners where campaign_id = ${c.id} and day_index = ${d.day_index}`;
        if (!exists) {
          const w = await electDailyWinner(c.id, d.day_index);
          if (w) log.push(`${c.id}: wall winner d${d.day_index}`);
        }
      }
    }
  }
  return { ran_at: at.toISOString(), campaigns: campaigns.length, log };
}
