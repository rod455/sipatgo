import { getAdminContext } from "@/lib/auth";
import { attendance, reportSummary } from "@/lib/reports";
import { renderFinalReport } from "@/lib/pdf/report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  const ctx = await getAdminContext();
  if (!ctx?.campaign) return new Response("Não autorizado", { status: 401 });
  const c = ctx.campaign;
  const [summary, att] = await Promise.all([reportSummary(c.id), attendance(c.id)]);
  const pdf = await renderFinalReport({
    company: ctx.adminCompany.name, campaign: c.name, theme: c.theme, start: c.start_date, end: c.end_date, color: ctx.adminCompany.primary_color,
    generated: new Intl.DateTimeFormat("pt-BR", { timeZone: ctx.adminCompany.timezone, dateStyle: "short", timeStyle: "short" }).format(new Date()),
  }, summary, att);
  return new Response(new Uint8Array(pdf), {
    headers: { "content-type": "application/pdf", "content-disposition": `inline; filename="relatorio-${ctx.adminCompany.slug}-${c.start_date}.pdf"` },
  });
}
