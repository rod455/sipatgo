import { NextResponse } from "next/server";
import { HONEYPOT_FIELD, leadSchema } from "@/components/site/lead-schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Recebe leads do site público e repassa ao n8n:
 * POST { event: "lead.created", data, occurred_at } para LEADS_WEBHOOK_URL (ou NOTIFICATIONS_WEBHOOK_URL).
 * Falha no webhook nunca vira erro 500 para o visitante.
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

  const url = process.env.LEADS_WEBHOOK_URL || process.env.NOTIFICATIONS_WEBHOOK_URL;
  if (!url) {
    console.info("[leads] Nenhum webhook configurado (LEADS_WEBHOOK_URL / NOTIFICATIONS_WEBHOOK_URL). Lead:", JSON.stringify(payload));
    return NextResponse.json({ ok: true });
  }

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
    if (!res.ok) console.error(`[leads] Webhook respondeu ${res.status}. Lead:`, JSON.stringify(payload));
  } catch (err) {
    console.error("[leads] Falha ao chamar o webhook:", err instanceof Error ? err.message : err, "Lead:", JSON.stringify(payload));
  }

  return NextResponse.json({ ok: true });
}
