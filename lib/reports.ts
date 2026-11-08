import { sql } from "./db";
import { formatCpf } from "./cpf";
import { itemLabels } from "./stats";
import { ACTIVITY_LABELS, type ActivityType } from "./activities";

export function toCsv(header: string[], rows: (string | number | null | undefined)[][]): string {
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  // ";" + BOM: abre direto no Excel em pt-BR
  return "﻿" + [header, ...rows].map((r) => r.map(esc).join(";")).join("\r\n");
}

/** Data e hora no fuso de Brasília, no formato que o Excel entende (dd/mm/aaaa hh:mm). */
export function brDateTime(d: Date | string | null | undefined): string {
  if (!d) return "";
  return new Date(d).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(",", "");
}

const STATUS = { done: "Concluído", makeup: "Recuperação", none: "Não realizado" } as const;

export async function attendance(campaignId: string) {
  const rows = await sql<{ participant_id: string; name: string; cpf: string; sector: string; day_index: number; status: keyof typeof STATUS; completed_at: Date | null }[]>`
    select participant_id, name, cpf, sector, day_index, status, completed_at from sipatgo.v_attendance
     where campaign_id = ${campaignId} order by name, day_index`;
  const days = Array.from(new Set(rows.map((r) => r.day_index))).sort();
  const map = new Map<string, { name: string; cpf: string; sector: string; days: Record<number, keyof typeof STATUS> }>();
  for (const r of rows) {
    const e = map.get(r.participant_id) ?? { name: r.name, cpf: r.cpf, sector: r.sector, days: {} };
    e.days[r.day_index] = r.status;
    map.set(r.participant_id, e);
  }
  const people = [...map.values()];
  return { days, people };
}

export async function attendanceCsv(campaignId: string) {
  const { days, people } = await attendance(campaignId);
  const checkins = await sql<{ cpf: string; n: number }[]>`
    select p.cpf, count(*)::int as n from sipatgo.checkins c join sipatgo.events e on e.id = c.event_id join sipatgo.participants p on p.id = c.participant_id
     where e.campaign_id = ${campaignId} group by p.cpf`;
  const ck = new Map(checkins.map((c) => [c.cpf, c.n]));
  return toCsv(
    ["Nome", "CPF", "Setor", ...days.map((d) => `Dia ${d}`), "Dias concluídos", "Check-ins presenciais"],
    people.map((p) => [p.name, formatCpf(p.cpf), p.sector, ...days.map((d) => STATUS[p.days[d] ?? "none"]),
      Object.values(p.days).filter((s) => s !== "none").length, ck.get(p.cpf) ?? 0]),
  );
}

export async function rankingCsv(campaignId: string) {
  const rows = await sql<{ position: number; name: string; cpf: string; sector: string; total_points: number; days_completed: number; total_time_ms: number; badges: string[] }[]>`
    select r.position::int, r.name, p.cpf, r.sector, r.total_points, r.days_completed, r.total_time_ms, r.badges
      from sipatgo.v_ranking_individual r join sipatgo.participants p on p.id = r.participant_id
     where r.campaign_id = ${campaignId} order by r.position, r.name`;
  return toCsv(["Posição", "Nome", "CPF", "Setor", "Pontos", "Dias", "Tempo total (s)", "Selos"],
    rows.map((r) => [r.position, r.name, formatCpf(r.cpf), r.sector, r.total_points, r.days_completed, Math.round(r.total_time_ms / 1000), r.badges.join(" ")]));
}

export async function sectorsCsv(campaignId: string) {
  const rows = await sql<{ position: number; sector: string; members: number; active_members: number; adhesion_pct: number; avg_points: number }[]>`
    select position::int, sector, members, active_members, coalesce(adhesion_pct, 0) as adhesion_pct, avg_points from sipatgo.v_ranking_sector
     where campaign_id = ${campaignId} order by position`;
  return toCsv(["Posição", "Setor", "Pessoas", "Participaram", "Adesão %", "Média de pontos"],
    rows.map((r) => [r.position, r.sector, r.members, r.active_members, String(r.adhesion_pct).replace(".", ","), String(r.avg_points).replace(".", ",")]));
}

export async function awardsCsv(campaignId: string) {
  const rows = await sql<{ code: string; name: string; cpf: string; sector: string; prize: string; status: string; created_at: Date; delivered_at: Date | null }[]>`
    select a.code, p.name, p.cpf, p.sector, pr.internal_name as prize, a.status, a.created_at, a.delivered_at
      from sipatgo.prize_awards a join sipatgo.prizes pr on pr.id = a.prize_id join sipatgo.participants p on p.id = a.participant_id
     where pr.campaign_id = ${campaignId} order by a.created_at`;
  return toCsv(["Código", "Nome", "CPF", "Setor", "Brinde", "Status", "Sorteado em", "Entregue em"],
    rows.map((r) => [r.code, r.name, formatCpf(r.cpf), r.sector, r.prize, r.status, brDateTime(r.created_at), brDateTime(r.delivered_at)]));
}

export async function learning(campaignId: string) {
  const acts = await sql<{ id: string; day_index: number; type: ActivityType; config: Record<string, unknown> }[]>`
    select a.id, d.day_index, a.type, a.config from sipatgo.activities a join sipatgo.campaign_days d on d.id = a.campaign_day_id
     where d.campaign_id = ${campaignId} order by d.day_index`;
  const out: { day_index: number; type: string; item: number; label: string; answered: number; first_ok: number; rate: number | null }[] = [];
  for (const a of acts) {
    const stats = await sql<{ item_index: number; answered: number; first_ok: number }[]>`
      select item_index, count(distinct participant_id) filter (where is_correct)::int as answered,
             count(*) filter (where is_correct and attempt_no = 1)::int as first_ok
        from sipatgo.attempts where activity_id = ${a.id} and item_index >= 0 group by item_index`;
    itemLabels(a.type, a.config).forEach((label, i) => {
      const s = stats.find((x) => x.item_index === i);
      out.push({ day_index: a.day_index, type: ACTIVITY_LABELS[a.type], item: i + 1, label, answered: s?.answered ?? 0, first_ok: s?.first_ok ?? 0, rate: s?.answered ? Math.round((100 * s.first_ok) / s.answered) : null });
    });
  }
  return out;
}

export async function learningCsv(campaignId: string) {
  const rows = await learning(campaignId);
  return toCsv(["Dia", "Dinâmica", "Item", "Enunciado", "Responderam", "Acertaram de primeira", "% 1ª tentativa"],
    rows.map((r) => [r.day_index, r.type, r.item, r.label, r.answered, r.first_ok, r.rate ?? ""]));
}

export async function certificatesCsv(campaignId: string) {
  const rows = await sql<{ code: string; name: string; cpf: string; sector: string; hours: number; days_completed: number; issued_at: Date }[]>`
    select c.code, p.name, p.cpf, p.sector, c.hours, c.days_completed, c.issued_at from sipatgo.certificates c join sipatgo.participants p on p.id = c.participant_id
     where c.campaign_id = ${campaignId} order by p.name`;
  return toCsv(["Código", "Nome", "CPF", "Setor", "Carga horária (h)", "Dias", "Emitido em"],
    rows.map((r) => [r.code, r.name, formatCpf(r.cpf), r.sector, String(r.hours).replace(".", ","), r.days_completed, brDateTime(r.issued_at)]));
}

export async function reportSummary(campaignId: string) {
  const [s] = await sql<{ people: number; active: number; completions: number; makeups: number; first_try: number; correct: number; prizes: number; delivered: number; posts: number; checkins: number; certs: number; family: number }[]>`
    select
      (select count(*)::int from sipatgo.participants where campaign_id = ${campaignId} and role in ('participant','leader')) as people,
      (select count(*)::int from sipatgo.participant_scores where campaign_id = ${campaignId} and days_completed > 0) as active,
      (select count(*)::int from sipatgo.day_completions dc join sipatgo.campaign_days d on d.id = dc.campaign_day_id where d.campaign_id = ${campaignId}) as completions,
      (select count(*)::int from sipatgo.day_completions dc join sipatgo.campaign_days d on d.id = dc.campaign_day_id where d.campaign_id = ${campaignId} and dc.is_makeup) as makeups,
      (select count(*)::int from sipatgo.attempts t join sipatgo.activities a on a.id = t.activity_id join sipatgo.campaign_days d on d.id = a.campaign_day_id where d.campaign_id = ${campaignId} and t.is_correct and t.attempt_no = 1 and t.item_index >= 0) as first_try,
      (select count(*)::int from sipatgo.attempts t join sipatgo.activities a on a.id = t.activity_id join sipatgo.campaign_days d on d.id = a.campaign_day_id where d.campaign_id = ${campaignId} and t.is_correct) as correct,
      (select count(*)::int from sipatgo.prize_awards a join sipatgo.prizes p on p.id = a.prize_id where p.campaign_id = ${campaignId} and a.status <> 'cancelled') as prizes,
      (select count(*)::int from sipatgo.prize_awards a join sipatgo.prizes p on p.id = a.prize_id where p.campaign_id = ${campaignId} and a.status = 'delivered') as delivered,
      (select count(*)::int from sipatgo.wall_posts where campaign_id = ${campaignId} and status = 'approved') as posts,
      (select count(*)::int from sipatgo.checkins c join sipatgo.events e on e.id = c.event_id where e.campaign_id = ${campaignId}) as checkins,
      (select count(*)::int from sipatgo.certificates where campaign_id = ${campaignId}) as certs,
      (select count(*)::int from sipatgo.family_game_completions f join sipatgo.family_games g on g.id = f.family_game_id join sipatgo.campaign_days d on d.id = g.campaign_day_id where d.campaign_id = ${campaignId}) as family`;
  const perDay = await sql<{ day_index: number; title: string; done: number; makeup: number }[]>`
    select d.day_index, d.title,
           count(dc.id) filter (where not dc.is_makeup)::int as done, count(dc.id) filter (where dc.is_makeup)::int as makeup
      from sipatgo.campaign_days d left join sipatgo.day_completions dc on dc.campaign_day_id = d.id
     where d.campaign_id = ${campaignId} group by d.id order by d.day_index`;
  const top = await sql<{ position: number; name: string; sector: string; total_points: number }[]>`
    select position::int, name, sector, total_points from sipatgo.v_ranking_individual where campaign_id = ${campaignId} order by position, name limit 10`;
  const sectors = await sql<{ position: number; sector: string; members: number; adhesion_pct: number; avg_points: number }[]>`
    select position::int, sector, members, coalesce(adhesion_pct,0) as adhesion_pct, avg_points from sipatgo.v_ranking_sector where campaign_id = ${campaignId} order by position`;
  return { s, perDay, top, sectors, learning: await learning(campaignId) };
}

/** Acessos: um colaborador por linha, com primeiro/último acesso e resumo da participação. */
export async function accessCsv(campaignId: string) {
  const rows = await sql<{ name: string; cpf: string; sector: string; role: string; first_login_at: Date | null; last_login_at: Date | null; login_count: number; consent_at: Date | null; days_completed: number; total_points: number }[]>`
    select p.name, p.cpf, p.sector, p.role, p.first_login_at, p.last_login_at, p.login_count, p.consent_at,
           (select count(*)::int from sipatgo.day_completions dc where dc.participant_id = p.id) as days_completed,
           coalesce(sc.total_points, 0)::int as total_points
      from sipatgo.participants p
      left join sipatgo.participant_scores sc on sc.participant_id = p.id
     where p.campaign_id = ${campaignId} and p.role in ('participant', 'leader')
     order by p.name`;
  return toCsv(
    ["Nome", "CPF", "Setor", "Perfil", "Já acessou?", "Primeiro acesso", "Último acesso", "Nº de acessos", "Aceite LGPD", "Dias concluídos", "Pontos"],
    rows.map((r) => [r.name, formatCpf(r.cpf), r.sector, r.role === "leader" ? "Líder" : "Participante", r.first_login_at ? "Sim" : "Não",
      brDateTime(r.first_login_at), brDateTime(r.last_login_at), r.login_count, brDateTime(r.consent_at), r.days_completed, r.total_points]),
  );
}

/** Log completo: cada ação de cada colaborador, em ordem cronológica. */
export async function activityLogCsv(campaignId: string) {
  const rows = await sql<{ at: Date; name: string; cpf: string; sector: string; kind: string; detail: string; points: number | null }[]>`
    with ps as (select id, name, cpf, sector from sipatgo.participants where campaign_id = ${campaignId})
    select l.created_at as at, ps.name, ps.cpf, ps.sector,
           case l.kind when 'pin' then 'Login' else 'Primeiro acesso' end as kind, '' as detail, null::int as points
      from sipatgo.login_events l join ps on ps.id = l.participant_id
    union all
    select c.accepted_at, ps.name, ps.cpf, ps.sector, 'Aceite LGPD', 'versão ' || c.text_version, null
      from sipatgo.consents c join ps on ps.id = c.participant_id
    union all
    select dc.completed_at, ps.name, ps.cpf, ps.sector,
           case when dc.is_makeup then 'Dia concluído (recuperação)' else 'Dia concluído' end,
           'Dia ' || d.day_index || ' · ' || d.title || ' · ' || dc.correct_first_try || ' acertos de 1ª · ' || round(dc.total_time_ms / 1000.0) || 's',
           dc.total_points
      from sipatgo.day_completions dc join ps on ps.id = dc.participant_id join sipatgo.campaign_days d on d.id = dc.campaign_day_id
    union all
    select ck.created_at, ps.name, ps.cpf, ps.sector, 'Check-in presencial', e.name, ck.points_awarded
      from sipatgo.checkins ck join ps on ps.id = ck.participant_id join sipatgo.events e on e.id = ck.event_id
    union all
    select ws.created_at, ps.name, ps.cpf, ps.sector, 'Giro na roleta', 'Dia ' || d.day_index || coalesce(' · ' || pr.internal_name, ' · sem brinde'), null
      from sipatgo.wheel_spins ws join ps on ps.id = ws.participant_id join sipatgo.campaign_days d on d.id = ws.campaign_day_id
      left join sipatgo.prizes pr on pr.id = ws.prize_id
    union all
    select a.delivered_at, ps.name, ps.cpf, ps.sector, 'Brinde entregue', pr.internal_name || ' · código ' || a.code, null
      from sipatgo.prize_awards a join ps on ps.id = a.participant_id join sipatgo.prizes pr on pr.id = a.prize_id
     where a.delivered_at is not null
    union all
    select w.created_at, ps.name, ps.cpf, ps.sector, 'Post no mural',
           case w.status when 'approved' then 'aprovado' when 'rejected' then 'recusado' else 'aguardando aprovação' end || coalesce(nullif(' · ' || left(w.caption, 80), ' · '), ''),
           w.points_awarded
      from sipatgo.wall_posts w join ps on ps.id = w.participant_id
    union all
    select f.completed_at, ps.name, ps.cpf, ps.sector, 'Game da família', 'Dia ' || d.day_index || ' · ' || coalesce(g.config->>'title', g.type), null
      from sipatgo.family_game_completions f join ps on ps.id = f.participant_id
      join sipatgo.family_games g on g.id = f.family_game_id join sipatgo.campaign_days d on d.id = g.campaign_day_id
    union all
    select ce.issued_at, ps.name, ps.cpf, ps.sector, 'Certificado emitido', ce.code || ' · ' || ce.hours || 'h', null
      from sipatgo.certificates ce join ps on ps.id = ce.participant_id where ce.campaign_id = ${campaignId}
    order by 1, 2`;
  return toCsv(["Data e hora", "Nome", "CPF", "Setor", "Ação", "Detalhe", "Pontos"],
    rows.map((r) => [brDateTime(r.at), r.name, formatCpf(r.cpf), r.sector, r.kind, r.detail, r.points ?? ""]));
}
