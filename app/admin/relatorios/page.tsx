import { requireAdminCampaign } from "@/lib/auth";
import { reportSummary } from "@/lib/reports";
import { pct } from "@/lib/utils";
import { Card, PageTitle, Pill, buttonClass } from "@/components/ui";

const EXPORTS = [
  ["presenca", "Presença (participante × dia)"], ["ranking", "Ranking individual"], ["setores", "Ranking por setor"],
  ["aprendizado", "Aprendizado por item"], ["brindes", "Brindes e entregas"], ["certificados", "Certificados emitidos"],
] as const;

export default async function ReportsPage() {
  const { campaign } = await requireAdminCampaign();
  const r = await reportSummary(campaign.id);
  const t = r.s;
  const weak = r.learning.filter((l) => l.rate !== null && l.rate < 40);
  return (
    <div className="max-w-5xl space-y-5">
      <PageTitle title="Relatórios" subtitle="Relatório final para registro da SIPAT (NR-5) e auditoria."
        action={<a href="/api/admin/report" target="_blank" className={buttonClass("primary")}>Baixar relatório final (PDF)</a>} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[["Adesão", `${pct(t.active, t.people)}%`, `${t.active} de ${t.people}`], ["Acerto 1ª tentativa", `${pct(t.first_try, t.correct)}%`, `${t.correct} acertos`],
          ["Brindes entregues", `${t.delivered}/${t.prizes}`, "sorteados"], ["Certificados", t.certs, campaign.status === "closed" ? "emitidos" : "após encerrar"]].map(([k, v, h]) => (
          <Card key={String(k)}><p className="text-xs text-slate-500">{k}</p><p className="font-display text-3xl font-extrabold tabular">{v}</p><p className="text-xs text-slate-400">{h}</p></Card>
        ))}
      </div>
      <Card>
        <h2 className="mb-3 font-display font-bold">Exportar CSV</h2>
        <div className="flex flex-wrap gap-2">{EXPORTS.map(([k, l]) => <a key={k} href={`/api/admin/export?tipo=${k}`} className={buttonClass("outline", "sm")}>{l}</a>)}</div>
        <p className="mt-2 text-xs text-slate-500">Separador “;” e UTF-8 — abre direto no Excel.</p>
      </Card>
      <Card>
        <h2 className="mb-3 font-display font-bold">Adesão por dia</h2>
        <div className="space-y-2">
          {r.perDay.map((d) => (
            <div key={d.day_index}>
              <div className="flex justify-between text-sm"><span>Dia {d.day_index} · {d.title}</span><span className="tabular">{d.done} no dia + {d.makeup} rec. · {pct(d.done + d.makeup, t.people)}%</span></div>
              <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className="bg-brand" style={{ width: `${pct(d.done, t.people)}%` }} /><div className="bg-amber-400" style={{ width: `${pct(d.makeup, t.people)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h2 className="mb-1 font-display font-bold">Itens com menor acerto</h2>
        <p className="mb-3 text-xs text-slate-500">Abaixo de 40% na 1ª tentativa: revise o enunciado ou reforce o tema.</p>
        {weak.length ? <ul className="space-y-1 text-sm">{weak.map((w) => <li key={`${w.day_index}-${w.item}`} className="flex justify-between gap-2"><span>Dia {w.day_index} · {w.item}. {w.label}</span><Pill tone="red">{w.rate}%</Pill></li>)}</ul>
          : <p className="text-sm text-slate-500">Nenhum item abaixo de 40%. 👏</p>}
      </Card>
    </div>
  );
}
