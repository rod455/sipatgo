import { requireAdminCampaign } from "@/lib/auth";
import { sql } from "@/lib/db";
import { Card, Field, Input, PageTitle } from "@/components/ui";
import { ActionButton, ActionForm } from "@/components/admin/ActionForm";
import { createPrize, deletePrize, updatePrize } from "./actions";

export default async function PrizesPage() {
  const { campaign } = await requireAdminCampaign();
  const prizes = await sql<{ id: string; internal_name: string; stock_total: number; stock_available: number; weight: number; active: boolean; awarded: number }[]>`
    select p.*, (select count(*)::int from sipatgo.prize_awards a where a.prize_id = p.id and a.status <> 'cancelled') as awarded
      from sipatgo.prizes p where campaign_id = ${campaign.id} order by created_at`;
  const pool = prizes.filter((p) => p.active && p.stock_available > 0);
  const totalW = pool.reduce((s, p) => s + p.weight, 0);
  return (
    <div className="max-w-4xl space-y-5">
      <PageTitle title="Brindes" subtitle="O participante nunca vê o nome do brinde. Sorteio ponderado pelo peso; esgotado sai da roleta." />
      <Card>
        <h2 className="mb-3 font-display font-bold">Novo brinde</h2>
        <ActionForm action={createPrize} submitLabel="Adicionar" resetOnSuccess>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Nome interno"><Input name="internal_name" required placeholder="Garrafa térmica" /></Field>
            <Field label="Estoque"><Input name="stock_total" type="number" min={0} defaultValue={10} /></Field>
            <Field label="Peso" hint="Maior peso = mais chance."><Input name="weight" type="number" min={1} defaultValue={1} /></Field>
          </div>
        </ActionForm>
      </Card>
      <div className="space-y-2">
        {prizes.map((p) => (
          <Card key={p.id} className="flex flex-wrap items-end gap-3">
            <ActionForm action={updatePrize} submitLabel="Salvar" variant="outline" className="flex flex-1 flex-wrap items-end gap-3 [&>div]:mt-0">
              <input type="hidden" name="id" value={p.id} />
              <Field label="Nome interno" className="min-w-48 flex-1"><Input name="internal_name" defaultValue={p.internal_name} /></Field>
              <Field label="Estoque total" className="w-28"><Input name="stock_total" type="number" min={0} defaultValue={p.stock_total} /></Field>
              <Field label="Peso" className="w-20"><Input name="weight" type="number" min={1} defaultValue={p.weight} /></Field>
              <label className="flex h-11 items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={p.active} /> Ativo</label>
            </ActionForm>
            <div className="text-right text-sm">
              <p><strong className="tabular">{p.stock_available}</strong> disponíveis · {p.awarded} sorteados</p>
              <p className="text-xs text-slate-500">chance atual: {p.active && p.stock_available > 0 && totalW ? Math.round((100 * p.weight) / totalW) : 0}%</p>
              <ActionButton action={deletePrize} label="Excluir" variant="ghost" fields={{ id: p.id }} confirm="Excluir este brinde?" />
            </div>
          </Card>
        ))}
        {!prizes.length && <p className="text-sm text-slate-500">Nenhum brinde cadastrado. Sem brindes, a roleta fica indisponível.</p>}
      </div>
    </div>
  );
}
