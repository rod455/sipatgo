"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { HttpError } from "@/lib/auth";
import { adminAction, safe, type ActionResult } from "@/lib/admin-guard";
import { validateRows, parseBirthDate } from "@/lib/csv-import";
import { isValidCpf, normalizeCpf } from "@/lib/cpf";

export async function importParticipants(table: string[][]): Promise<ActionResult & { inserted?: number; updated?: number }> {
  const counts = { inserted: 0, updated: 0 };
  const r = await safe(async () => {
    const ctx = await adminAction();
    if (table.length > 5001) throw new HttpError(400, "Máximo de 5.000 linhas por importação.");
    const rows = validateRows(table);
    const bad = rows.filter((x) => x.errors.length);
    if (bad.length) throw new HttpError(400, `Corrija ${bad.length} linha(s) com erro antes de importar.`);
    if (!rows.length) throw new HttpError(400, "Nenhuma linha para importar.");
    await sql.begin(async (tx) => {
      for (const x of rows) {
        const [res] = await tx<{ inserted: boolean }[]>`
          insert into sipatgo.participants (company_id, campaign_id, name, cpf, birth_date, sector, email, role)
          values (${ctx.adminCompany.id}, ${ctx.campaign.id}, ${x.name}, ${x.cpf}, ${x.birth_date}, ${x.sector}, ${x.email}, ${x.leader ? "leader" : "participant"})
          on conflict (company_id, cpf) do update set
            campaign_id = excluded.campaign_id, name = excluded.name, birth_date = excluded.birth_date,
            sector = excluded.sector, email = coalesce(excluded.email, sipatgo.participants.email),
            role = case when sipatgo.participants.role in ('admin','superadmin') then sipatgo.participants.role else excluded.role end
          returning (xmax = 0) as inserted`;
        if (res.inserted) counts.inserted++; else counts.updated++;
      }
    });
    revalidatePath("/admin/participantes");
    return `${counts.inserted} novo(s), ${counts.updated} atualizado(s).`;
  });
  return { ...r, ...counts };
}

const one = z.object({
  name: z.string().trim().min(2, "Nome obrigatório"), cpf: z.string(), birth_date: z.string(),
  sector: z.string().trim().min(1).default("Geral"), email: z.string().trim().default(""),
  role: z.enum(["participant", "leader", "admin"]),
});

export async function addParticipant(_: ActionResult | null, fd: FormData) {
  return safe(async () => {
    const ctx = await adminAction();
    const d = one.parse(Object.fromEntries(fd));
    const cpf = normalizeCpf(d.cpf);
    if (!isValidCpf(cpf)) throw new HttpError(400, "CPF inválido.");
    const birth = parseBirthDate(d.birth_date);
    if (!birth) throw new HttpError(400, "Data de nascimento inválida.");
    await sql`
      insert into sipatgo.participants (company_id, campaign_id, name, cpf, birth_date, sector, email, role)
      values (${ctx.adminCompany.id}, ${ctx.campaign.id}, ${d.name}, ${cpf}, ${birth}, ${d.sector}, ${d.email || null}, ${d.role})
      on conflict (company_id, cpf) do update set campaign_id = excluded.campaign_id, name = excluded.name, birth_date = excluded.birth_date,
        sector = excluded.sector, email = excluded.email,
        role = case when sipatgo.participants.role = 'superadmin' then 'superadmin' else excluded.role end`;
    revalidatePath("/admin/participantes");
    return "Participante salvo.";
  });
}

async function own(id: string) {
  const ctx = await adminAction();
  const [p] = await sql<{ id: string; role: string }[]>`select id, role from sipatgo.participants where id = ${id} and company_id = ${ctx.adminCompany.id}`;
  if (!p) throw new HttpError(404, "Participante não encontrado.");
  return { ctx, p };
}

export async function updateParticipant(_: ActionResult | null, fd: FormData) {
  return safe(async () => {
    const { ctx, p } = await own(String(fd.get("id")));
    const sector = String(fd.get("sector") ?? "").trim() || "Geral";
    let role = String(fd.get("role") ?? "participant");
    if (!["participant", "leader", "admin"].includes(role)) throw new HttpError(400, "Papel inválido.");
    if (p.role === "superadmin") role = "superadmin";
    if (p.id === ctx.participant.id && role !== ctx.participant.role) throw new HttpError(400, "Você não pode mudar o próprio papel.");
    const email = String(fd.get("email") ?? "").trim() || null;
    await sql`update sipatgo.participants set sector = ${sector}, role = ${role}, email = ${email} where id = ${p.id}`;
    revalidatePath("/admin/participantes");
  });
}

export async function resetPin(_: ActionResult | null, fd: FormData) {
  return safe(async () => {
    const { p } = await own(String(fd.get("id")));
    await sql`update sipatgo.participants set pin_reset_required = true, failed_logins = 0, locked_until = null, session_version = session_version + 1 where id = ${p.id}`;
    revalidatePath("/admin/participantes");
    return "PIN resetado: no próximo acesso a pessoa confirma a data de nascimento e cria um novo PIN.";
  });
}

export async function deleteParticipant(_: ActionResult | null, fd: FormData) {
  return safe(async () => {
    const { ctx, p } = await own(String(fd.get("id")));
    if (p.id === ctx.participant.id) throw new HttpError(400, "Você não pode excluir a si mesmo.");
    if (p.role === "superadmin") throw new HttpError(400, "Não é possível excluir um superadmin.");
    const [award] = await sql`select 1 from sipatgo.prize_awards where participant_id = ${p.id} limit 1`;
    if (award) {
      // mantém o histórico de brindes: apenas desvincula da campanha
      await sql`update sipatgo.participants set campaign_id = null where id = ${p.id}`;
      await sql`delete from sipatgo.participant_scores where participant_id = ${p.id}`;
      revalidatePath("/admin/participantes");
      return "Participante removido da campanha (histórico de brindes preservado).";
    }
    await sql`delete from sipatgo.participants where id = ${p.id}`;
    revalidatePath("/admin/participantes");
    return "Participante excluído.";
  });
}

export async function resetAvatar(_: ActionResult | null, fd: FormData) {
  return safe(async () => {
    const { p } = await own(String(fd.get("id")));
    await sql`update sipatgo.participants set avatar_config = null where id = ${p.id}`;
    revalidatePath("/admin/participantes");
    return "Avatar removido. A pessoa pode criar outro no perfil.";
  });
}
