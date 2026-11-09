import { sql } from "./db";

/**
 * E-mail transacional via webhook do n8n (Gmail). URL e chave ficam em
 * sipatgo.app_settings (mail_webhook_url / mail_webhook_key) ou nas variáveis
 * MAIL_WEBHOOK_URL / MAIL_WEBHOOK_KEY. Retorna false se não enviou.
 */
export async function sendMail(msg: { to: string; subject: string; html: string }): Promise<boolean> {
  let url = process.env.MAIL_WEBHOOK_URL;
  let key = process.env.MAIL_WEBHOOK_KEY;
  if (!url || !key) {
    const rows = await sql<{ key: string; value: string }[]>`
      select key, value from sipatgo.app_settings where key in ('mail_webhook_url', 'mail_webhook_key')`;
    url ||= rows.find((r) => r.key === "mail_webhook_url")?.value;
    key ||= rows.find((r) => r.key === "mail_webhook_key")?.value;
  }
  if (!url || !key) {
    console.error("[mail] Webhook de e-mail não configurado.");
    return false;
  }
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 10_000);
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-sipatgo-key": key },
      body: JSON.stringify(msg),
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(t);
    if (!res.ok) console.error("[mail] Webhook respondeu", res.status);
    return res.ok;
  } catch (err) {
    console.error("[mail] Falha:", err instanceof Error ? err.message : err);
    return false;
  }
}
