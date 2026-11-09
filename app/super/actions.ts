"use server";
import { RESERVED_SLUGS } from "@/lib/slugs";

import { z } from "zod";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { ADMIN_CAMPAIGN_COOKIE, ADMIN_COMPANY_COOKIE, HttpError, getViewer } from "@/lib/auth";
import { safe, type ActionResult } from "@/lib/admin-guard";
import { isValidCpf, normalizeCpf } from "@/lib/cpf";
import { parseBirthDate } from "@/lib/csv-import";

async function superOnly() {
  const v = await getViewer();
  if (!v || v.participant.role !== "superadmin") throw new HttpError(403, "Apenas superadmin.");
  return v;
}

export async function createCompany(_: ActionResult | null, fd: FormData) {
  return safe(async () => {
    await superOnly();
    const d = z.object({
      name: z.string().trim().min(2, "Nome obrigatório"),
      slug: z.string().trim().toLowerCase().regex(/^[a-z0-9][a-z0-9-]{1,40}$/, "Slug: letras minúsculas, números e hífen").refine((v) => !RESERVED_SLUGS.has(v), "Esse endereço é reservado pelo site. Escolha outro."),
      primary_color: z.string().default("#0F766E"), secondary_color: z.string().default("#134E4A"), accent_color: z.string().default("#F59E0B"),
    }).parse(Object.fromEntries(fd));
    if (["www", "app", "admin", "api", "super", "login", "sipatgo"].includes(d.slug)) throw new HttpError(400, "Slug reservado.");
    const [dup] = await sql`select 1 from sipatgo.companies where slug = ${d.slug}`;
    if (dup) throw new HttpError(400, "Slug já em uso.");
    await sql`insert into sipatgo.companies (name, slug, primary_color, secondary_color, accent_color) values (${d.name}, ${d.slug}, ${d.primary_color}, ${d.secondary_color}, ${d.accent_color})`;
    revalidatePath("/super");
    return "Empresa criada.";
  });
}

export async function createAdmin(_: ActionResult | null, fd: FormData) {
  return safe(async () => {
    await superOnly();
    const companyId = String(fd.get("company_id"));
    const name = String(fd.get("name") ?? "").trim();
    const cpf = normalizeCpf(String(fd.get("cpf") ?? ""));
    const birth = parseBirthDate(String(fd.get("birth_date") ?? ""));
    if (name.length < 2) throw new HttpError(400, "Nome obrigatório.");
    if (!isValidCpf(cpf)) throw new HttpError(400, "CPF inválido.");
    if (!birth) throw new HttpError(400, "Data de nascimento inválida.");
    const email = String(fd.get("email") ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, "Informe o e-mail do RH: é o login dele.");
    await sql`
      insert into sipatgo.participants (company_id, name, cpf, birth_date, sector, email, role)
      values (${companyId}, ${name}, ${cpf}, ${birth}, 'RH', ${email}, 'admin')
      on conflict (company_id, cpf) do update set role = case when sipatgo.participants.role = 'superadmin' then 'superadmin' else 'admin' end, name = excluded.name, email = excluded.email`;
    revalidatePath("/super");
    return "Admin criado. Em sipatgo.com.br/login → Sou empresa → “Primeiro acesso ou esqueci a senha”, ele recebe por e-mail o link para criar a senha.";
  });
}

export async function manageCompany(fd: FormData) {
  await superOnly();
  const jar = await cookies();
  jar.set(ADMIN_COMPANY_COOKIE, String(fd.get("company_id")), { path: "/", httpOnly: true, sameSite: "lax" });
  jar.delete(ADMIN_CAMPAIGN_COOKIE);
  redirect("/admin");
}
