import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { sql } from "./db";
import { getSession } from "./session";
import type { Campaign, Company, Participant } from "./types";

export type Viewer = { participant: Participant; company: Company };

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function getViewer(opts: { allowOnboarding?: boolean } = {}): Promise<Viewer | null> {
  const s = await getSession();
  if (!s) return null;
  if (s.stage !== "full" && !opts.allowOnboarding) return null;
  const rows = await sql<(Participant & { _company: Company })[]>`
    select p.*, row_to_json(c.*) as _company
      from sipatgo.participants p
      join sipatgo.companies c on c.id = p.company_id
     where p.id = ${s.pid} and p.company_id = ${s.cid}`;
  const row = rows[0];
  if (!row || row.session_version !== s.v) return null;
  if (s.stage === "full" && (!row.pin_set || row.pin_reset_required)) return null;
  const { _company, ...participant } = row;
  return { participant: participant as Participant, company: _company };
}

/** Para páginas do participante. */
export async function requireViewer(): Promise<Viewer> {
  const v = await getViewer();
  if (!v) redirect("/login");
  return v;
}

export function isAdmin(p: Participant) {
  return p.role === "admin" || p.role === "superadmin";
}

/** Para route handlers do participante. */
export async function apiViewer(): Promise<Viewer> {
  const v = await getViewer();
  if (!v) throw new HttpError(401, "Sessão expirada. Entre novamente.");
  return v;
}

export const ADMIN_COMPANY_COOKIE = "sg_admin_company";
export const ADMIN_CAMPAIGN_COOKIE = "sg_admin_campaign";

export type AdminContext = Viewer & { adminCompany: Company; campaign: Campaign | null; campaigns: Campaign[] };

/** Contexto do painel admin: empresa (superadmin pode trocar) + campanha selecionada. */
export async function getAdminContext(): Promise<AdminContext | null> {
  const v = await getViewer();
  if (!v || !isAdmin(v.participant)) return null;
  const jar = await cookies();
  let adminCompany = v.company;
  if (v.participant.role === "superadmin") {
    const cid = jar.get(ADMIN_COMPANY_COOKIE)?.value;
    let picked: Company | undefined;
    if (cid && /^[0-9a-f-]{36}$/.test(cid)) {
      [picked] = await sql<Company[]>`select * from sipatgo.companies where id = ${cid}`;
    }
    if (!picked) {
      // sem escolha: empresa cliente mais recente que tenha campanha (nunca a interna)
      [picked] = await sql<Company[]>`
        select co.* from sipatgo.companies co
         where co.id <> ${v.company.id}
         order by exists(select 1 from sipatgo.campaigns ca where ca.company_id = co.id and ca.status <> 'closed') desc,
                  exists(select 1 from sipatgo.campaigns ca where ca.company_id = co.id) desc,
                  co.created_at desc
         limit 1`;
    }
    if (picked) adminCompany = picked;
  }
  const campaigns = await sql<Campaign[]>`
    select * from sipatgo.campaigns where company_id = ${adminCompany.id} order by start_date desc, created_at desc`;
  const wanted = jar.get(ADMIN_CAMPAIGN_COOKIE)?.value;
  const campaign =
    campaigns.find((c) => c.id === wanted) ??
    campaigns.find((c) => c.status === "active") ??
    campaigns.find((c) => c.status !== "closed") ??
    campaigns[0] ?? null;
  return { ...v, adminCompany, campaign, campaigns };
}

export async function requireAdmin(): Promise<AdminContext> {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/login?next=/admin");
  return ctx;
}

export async function requireAdminCampaign(): Promise<AdminContext & { campaign: Campaign }> {
  const ctx = await requireAdmin();
  if (!ctx.campaign) redirect("/admin/campanha?nova=1");
  return ctx as AdminContext & { campaign: Campaign };
}

export async function requireSuperadmin(): Promise<Viewer> {
  const v = await getViewer();
  if (!v || v.participant.role !== "superadmin") redirect("/login?next=/super");
  return v;
}
