import { requireAdminCampaign } from "@/lib/auth";
import { sql } from "@/lib/db";
import { formatCpf } from "@/lib/cpf";
import { Card, Field, Input, PageTitle, Pill, Select } from "@/components/ui";
import { ActionButton, ActionForm } from "@/components/admin/ActionForm";
import { CsvImporter } from "@/components/admin/CsvImporter";
import { addParticipant, deleteParticipant, resetAvatar, resetPin, updateParticipant } from "./actions";
import { Avatar } from "@/components/avatar/Avatar";

const ROLE: Record<string, string> = { participant: "Participante", leader: "Líder", admin: "Admin", superadmin: "Superadmin" };

export default async function ParticipantsPage({ searchParams }: { searchParams: Promise<{ q?: string; setor?: string; papel?: string }> }) {
  const { campaign } = await requireAdminCampaign();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const digits = q.replace(/\D/g, "");
  const rows = await sql<{ id: string; name: string; cpf: string; sector: string; email: string | null; role: string; pin_set: boolean; pin_reset_required: boolean; first_login_at: Date | null; last_login_at: Date | null; login_count: number; total_points: number; days_completed: number; avatar_config: { style?: string } | null }[]>`
    select p.id, p.name, p.cpf, p.sector, p.email, p.role, p.pin_set, p.pin_reset_required, p.first_login_at, p.last_login_at, p.login_count, p.avatar_config,
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
            <Field label="E-mail (obrigatório para Admin/RH)"><Input name="email" type="email" /></Field>
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
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="p-3">Nome</th><th className="px-3">CPF</th><th className="px-3">Setor · papel</th><th className="px-3">Acesso</th><th className="p-3 text-right">Ações</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.id} className="align-top">
                <td className="p-3 font-medium"><div className="flex items-center gap-2"><Avatar config={r.avatar_config} seed={r.id} size={32} /><div>{r.name}<p className="text-xs text-slate-400">{r.days_completed}/5 dias · {r.total_points} pts{r.avatar_config?.style === "photo" ? " · foto" : ""}</p></div></div></td>
                <td className="whitespace-nowrap px-3 py-3 tabular text-slate-600">{formatCpf(r.cpf)}</td>
                <td className="px-3 py-2">
                  <ActionForm action={updateParticipant} submitLabel="Salvar" variant="outline" submitSize="sm" className="flex max-w-[22rem] flex-wrap items-center gap-1 [&>div]:mt-0 [&>div]:shrink-0">
                    <input type="hidden" name="id" value={r.id} />
                    <Input name="sector" defaultValue={r.sector} className="h-9 w-32 text-sm" aria-label="Setor" />
                    <Select name="role" defaultValue={r.role} disabled={r.role === "superadmin"} className="h-9 w-36 text-sm">
                      <option value="participant">Participante</option><option value="leader">Líder</option><option value="admin">Admin</option>
                      {r.role === "superadmin" && <option value="superadmin">Superadmin</option>}
                    </Select>
                    {r.role === "admin" || r.role === "superadmin"
                      ? <Input name="email" type="email" defaultValue={r.email ?? ""} placeholder="e-mail de login (Sou empresa)" className="order-last h-9 w-full text-sm" />
                      : <input type="hidden" name="email" value={r.email ?? ""} />}
                  </ActionForm>
                </td>
                
                <td className="whitespace-nowrap px-3 py-3">
                  {r.pin_reset_required ? <Pill tone="amber">Senha resetada</Pill> : r.pin_set || r.last_login_at ? <Pill tone="green">Ativo</Pill> : <Pill>Nunca entrou</Pill>}
                  {r.last_login_at ? <p className="mt-1 text-xs text-slate-400">{new Date(r.last_login_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })} · {r.login_count}x</p> : null}
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-1 whitespace-nowrap">
                    <ActionButton action={resetPin} label="Resetar senha" fields={{ id: r.id }} confirm={`Resetar a senha de ${r.name}? No próximo acesso a pessoa confirma a data de nascimento e cria outra.`} />
                    {r.avatar_config?.style === "photo" && <ActionButton action={resetAvatar} label="Remover foto" variant="ghost" fields={{ id: r.id }} confirm={`Remover a foto de ${r.name}?`} />}
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
