import { getAdminContext } from "@/lib/auth";
import { attendance, reportSummary } from "@/lib/reports";
import { renderFinalReport } from "@/lib/pdf/report";
import { campaignCompliance } from "@/lib/compliance";
import { sql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  const ctx = await getAdminContext();
  if (!ctx?.campaign) return new Response("Não autorizado", { status: 401 });
  const c = ctx.campaign;
  const [summary, att, compliance, events] = await Promise.all([
    reportSummary(c.id), attendance(c.id), campaignCompliance(c.id),
    sql<{ name: string; starts_at: Date; checkins: number }[]>`
      select e.name, e.starts_at, (select count(*)::int from sipatgo.checkins k where k.event_id = e.id) as checkins
        from sipatgo.events e where e.campaign_id = ${c.id} order by e.starts_at`,
  ]);
  const tz = ctx.adminCompany.timezone;
  const pdf = await renderFinalReport({
    company: ctx.adminCompany.name, campaign: c.name, theme: c.theme, start: c.start_date, end: c.end_date, color: ctx.adminCompany.primary_color,
    generated: new Intl.DateTimeFormat("pt-BR", { timeZone: tz, dateStyle: "short", timeStyle: "short" }).format(new Date()),
    formatDate: (d) => new Intl.DateTimeFormat("pt-BR", { timeZone: tz, dateStyle: "short", timeStyle: "short" }).format(new Date(d)),
  }, summary, att, { cipaApproval: c.cipa_approval, compliance, events });
  return new Response(new Uint8Array(pdf), {
    headers: { "content-type": "application/pdf", "content-disposition": `inline; filename="relatorio-${ctx.adminCompany.slug}-${c.start_date}.pdf"` },
  });
}
