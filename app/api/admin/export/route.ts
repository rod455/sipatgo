import { getAdminContext } from "@/lib/auth";
import { accessCsv, activityLogCsv, attendanceCsv, awardsCsv, certificatesCsv, learningCsv, rankingCsv, sectorsCsv } from "@/lib/reports";

export const dynamic = "force-dynamic";

const TYPES = { acessos: accessCsv, atividades: activityLogCsv, presenca: attendanceCsv, ranking: rankingCsv, setores: sectorsCsv, brindes: awardsCsv, aprendizado: learningCsv, certificados: certificatesCsv } as const;

export async function GET(req: Request) {
  const ctx = await getAdminContext();
  if (!ctx?.campaign) return new Response("Não autorizado", { status: 401 });
  const type = new URL(req.url).searchParams.get("tipo") as keyof typeof TYPES;
  const fn = TYPES[type];
  if (!fn) return new Response("Tipo inválido", { status: 400 });
  const csv = await fn(ctx.campaign.id);
  const name = `${ctx.adminCompany.slug}-${type}-${ctx.campaign.start_date}.csv`;
  return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="${name}"` } });
}
