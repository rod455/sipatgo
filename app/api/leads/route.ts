import { NextResponse } from "next/server";
import { HONEYPOT_FIELD, leadSchema } from "@/components/site/lead-schema";
import { sql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Recebe leads do site público: salva em sipatgo.leads (nunca se perde) e
 * repassa ao n8n, que envia o e-mail:
 * POST { event: "lead.created", data, occurred_at } para LEADS_WEBHOOK_URL,
 * ou sipatgo.app_settings.leads_webhook_url, ou NOTIFICATIONS_WEBHOOK_URL.
 * Falha no banco ou no webhook nunca vira erro 500 para o visitante.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    const ct = req.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      body = (await req.json()) as Record<string, unknown>;
    } else {
      const form = await req.formData();
      body = Object.fromEntries(Array.from(form.entries()).map(([k, v]) => [k, typeof v === "string" ? v : ""]));
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }

  // Honeypot: bot preencheu o campo invisível. Responde ok sem fazer nada.
  const trap = body?.[HONEYPOT_FIELD];
  if (typeof trap === "string" && trap.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return NextResponse.json({ ok: false, error: "Confira os campos destacados.", fieldErrors }, { status: 422 });
  }

  const payload = {
    event: "lead.created",
    data: {
      ...parsed.data,
      user_agent: req.headers.get("user-agent") ?? undefined,
      referer: req.headers.get("referer") ?? undefined,
    },
    occurred_at: new Date().toISOString(),
  };

  const d = payload.data;
  let leadId: string | null = null;
  try {
    const [row] = await sql<{ id: string }[]>`
      insert into sipatgo.leads (nome, email, empresa, cargo, pessoas, mes, mensagem, origem, user_agent, referer)
      values (${d.nome}, ${d.email}, ${d.empresa}, ${d.cargo ?? null}, ${d.pessoas}, ${d.mes ?? null}, ${d.mensagem ?? null},
              ${d.origem}, ${d.user_agent?.slice(0, 400) ?? null}, ${d.referer?.slice(0, 400) ?? null})
      returning id`;
    leadId = row.id;
  } catch (err) {
    console.error("[leads] Falha ao salvar no banco:", err instanceof Error ? err.message : err, "Lead:", JSON.stringify(payload));
  }

  let url = process.env.LEADS_WEBHOOK_URL;
  if (!url) {
    try {
      const [s] = await sql<{ value: string }[]>`select value from sipatgo.app_settings where key = 'leads_webhook_url'`;
      url = s?.value;
    } catch {
      /* segue para o fallback */
    }
  }
  url = url || process.env.NOTIFICATIONS_WEBHOOK_URL;
  if (!url) {
    console.info("[leads] Nenhum webhook configurado. Lead salvo:", leadId);
    return NextResponse.json({ ok: true });
  }

  let error: string | null = null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);
    if (!res.ok) error = `Webhook respondeu ${res.status}`;
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }
  if (error) console.error("[leads] Falha ao avisar:", error, "Lead:", leadId);
  if (leadId) {
    await sql`update sipatgo.leads set notified = ${!error}, notify_error = ${error} where id = ${leadId}`.catch(() => undefined);
  }

  return NextResponse.json({ ok: true });
}
