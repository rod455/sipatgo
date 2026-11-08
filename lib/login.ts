import bcrypt from "bcryptjs";
import { sql } from "./db";
import { now } from "./clock";
import { HttpError } from "./auth";
import { isValidCpf, normalizeCpf } from "./cpf";
import type { Company, Participant } from "./types";

const MAX_FAILS = 5;
const LOCK_MINUTES = 15;

export async function companyBySlug(slug: string): Promise<Company> {
  const [c] = await sql<Company[]>`select * from sipatgo.companies where slug = ${String(slug ?? "").toLowerCase()}`;
  if (!c) throw new HttpError(404, "Empresa não encontrada. Confira o link da campanha.");
  return c;
}

export async function findParticipant(company: Company, cpfInput: string): Promise<Participant> {
  const cpf = normalizeCpf(cpfInput);
  if (!isValidCpf(cpf)) throw new HttpError(400, "CPF inválido.");
  const [p] = await sql<Participant[]>`
    select * from sipatgo.participants where company_id = ${company.id} and cpf = ${cpf}`;
  if (!p) throw new HttpError(404, "CPF não encontrado nesta campanha. Fale com o RH.");
  if (p.role !== "superadmin" && p.role !== "admin" && !p.campaign_id) throw new HttpError(403, "Você não está em uma campanha ativa.");
  return p;
}

function assertNotLocked(p: Participant) {
  if (p.locked_until && new Date(p.locked_until) > now()) {
    const min = Math.ceil((new Date(p.locked_until).getTime() - now().getTime()) / 60000);
    throw new HttpError(429, `Muitas tentativas. Tente novamente em ${min} min.`);
  }
}

async function registerFail(p: Participant) {
  const fails = p.failed_logins + 1;
  const lock = fails >= MAX_FAILS ? new Date(now().getTime() + LOCK_MINUTES * 60000) : null;
  await sql`update sipatgo.participants set failed_logins = ${lock ? 0 : fails}, locked_until = ${lock} where id = ${p.id}`;
  return MAX_FAILS - fails;
}

async function resetFails(p: Participant) {
  await sql`update sipatgo.participants set failed_logins = 0, locked_until = null where id = ${p.id}`;
}

/** Status do CPF para o fluxo de login. */
export async function lookup(company: Company, cpf: string) {
  const p = await findParticipant(company, cpf);
  assertNotLocked(p);
  return { firstAccess: !p.pin_set || p.pin_reset_required, reset: p.pin_reset_required && p.pin_set };
}

export async function verifyBirthDate(company: Company, cpf: string, birthDate: string) {
  const p = await findParticipant(company, cpf);
  assertNotLocked(p);
  if (p.pin_set && !p.pin_reset_required) throw new HttpError(400, "Você já tem PIN. Entre com CPF e PIN.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || p.birth_date !== birthDate) {
    const left = await registerFail(p);
    throw new HttpError(401, left > 0 ? `Data de nascimento não confere. ${left} tentativa(s) restante(s).` : "Data não confere. Acesso bloqueado por 15 minutos.");
  }
  await resetFails(p);
  return p;
}

export async function verifyPin(company: Company, cpf: string, pin: string) {
  const p = await findParticipant(company, cpf);
  assertNotLocked(p);
  if (!p.pin_set || p.pin_reset_required || !p.pin_hash) throw new HttpError(400, "Faça o primeiro acesso com sua data de nascimento.");
  const ok = await bcrypt.compare(String(pin ?? ""), p.pin_hash);
  if (!ok) {
    const left = await registerFail(p);
    throw new HttpError(401, left > 0 ? `PIN incorreto. ${left} tentativa(s) restante(s).` : "PIN incorreto. Acesso bloqueado por 15 minutos.");
  }
  await resetFails(p);
  return p;
}

export function validatePin(pin: string, role: string) {
  const s = String(pin ?? "");
  const admin = role === "admin" || role === "superadmin";
  if (admin) {
    if (!/^\d{6}$/.test(s)) throw new HttpError(400, "Administradores usam PIN de 6 dígitos.");
  } else if (!/^\d{4,6}$/.test(s)) {
    throw new HttpError(400, "O PIN deve ter de 4 a 6 números.");
  }
  if (/^(\d)\1+$/.test(s) || "0123456789".includes(s) || "9876543210".includes(s)) {
    throw new HttpError(400, "PIN muito fácil. Evite sequências e números repetidos.");
  }
}

export async function setPin(p: Participant, pin: string) {
  validatePin(pin, p.role);
  const hash = await bcrypt.hash(pin, 10);
  const [row] = await sql<{ session_version: number }[]>`
    update sipatgo.participants
       set pin_hash = ${hash}, pin_set = true, pin_reset_required = false,
           first_login_at = coalesce(first_login_at, ${now()}), session_version = session_version + 1
     where id = ${p.id} returning session_version`;
  return row.session_version;
}
