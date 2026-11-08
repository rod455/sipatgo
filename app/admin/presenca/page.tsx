import { requireAdminCampaign } from "@/lib/auth";
import { attendance } from "@/lib/reports";
import { formatCpf } from "@/lib/cpf";
import { PageTitle, buttonClass } from "@/components/ui";
import { cn } from "@/lib/utils";

const CELL = { done: ["✔", "bg-green-100 text-green-800"], makeup: ["↺", "bg-amber-100 text-amber-800"], none: ["—", "text-slate-300"] } as const;

export default async function AttendancePage() {
  const { campaign } = await requireAdminCampaign();
  const { days, people } = await attendance(campaign.id);
  const totals = days.map((d) => people.filter((p) => p.days[d] && p.days[d] !== "none").length);
  return (
    <div className="space-y-4">
      <PageTitle title="Presença" subtitle="Matriz participante × dia. ✔ no dia · ↺ recuperação · — não realizou."
        action={<div className="flex gap-2">
          <a href="/api/admin/export?tipo=presenca" className={buttonClass("outline", "sm")}>Exportar CSV</a>
          <a href="/api/admin/report" target="_blank" className={buttonClass("primary", "sm")}>PDF (registro SIPAT)</a>
        </div>} />
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="p-3">Nome</th><th>CPF</th><th>Setor</th>{days.map((d) => <th key={d} className="px-2 text-center">Dia {d}</th>)}<th className="px-3 text-right">Total</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {people.map((p) => (
              <tr key={p.cpf}>
                <td className="p-2 pl-3 font-medium">{p.name}</td><td className="tabular text-slate-500">{formatCpf(p.cpf)}</td><td>{p.sector}</td>
                {days.map((d) => { const [t, c] = CELL[p.days[d] ?? "none"]; return <td key={d} className="px-1 text-center"><span className={cn("inline-block w-8 rounded py-0.5 text-xs font-bold", c)}>{t}</span></td>; })}
                <td className="px-3 text-right font-semibold tabular">{Object.values(p.days).filter((s) => s !== "none").length}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 text-xs font-semibold"><tr><td className="p-3" colSpan={3}>Concluíram</td>{totals.map((t, i) => <td key={i} className="text-center tabular">{t}</td>)}<td /></tr></tfoot>
        </table>
      </div>
    </div>
  );
}
