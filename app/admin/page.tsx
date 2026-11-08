import Link from "next/link";
import { requireAdminCampaign } from "@/lib/auth";
import { campaignStats } from "@/lib/stats";
import { pct } from "@/lib/utils";
import { ACTIVITY_LABELS, type ActivityType } from "@/lib/activities";
import { sql } from "@/lib/db";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { Card, PageTitle, Pill } from "@/components/ui";
import { cn } from "@/lib/utils";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ dia?: string }> }) {
  const { campaign } = await requireAdminCampaign();
  const dia = Number((await searchParams).dia) || undefined;
  const s = await campaignStats(campaign.id, dia);
  const [act] = s.day ? await sql<{ type: ActivityType }[]>`select type from sipatgo.activities where campaign_day_id = ${s.day.id}` : [];
  const t = s.totals;
  const funnel = [
    { k: "Acessaram o dia", v: s.funnel.accessed },
    { k: "Assistiram o vídeo", v: s.funnel.video },
    { k: "Concluíram a dinâmica", v: s.funnel.activity },
    ...(s.day?.has_wheel ? [{ k: "Giraram a roleta", v: s.funnel.wheel }] : []),
  ];
  return (
    <div className="space-y-6">
      <PageTitle title="Dashboard" subtitle={`${campaign.name} · ${campaign.theme}`} action={<AutoRefresh campaignId={campaign.id} />} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Participantes" value={t.people} />
        <Stat label="Primeiro acesso feito" value={`${pct(t.first_login, t.people)}%`} hint={`${t.first_login} pessoas`} />
        <Stat label={`Adesão do dia ${s.day?.day_index ?? "-"}`} value={`${pct(t.done_today, t.people)}%`} hint={`${t.done_today} concluíram`} />
        <Stat label="Adesão acumulada" value={`${pct(t.active, t.people)}%`} hint={`${t.active} jogaram ≥ 1 dia`} />
      </div>

      <div className="flex flex-wrap gap-2">
        {s.days.map((d) => (
          <Link key={d.id} href={`/admin?dia=${d.day_index}`} className={cn("rounded-lg px-3 py-1.5 text-sm font-semibold", d.day_index === s.day?.day_index ? "bg-brand text-brand-fg" : "bg-white ring-1 ring-slate-200")}>Dia {d.day_index}</Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-display font-bold">Funil do dia {s.day?.day_index}</h2>
          <div className="space-y-2">
            {funnel.map((f) => (
              <div key={f.k}>
                <div className="flex justify-between text-sm"><span>{f.k}</span><span className="font-semibold tabular">{f.v} · {pct(f.v, t.people)}%</span></div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand" style={{ width: `${pct(f.v, t.people)}%` }} /></div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 font-display font-bold">Pendências</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/entregas" className="rounded-xl bg-amber-50 p-4"><p className="font-display text-3xl font-extrabold tabular">{s.pending.prizes}</p><p className="text-sm text-amber-800">brindes a entregar</p></Link>
            <Link href="/admin/mural" className="rounded-xl bg-blue-50 p-4"><p className="font-display text-3xl font-extrabold tabular">{s.pending.posts}</p><p className="text-sm text-blue-800">posts para moderar</p></Link>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 font-display font-bold">Adesão por setor</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-500"><tr><th className="py-2">#</th><th>Setor</th><th className="text-right">Pessoas</th><th className="text-right">Fizeram hoje</th><th className="text-right">Adesão total</th><th className="text-right">Média pts</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {s.sectors.map((r) => (
                <tr key={r.sector}><td className="py-2 font-semibold">{r.position}º</td><td>{r.sector}</td><td className="text-right tabular">{r.members}</td>
                  <td className="text-right tabular">{r.done_today} ({pct(r.done_today, r.members)}%)</td><td className="text-right tabular">{r.adhesion_pct}%</td><td className="text-right font-semibold tabular">{r.avg_points}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h2 className="mb-1 font-display font-bold">Acertos por item — {act ? ACTIVITY_LABELS[act.type] : "sem dinâmica"}</h2>
        <p className="mb-3 text-xs text-slate-500">% de acerto na 1ª tentativa. Abaixo de 40% costuma indicar pergunta confusa.</p>
        <ul className="space-y-2">
          {s.items.map((it) => (
            <li key={it.index} className="flex items-center gap-3 text-sm">
              <span className="w-6 font-semibold text-slate-400">{it.index + 1}</span>
              <span className="min-w-0 flex-1 truncate">{it.label}</span>
              <span className="text-xs text-slate-500 tabular">{it.tried} resp.</span>
              {it.rate === null ? <Pill>—</Pill> : <Pill tone={it.rate >= 70 ? "green" : it.rate >= 40 ? "amber" : "red"}>{it.rate}%</Pill>}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return <Card><p className="text-xs font-medium text-slate-500">{label}</p><p className="font-display text-3xl font-extrabold tabular">{value}</p>{hint && <p className="text-xs text-slate-400">{hint}</p>}</Card>;
}
