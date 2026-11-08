import { sql } from "./db";
import { now } from "./clock";

export type NotifyEvent =
  | "prize.awarded" | "day.released" | "reminder.pending" | "leader.nudge"
  | "wall.post_pending" | "campaign.closed" | "daily.summary";

/**
 * Envia um evento para o webhook n8n (URL da company ou NOTIFICATIONS_WEBHOOK_URL).
 * Payload padrão: { event, company_id, campaign_id, data, occurred_at }.
 * `dedupeKey` garante disparo único (jobs idempotentes). Nunca lança erro.
 */
export async function notify(opts: {
  companyId: string;
  campaignId?: string | null;
  event: NotifyEvent;
  data: Record<string, unknown>;
  dedupeKey?: string;
}): Promise<{ sent: boolean; skipped?: boolean; duplicate?: boolean }> {
  const payload = {
    event: opts.event,
    company_id: opts.companyId,
    campaign_id: opts.campaignId ?? null,
    data: opts.data,
    occurred_at: now().toISOString(),
  };
  let logId: string | undefined;
  try {
    const rows = await sql<{ id: string }[]>`
      insert into sipatgo.notification_log (company_id, campaign_id, type, dedupe_key, payload)
      values (${opts.companyId}, ${opts.campaignId ?? null}, ${opts.event}, ${opts.dedupeKey ?? null}, ${sql.json(payload as never)})
      on conflict (dedupe_key) do nothing
      returning id`;
    if (!rows.length) return { sent: false, duplicate: true };
    logId = rows[0].id;

    const [company] = await sql<{ url: string | null }[]>`
      select notifications_webhook_url as url from sipatgo.companies where id = ${opts.companyId}`;
    const url = company?.url || process.env.NOTIFICATIONS_WEBHOOK_URL;
    if (!url) {
      await sql`update sipatgo.notification_log set status = 'skipped', error = 'sem webhook configurado' where id = ${logId}`;
      return { sent: false, skipped: true };
    }
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "user-agent": "SipatGo-Webhook/1.0" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await sql`update sipatgo.notification_log set status = 'sent' where id = ${logId}`;
    return { sent: true };
  } catch (e) {
    if (logId) {
      await sql`update sipatgo.notification_log set status = 'failed', error = ${String((e as Error).message).slice(0, 500)} where id = ${logId}`.catch(() => {});
    }
    console.error("[notify]", opts.event, e);
    return { sent: false };
  }
}
