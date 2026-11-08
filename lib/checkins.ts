import { sql } from "./db";
import { now } from "./clock";
import { HttpError } from "./auth";
import { isClosed } from "./calendar";
import { parseCheckinToken, verifyCheckinMac } from "./checkin";
import { normalizeCode } from "./codes";
import { loadCampaign } from "./game";
import { evaluateBadges } from "./badges";
import { pingScores } from "./realtime";
import type { Participant } from "./types";

type EventRow = { id: string; campaign_id: string; name: string; starts_at: Date; ends_at: Date; points: number; secret: string; code: string };

/** checkin: valida token (QR) ou código curto + janela de horário. */
export async function doCheckin(p: Participant, input: string) {
  if (!p.campaign_id) throw new HttpError(400, "Sem campanha.");
  const raw = (input ?? "").trim();
  let ev: EventRow | undefined;
  const token = parseCheckinToken(raw.includes("/") ? raw.split(/[?#/=]/).pop() ?? "" : raw);
  if (token) {
    [ev] = await sql<EventRow[]>`select * from sipatgo.events where id = ${token.eventId}`;
    if (!ev || !verifyCheckinMac(ev.id, ev.secret, token.mac)) throw new HttpError(400, "QR code inválido.");
  } else {
    const code = normalizeCode(raw);
    if (code.length !== 6) throw new HttpError(400, "Código inválido. São 6 caracteres.");
    [ev] = await sql<EventRow[]>`select * from sipatgo.events where code = ${code}`;
  }
  if (!ev || ev.campaign_id !== p.campaign_id) throw new HttpError(404, "Evento não encontrado nesta campanha.");
  const t = now();
  const c = (await loadCampaign(ev.campaign_id))!;
  if (isClosed(c, t)) throw new HttpError(400, "A campanha foi encerrada.");
  if (t < new Date(ev.starts_at)) throw new HttpError(400, "O check-in deste evento ainda não abriu.");
  if (t > new Date(ev.ends_at)) throw new HttpError(400, "O check-in deste evento já encerrou.");
  const rows = await sql`
    insert into sipatgo.checkins (event_id, participant_id, points_awarded, created_at)
    values (${ev.id}, ${p.id}, ${ev.points}, ${t})
    on conflict (event_id, participant_id) do nothing returning id`;
  if (!rows.length) return { ok: true, already: true, event: ev.name, points: 0, new_badges: [] as string[] };
  const newBadges = await evaluateBadges(p.id);
  pingScores(ev.campaign_id);
  return { ok: true, already: false, event: ev.name, points: ev.points, new_badges: newBadges };
}
