import { sql } from "./db";

export type ComplianceItem = {
  key: string;
  label: string;
  reference: string;
  ok: boolean;
  level: "obrigatorio" | "recomendado" | "lembrete";
  detail: string;
};

/**
 * Checklist de conformidade da SIPAT com a NR-5 (texto conferido no gov.br,
 * versão com a Portaria MTP nº 4.219/2022). Não substitui a análise do SESMT/jurídico.
 */
export async function campaignCompliance(campaignId: string): Promise<ComplianceItem[]> {
  const [c] = await sql<{ cipa_approval: string | null; days: number; activities: number; events: number; harassment: boolean }[]>`
    select ca.cipa_approval,
           (select count(*)::int from sipatgo.campaign_days d where d.campaign_id = ca.id) as days,
           (select count(*)::int from sipatgo.activities a join sipatgo.campaign_days d on d.id = a.campaign_day_id where d.campaign_id = ca.id) as activities,
           (select count(*)::int from sipatgo.events e where e.campaign_id = ca.id) as events,
           exists(
             select 1 from sipatgo.campaign_days d
               left join sipatgo.activities a on a.campaign_day_id = d.id
               left join sipatgo.materials m on m.campaign_day_id = d.id
              where d.campaign_id = ca.id
                and (d.title || ' ' || d.theme || ' ' || coalesce(a.config::text, '') || ' ' || coalesce(m.title, '')) ~* 'ass[eé]dio'
           ) as harassment
      from sipatgo.campaigns ca where ca.id = ${campaignId}`;
  if (!c) return [];
  return [
    {
      key: "cipa", level: "obrigatorio", reference: "NR-5, item 5.3.1, alínea “i”",
      label: "Programação definida pela CIPA",
      ok: Boolean(c.cipa_approval && c.cipa_approval.trim().length >= 3),
      detail: c.cipa_approval?.trim()
        ? `Registrado: ${c.cipa_approval.trim()}`
        : "Informe a ata/data da reunião da CIPA que aprovou a programação (com o SESMT, onde houver).",
    },
    {
      key: "assedio", level: "obrigatorio", reference: "NR-5, item 5.3.1, alínea “j”",
      label: "Tema de prevenção ao assédio na programação",
      ok: c.harassment,
      detail: c.harassment ? "A programação trata de assédio." : "Inclua prevenção ao assédio sexual e a outras formas de violência no trabalho em algum dia, dinâmica ou material.",
    },
    {
      key: "presencial", level: "recomendado", reference: "Recomendação SipatGo (SIPAT híbrida)",
      label: "Ação presencial com check-in",
      ok: c.events > 0,
      detail: c.events > 0 ? `${c.events} evento(s) presencial(is) cadastrado(s).` : "Cadastre ao menos uma ação presencial (abertura, palestra, simulado) e ofereça alternativa a quem não tem celular.",
    },
    {
      key: "conteudo", level: "recomendado", reference: "Programação completa",
      label: "Dinâmica configurada nos 5 dias",
      ok: c.days > 0 && c.activities >= c.days,
      detail: `${c.activities} de ${c.days} dias com dinâmica.`,
    },
    {
      key: "guarda", level: "lembrete", reference: "NR-5, item 5.9.2",
      label: "Guardar a documentação por 5 anos",
      ok: true,
      detail: "Ao final, exporte o relatório e a lista de presença e guarde com as atas da CIPA, no estabelecimento, por no mínimo 5 anos.",
    },
  ];
}
