import Link from "next/link";
import { requireViewer } from "@/lib/auth";
import { sql } from "@/lib/db";
import { getToday } from "@/lib/game";
import { Avatar } from "@/components/avatar/Avatar";
import { Confetti } from "@/components/app/Confetti";
import { Alert, Card, buttonClass } from "@/components/ui";
import { cn } from "@/lib/utils";

export default async function PodiumPage() {
  const { participant: p, company } = await requireViewer();
  const today = await getToday(p, company);
  if (today?.campaign.phase !== "closed") return <Alert tone="amber">O pódio é revelado no encerramento da campanha (sexta, 18h).</Alert>;
  const top = await sql<{ participant_id: string; name: string; sector: string; avatar_config: unknown; total_points: number; position: number }[]>`
    select participant_id, name, sector, avatar_config, total_points, position::int from sipatgo.v_ranking_individual
     where campaign_id = ${p.campaign_id} order by position, name limit 3`;
  const [sector] = await sql<{ sector: string; avg_points: number; adhesion_pct: number }[]>`
    select sector, avg_points, adhesion_pct from sipatgo.v_ranking_sector where campaign_id = ${p.campaign_id} order by position limit 1`;
  const [stats] = await sql<{ people: number; active: number; completions: number; prizes: number; posts: number; certs: number }[]>`
    select (select count(*)::int from sipatgo.participants where campaign_id = ${p.campaign_id} and role in ('participant','leader')) as people,
           (select count(*)::int from sipatgo.participant_scores where campaign_id = ${p.campaign_id} and days_completed > 0) as active,
           (select count(*)::int from sipatgo.day_completions dc join sipatgo.campaign_days d on d.id = dc.campaign_day_id where d.campaign_id = ${p.campaign_id}) as completions,
           (select count(*)::int from sipatgo.prize_awards a join sipatgo.prizes pr on pr.id = a.prize_id where pr.campaign_id = ${p.campaign_id}) as prizes,
           (select count(*)::int from sipatgo.wall_posts where campaign_id = ${p.campaign_id} and status = 'approved') as posts,
           (select count(*)::int from sipatgo.certificates where campaign_id = ${p.campaign_id}) as certs`;
  const order = [top[1], top[0], top[2]].filter(Boolean);
  return (
    <div className="space-y-6">
      <Confetti big />
      <div className="text-center"><p className="text-sm font-semibold uppercase tracking-wider text-brand">{today.campaign.name}</p><h1 className="font-display text-3xl font-extrabold">Pódio final 🏆</h1></div>
      <div className="flex items-end justify-center gap-3">
        {order.map((t) => (
          <div key={t.participant_id} className="flex w-28 flex-col items-center text-center">
            <Avatar config={t.avatar_config} seed={t.participant_id} size={t.position === 1 ? 84 : 64} ring={t.participant_id === p.id} />
            <p className="mt-1 line-clamp-2 text-sm font-semibold leading-tight">{t.name}</p>
            <p className="text-[11px] text-slate-500">{t.sector}</p>
            <div className={cn("mt-2 flex w-full items-start justify-center rounded-t-xl pt-2 font-display text-2xl font-extrabold text-brand-fg",
              t.position === 1 ? "h-28 bg-brand" : t.position === 2 ? "h-20 bg-brand-2" : "h-14 bg-brand-2/80")}>{t.position}º</div>
            <p className="mt-1 font-display text-sm font-bold tabular">{t.total_points} pts</p>
          </div>
        ))}
      </div>
      {sector && (
        <Card className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Setor campeão</p>
          <p className="font-display text-2xl font-extrabold">🤝 {sector.sector}</p>
          <p className="text-sm text-slate-500">média de {sector.avg_points} pts · adesão {sector.adhesion_pct}%</p>
        </Card>
      )}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[["participaram", stats.active], ["dias concluídos", stats.completions], ["brindes", stats.prizes], ["posts no mural", stats.posts], ["certificados", stats.certs], ["pessoas", stats.people]].map(([k, v]) => (
          <Card key={k as string} className="p-3"><p className="font-display text-xl font-extrabold tabular">{v}</p><p className="text-[11px] text-slate-500">{k}</p></Card>
        ))}
      </div>
      <Link href="/app/perfil#certificado" className={buttonClass("primary", "lg", "w-full")}>Meu certificado</Link>
    </div>
  );
}
