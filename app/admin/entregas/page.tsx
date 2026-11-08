import { requireAdminCampaign } from "@/lib/auth";
import { sql } from "@/lib/db";
import { formatDateTimeBR } from "@/lib/dates";
import { Card, Input, PageTitle, Pill, Select } from "@/components/ui";
import { ActionButton, ActionForm } from "@/components/admin/ActionForm";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { cancelAward, markDelivered } from "../brindes/actions";

export default async function DeliveriesPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { campaign, adminCompany } = await requireAdminCampaign();
  const sp = await searchParams;
  const status = sp.status ?? "pending";
  const q = (sp.q ?? "").trim();
  const rows = await sql<{ id: string; code: string; status: string; created_at: Date; delivered_at: Date | null; name: string; sector: string; prize: string; day_index: number | null }[]>`
    select a.id, a.code, a.status, a.created_at, a.delivered_at, p.name, p.sector, pr.internal_name as prize, d.day_index
      from sipatgo.prize_awards a join sipatgo.participants p on p.id = a.participant_id join sipatgo.prizes pr on pr.id = a.prize_id
      left join sipatgo.wheel_spins w on w.id = a.wheel_spin_id left join sipatgo.campaign_days d on d.id = w.campaign_day_id
     where pr.campaign_id = ${campaign.id} and (${status} = 'all' or a.status = ${status})
       and (${q} = '' or a.code ilike ${"%" + q + "%"} or p.name ilike ${"%" + q + "%"})
     order by a.created_at desc`;
  return (
    <div className="space-y-5">
      <PageTitle title="Entregas de brindes" subtitle="Confira o código mostrado no celular do participante." action={<AutoRefresh campaignId={campaign.id} />} />
      <Card>
        <h2 className="mb-2 font-display font-bold">Entregar por código</h2>
        <ActionForm action={markDelivered} submitLabel="Marcar como entregue" resetOnSuccess>
          <Input name="code" placeholder="XXXX-XXXX" className="max-w-xs font-display text-lg tracking-widest uppercase" autoComplete="off" />
        </ActionForm>
      </Card>
      <form className="flex flex-wrap gap-2">
        <Select name="status" defaultValue={status} className="max-w-48"><option value="pending">Pendentes</option><option value="delivered">Entregues</option><option value="cancelled">Cancelados</option><option value="all">Todos</option></Select>
        <Input name="q" defaultValue={q} placeholder="Código ou nome" className="max-w-xs" />
        <button className="h-11 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white">Filtrar</button>
      </form>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="p-3">Código</th><th>Participante</th><th>Setor</th><th>Brinde</th><th>Quando</th><th>Status</th><th className="p-3 text-right">Ações</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="p-3 font-display font-bold tracking-widest">{r.code}</td><td>{r.name}</td><td>{r.sector}</td><td>{r.prize}</td>
                <td className="text-xs text-slate-500">{formatDateTimeBR(r.created_at, adminCompany.timezone)}{r.day_index ? ` · dia ${r.day_index}` : ""}</td>
                <td><Pill tone={r.status === "delivered" ? "green" : r.status === "cancelled" ? "red" : "amber"}>{r.status === "delivered" ? "Entregue" : r.status === "cancelled" ? "Cancelado" : "Pendente"}</Pill></td>
                <td className="p-3 text-right">
                  {r.status === "pending" && <div className="flex justify-end gap-1">
                    <ActionButton action={markDelivered} label="Entregue" variant="primary" fields={{ id: r.id }} />
                    <ActionButton action={cancelAward} label="Cancelar" variant="ghost" fields={{ id: r.id }} confirm="Cancelar e devolver ao estoque?" />
                  </div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="p-6 text-center text-sm text-slate-500">Nada por aqui.</p>}
      </div>
    </div>
  );
}
