import { randomUUID } from "node:crypto";
import { sql } from "./db";
import { now } from "./clock";
import { HttpError } from "./auth";
import { isClosed, releaseAt } from "./calendar";
import { localDate, zonedInstant } from "./dates";
import { loadCampaign, loadDays, type ClockCampaign } from "./game";
import { uploadFile, signedUrls, storageEnabled } from "./storage";
import { notify } from "./notify";
import { awardBadges, evaluateBadges } from "./badges";
import { pingScores } from "./realtime";
import { WALL_POST_POINTS, WALL_TOP_POST_POINTS } from "./scoring";
import type { CampaignDay, Participant } from "./types";

export function votingDeadline(c: ClockCampaign, days: CampaignDay[]): Date {
  if (c.wall_voting_deadline) return new Date(c.wall_voting_deadline);
  const d4 = days.find((d) => d.day_index === 4) ?? days[days.length - 1];
  return zonedInstant(d4?.date ?? c.end_date, "23:59:59", c.timezone);
}

/** Dia da campanha "corrente" (último já liberado). */
export function currentDayIndex(c: ClockCampaign, days: CampaignDay[], t: Date): number | null {
  let idx: number | null = null;
  for (const d of days) if (t >= releaseAt(c, d)) idx = d.day_index;
  return idx;
}

export async function createPost(p: Participant, file: File, caption: string) {
  if (!p.campaign_id) throw new HttpError(400, "Sem campanha ativa.");
  if (!storageEnabled()) throw new HttpError(503, "Envio de imagens indisponível no momento.");
  const c = (await loadCampaign(p.campaign_id))!;
  const days = await loadDays(c.id);
  const t = now();
  if (isClosed(c, t)) throw new HttpError(400, "A campanha foi encerrada.");
  const dayIndex = currentDayIndex(c, days, t);
  if (!dayIndex) throw new HttpError(400, "O mural abre junto com a campanha.");
  if (!file || file.size === 0) throw new HttpError(400, "Escolha uma imagem.");
  if (file.size > 5 * 1024 * 1024) throw new HttpError(400, "Imagem maior que 5 MB.");
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new HttpError(400, "Formato não suportado (use JPG, PNG ou WebP).");
  const text = (caption ?? "").trim().slice(0, 280);
  const [{ n }] = await sql<{ n: number }[]>`
    select count(*)::int as n from sipatgo.wall_posts where participant_id = ${p.id} and campaign_id = ${c.id} and created_at > ${t}::timestamptz - interval '1 day'`;
  if (n >= 5) throw new HttpError(429, "Limite de 5 posts por dia.");

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `wall/${c.id}/${randomUUID()}.${ext}`;
  await uploadFile("private", path, Buffer.from(await file.arrayBuffer()), file.type);
  const [post] = await sql<{ id: string }[]>`
    insert into sipatgo.wall_posts (campaign_id, participant_id, image_path, caption, day_index, status)
    values (${c.id}, ${p.id}, ${path}, ${text}, ${dayIndex}, 'pending') returning id`;
  void notify({
    companyId: p.company_id, campaignId: c.id, event: "wall.post_pending",
    data: { post_id: post.id, participant: p.name, sector: p.sector, caption: text },
  });
  return post;
}

export type WallPost = {
  id: string; caption: string; image_path: string; image_url?: string; day_index: number;
  status: string; created_at: Date; participant_id: string; name: string; sector: string;
  avatar_config: unknown; votes: number; voted: boolean; is_winner: boolean;
};

export async function listPosts(campaignId: string, viewerId: string, opts: { status?: string; mine?: boolean } = {}) {
  const status = opts.status ?? "approved";
  const rows = await sql<WallPost[]>`
    select w.id, w.caption, w.image_path, w.day_index, w.status, w.created_at, w.participant_id,
           p.name, p.sector, p.avatar_config,
           (select count(*)::int from sipatgo.wall_votes v where v.post_id = w.id) as votes,
           exists(select 1 from sipatgo.wall_votes v where v.post_id = w.id and v.participant_id = ${viewerId}) as voted,
           exists(select 1 from sipatgo.wall_daily_winners dw where dw.post_id = w.id) as is_winner
      from sipatgo.wall_posts w join sipatgo.participants p on p.id = w.participant_id
     where w.campaign_id = ${campaignId}
       and (${opts.mine ?? false} and w.participant_id = ${viewerId} or not ${opts.mine ?? false} and w.status = ${status})
     order by w.created_at desc
     limit 200`;
  const urls = await signedUrls(rows.map((r) => r.image_path));
  return rows.map((r) => ({ ...r, image_url: urls[r.image_path] }));
}

export async function toggleVote(p: Participant, postId: string) {
  if (!p.campaign_id) throw new HttpError(400, "Sem campanha.");
  const c = (await loadCampaign(p.campaign_id))!;
  const days = await loadDays(c.id);
  if (now() > votingDeadline(c, days)) throw new HttpError(400, "A votação do mural foi encerrada.");
  const [post] = await sql<{ participant_id: string }[]>`
    select participant_id from sipatgo.wall_posts where id = ${postId} and campaign_id = ${c.id} and status = 'approved'`;
  if (!post) throw new HttpError(404, "Post não encontrado.");
  if (post.participant_id === p.id) throw new HttpError(400, "Não vale votar no próprio post 😉");
  const del = await sql`delete from sipatgo.wall_votes where post_id = ${postId} and participant_id = ${p.id} returning post_id`;
  if (del.length) return { voted: false };
  await sql`insert into sipatgo.wall_votes (post_id, participant_id) values (${postId}, ${p.id}) on conflict do nothing`;
  return { voted: true };
}

/** wall-moderate */
export async function moderatePost(adminId: string, campaignId: string, postId: string, approve: boolean) {
  const [post] = await sql<{ id: string; participant_id: string; day_index: number; status: string }[]>`
    select id, participant_id, day_index, status from sipatgo.wall_posts where id = ${postId} and campaign_id = ${campaignId}`;
  if (!post) throw new HttpError(404, "Post não encontrado.");
  let points = 0;
  if (approve) {
    // máx. 1 post pontuando por dia por participante
    const [other] = await sql`
      select 1 from sipatgo.wall_posts where participant_id = ${post.participant_id} and campaign_id = ${campaignId}
         and day_index = ${post.day_index} and status = 'approved' and points_awarded > 0 and id <> ${post.id}`;
    points = other ? 0 : WALL_POST_POINTS;
  }
  await sql`
    update sipatgo.wall_posts set status = ${approve ? "approved" : "rejected"}, points_awarded = ${points},
           reviewed_by = ${adminId}, reviewed_at = ${now()}
     where id = ${post.id}`;
  if (approve) await evaluateBadges(post.participant_id);
  pingScores(campaignId);
}

/** daily-wall-winner: elege o post mais votado de um dia (desempate: aprovado primeiro). */
export async function electDailyWinner(campaignId: string, dayIndex: number) {
  const [winner] = await sql<{ id: string; participant_id: string }[]>`
    select w.id, w.participant_id
      from sipatgo.wall_posts w
      left join sipatgo.wall_votes v on v.post_id = w.id
     where w.campaign_id = ${campaignId} and w.day_index = ${dayIndex} and w.status = 'approved'
     group by w.id
    having count(v.post_id) > 0
     order by count(v.post_id) desc, w.reviewed_at asc nulls last, w.created_at asc
     limit 1`;
  if (!winner) return null;
  const ins = await sql`
    insert into sipatgo.wall_daily_winners (campaign_id, day_index, post_id, points_awarded)
    values (${campaignId}, ${dayIndex}, ${winner.id}, ${WALL_TOP_POST_POINTS})
    on conflict do nothing returning post_id`;
  if (ins.length) {
    await awardBadges(winner.participant_id, ["top_post"]);
    pingScores(campaignId);
  }
  return winner.id;
}

export function localToday(c: ClockCampaign) {
  return localDate(now(), c.timezone);
}
