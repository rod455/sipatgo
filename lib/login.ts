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
  if (p.pin_set && !p.pin_reset_required) throw new HttpError(400, "Você já tem senha. Entre com CPF e senha.");
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
    throw new HttpError(401, left > 0 ? `Senha incorreta. ${left} tentativa(s) restante(s).` : "Senha incorreta. Acesso bloqueado por 15 minutos.");
  }
  await resetFails(p);
  return p;
}

export function validatePin(pin: string, role: string) {
  const s = String(pin ?? "");
  const admin = role === "admin" || role === "superadmin";
  if (admin) {
    if (!/^\d{6}$/.test(s)) throw new HttpError(400, "Administradores usam senha de 6 dígitos.");
  } else if (!/^\d{4,6}$/.test(s)) {
    throw new HttpError(400, "A senha deve ter de 4 a 6 números.");
  }
  if (/^(\d)\1+$/.test(s) || "0123456789".includes(s) || "9876543210".includes(s)) {
    throw new HttpError(400, "Senha muito fácil. Evite sequências e números repetidos.");
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

/** Registra um acesso bem-sucedido (nunca derruba o login se falhar). */
export async function recordLogin(participantId: string, kind: "pin" | "primeiro_acesso", userAgent?: string | null) {
  try {
    await sql`insert into sipatgo.login_events (participant_id, kind, user_agent) values (${participantId}, ${kind}, ${userAgent?.slice(0, 300) ?? null})`;
    await sql`update sipatgo.participants set last_login_at = now(), login_count = login_count + 1 where id = ${participantId}`;
  } catch (err) {
    console.error("[login] Falha ao registrar acesso:", err instanceof Error ? err.message : err);
  }
}

// ---------------------------------------------------------------------------
// Colaborador sem código da empresa: descobre a campanha pelo CPF.
// ---------------------------------------------------------------------------
const hits = new Map<string, { n: number; t: number }>();
export function throttle(key: string, max = 20, windowMs = 60_000) {
  const t = Date.now();
  const h = hits.get(key);
  if (!h || t - h.t > windowMs) { hits.set(key, { n: 1, t }); return; }
  if (++h.n > max) throw new HttpError(429, "Muitas tentativas. Aguarde um minuto.");
}

/** Campanha do colaborador pelo CPF: prioriza campanha ativa, depois a mais recente. */
export async function findCompanyByCpf(cpfInput: string) {
  const cpf = normalizeCpf(cpfInput);
  if (!isValidCpf(cpf)) throw new HttpError(400, "CPF inválido.");
  const [r] = await sql<{ slug: string; name: string; primary_color: string; secondary_color: string; accent_color: string }[]>`
    select c.slug, c.name, c.primary_color, c.secondary_color, c.accent_color
      from sipatgo.participants p
      join sipatgo.companies c on c.id = p.company_id
      join sipatgo.campaigns ca on ca.id = p.campaign_id
     where p.cpf = ${cpf} and p.role in ('participant', 'leader') and ca.status <> 'draft'
     order by (ca.status = 'active') desc, (ca.status = 'scheduled') desc, ca.start_date desc
     limit 1`;
  if (!r) throw new HttpError(404, "Não encontramos uma campanha para este CPF. Confira o número ou fale com o RH da sua empresa.");
  return { slug: r.slug, company: r.name, colors: [r.primary_color, r.secondary_color, r.accent_color] };
}

// ---------------------------------------------------------------------------
// RH: e-mail + senha
// ---------------------------------------------------------------------------
type RhRow = Participant & { password_hash: string | null };

async function rhByEmail(emailInput: string): Promise<RhRow[]> {
  const email = String(emailInput ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, "Informe um e-mail válido.");
  return sql<RhRow[]>`
    select * from sipatgo.participants where lower(email) = ${email} and role in ('admin', 'superadmin')
     order by (role = 'superadmin') desc, created_at`;
}

export function validatePassword(pw: string) {
  if (pw.length < 8) throw new HttpError(400, "A senha precisa ter pelo menos 8 caracteres.");
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) throw new HttpError(400, "Use letras e números na senha.");
}

export async function verifyRhPassword(email: string, password: string): Promise<RhRow> {
  const rows = await rhByEmail(email);
  const generic = "E-mail ou senha incorretos.";
  if (!rows.length) throw new HttpError(401, generic);
  const withPw = rows.filter((r) => r.password_hash);
  if (!withPw.length) throw new HttpError(409, "Primeiro acesso: crie sua senha em “Primeiro acesso ou esqueci a senha”.");
  for (const r of withPw) {
    assertNotLocked(r);
    if (await bcrypt.compare(String(password ?? ""), r.password_hash!)) {
      await resetFails(r);
      return r;
    }
  }
  const left = await registerFail(withPw[0]);
  throw new HttpError(401, left > 0 ? generic : "Muitas tentativas. Acesso bloqueado por 15 minutos.");
}

/** Primeiro acesso do RH: e-mail + CPF + nascimento → define a senha. Só se ainda não houver senha. */
export async function setRhPassword(email: string, cpfInput: string, birthDate: string, password: string): Promise<RhRow> {
  validatePassword(String(password ?? ""));
  const cpf = normalizeCpf(cpfInput);
  const rows = (await rhByEmail(email)).filter((r) => r.cpf === cpf);
  if (!rows.length) throw new HttpError(404, "Não encontramos um acesso de RH com este e-mail e CPF. Fale com o suporte SipatGo.");
  const r = rows[0];
  assertNotLocked(r);
  if (r.password_hash) throw new HttpError(409, "Você já tem senha. Se esqueceu, peça ao suporte SipatGo para liberar uma nova.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || r.birth_date !== birthDate) {
    const left = await registerFail(r);
    throw new HttpError(401, left > 0 ? `Dados não conferem. ${left} tentativa(s) restante(s).` : "Dados não conferem. Acesso bloqueado por 15 minutos.");
  }
  await resetFails(r);
  const hash = await bcrypt.hash(password, 10);
  const [u] = await sql<{ session_version: number }[]>`
    update sipatgo.participants set password_hash = ${hash}, first_login_at = coalesce(first_login_at, ${now()}),
           session_version = session_version + 1
     where id = ${r.id} returning session_version`;
  return { ...r, session_version: u.session_version };
}
