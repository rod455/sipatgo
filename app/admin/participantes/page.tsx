import { requireAdminCampaign } from "@/lib/auth";
import { sql } from "@/lib/db";
import { formatCpf } from "@/lib/cpf";
import { Card, Field, Input, PageTitle, Pill, Select } from "@/components/ui";
import { ActionButton, ActionForm } from "@/components/admin/ActionForm";
import { CsvImporter } from "@/components/admin/CsvImporter";
import { addParticipant, deleteParticipant, resetPin, updateParticipant } from "./actions";

const ROLE: Record<string, string> = { participant: "Participante", leader: "Líder", admin: "Admin", superadmin: "Superadmin" };

export default async function ParticipantsPage({ searchParams }: { searchParams: Promise<{ q?: string; setor?: string; papel?: string }> }) {
  const { campaign } = await requireAdminCampaign();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const digits = q.replace(/\D/g, "");
  const rows = await sql<{ id: string; name: string; cpf: string; sector: string; email: string | null; role: string; pin_set: boolean; pin_reset_required: boolean; first_login_at: Date | null; total_points: number; days_completed: number }[]>`
    select p.id, p.name, p.cpf, p.sector, p.email, p.role, p.pin_set, p.pin_reset_required, p.first_login_at,
           coalesce(s.total_points, 0) as total_points, coalesce(s.days_completed, 0) as days_completed
      from sipatgo.participants p left join sipatgo.participant_scores s on s.participant_id = p.id
     where p.campaign_id = ${campaign.id}
       and (${q} = '' or p.name ilike ${"%" + q + "%"} or (${digits} <> '' and p.cpf like ${"%" + digits + "%"}))
       and (${sp.setor ?? ""} = '' or p.sector = ${sp.setor ?? ""})
       and (${sp.papel ?? ""} = '' or p.role = ${sp.papel ?? ""})
     order by p.name`;
  const sectors = await sql<{ sector: string }[]>`select distinct sector from sipatgo.participants where campaign_id = ${campaign.id} order by sector`;

  return (
    <div className="space-y-5">
      <PageTitle title="Participantes" subtitle={`${rows.length} pessoa(s) nesta visão`} />
      <Card><h2 className="mb-3 font-display font-bold">Importar CSV</h2><CsvImporter /></Card>

      <Card>
        <h2 className="mb-3 font-display font-bold">Adicionar uma pessoa</h2>
        <ActionForm action={addParticipant} submitLabel="Adicionar" resetOnSuccess>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Nome"><Input name="name" required /></Field>
            <Field label="CPF"><Input name="cpf" inputMode="numeric" required /></Field>
            <Field label="Nascimento"><Input name="birth_date" type="date" required /></Field>
            <Field label="Setor"><Input name="sector" list="sectors" required /></Field>
            <Field label="E-mail (opcional)"><Input name="email" type="email" /></Field>
            <Field label="Papel"><Select name="role" defaultValue="participant"><option value="participant">Participante</option><option value="leader">Líder</option><option value="admin">Admin/RH</option></Select></Field>
          </div>
          <datalist id="sectors">{sectors.map((s) => <option key={s.sector} value={s.sector} />)}</datalist>
        </ActionForm>
      </Card>

      <form className="flex flex-wrap gap-2">
        <Input name="q" defaultValue={q} placeholder="Buscar por nome ou CPF" className="max-w-xs" />
        <Select name="setor" defaultValue={sp.setor ?? ""} className="max-w-48"><option value="">Todos os setores</option>{sectors.map((s) => <option key={s.sector}>{s.sector}</option>)}</Select>
        <Select name="papel" defaultValue={sp.papel ?? ""} className="max-w-40"><option value="">Todos os papéis</option>{Object.entries(ROLE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select>
        <button className="h-11 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white">Filtrar</button>
      </form>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="p-3">Nome</th><th>CPF</th><th>Setor / papel / e-mail</th><th className="text-right">Pts</th><th>Acesso</th><th className="p-3 text-right">Ações</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.id} className="align-top">
                <td className="p-3 font-medium">{r.name}<p className="text-xs text-slate-400">{r.days_completed}/5 dias</p></td>
                <td className="whitespace-nowrap py-3 tabular text-slate-600">{formatCpf(r.cpf)}</td>
                <td className="py-2">
                  <ActionForm action={updateParticipant} submitLabel="Salvar" variant="outline" className="flex flex-wrap items-center gap-1 [&>div]:mt-0">
                    <input type="hidden" name="id" value={r.id} />
                    <Input name="sector" defaultValue={r.sector} className="h-9 w-32 text-sm" />
                    <Select name="role" defaultValue={r.role} disabled={r.role === "superadmin"} className="h-9 w-32 text-sm">
                      <option value="participant">Participante</option><option value="leader">Líder</option><option value="admin">Admin</option>
                      {r.role === "superadmin" && <option value="superadmin">Superadmin</option>}
                    </Select>
                    <Input name="email" defaultValue={r.email ?? ""} placeholder="e-mail" className="h-9 w-44 text-sm" />
                  </ActionForm>
                </td>
                <td className="py-3 text-right font-semibold tabular">{r.total_points}</td>
                <td className="py-3 pl-3">{r.pin_reset_required ? <Pill tone="amber">PIN resetado</Pill> : r.pin_set ? <Pill tone="green">Ativo</Pill> : <Pill>Nunca entrou</Pill>}</td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-1">
                    <ActionButton action={resetPin} label="Resetar PIN" fields={{ id: r.id }} confirm={`Resetar o PIN de ${r.name}?`} />
                    <ActionButton action={deleteParticipant} label="Excluir" variant="ghost" fields={{ id: r.id }} confirm={`Excluir ${r.name}? Os pontos serão perdidos.`} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="p-3 text-xs text-slate-500">{ROLE.participant}s e líderes entram no ranking; admins não. {Object.keys(ROLE).length} papéis.</p>
      </div>
    </div>
  );
}
