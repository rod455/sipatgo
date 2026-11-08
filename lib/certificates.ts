import { sql } from "./db";

export type CertificateData = {
  code: string; hours: number; days_completed: number; issued_at: Date;
  name: string; cpf: string; sector: string;
  campaign_name: string; theme: string; start_date: string; end_date: string;
  company_name: string; logo_url: string | null; primary_color: string; accent_color: string; timezone: string;
};

export async function getCertificate(code: string): Promise<CertificateData | null> {
  const clean = String(code ?? "").toUpperCase().replace(/[^A-Z0-9-]/g, "");
  const [c] = await sql<CertificateData[]>`
    select ce.code, ce.hours, ce.days_completed, ce.issued_at,
           p.name, p.cpf, p.sector,
           ca.name as campaign_name, ca.theme, ca.start_date, ca.end_date,
           co.name as company_name, co.logo_url, co.primary_color, co.accent_color, co.timezone
      from sipatgo.certificates ce
      join sipatgo.participants p on p.id = ce.participant_id
      join sipatgo.campaigns ca on ca.id = ce.campaign_id
      join sipatgo.companies co on co.id = ca.company_id
     where ce.code = ${clean}`;
  return c ?? null;
}
