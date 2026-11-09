"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { HttpError } from "@/lib/auth";
import { adminAction, safe, type ActionResult } from "@/lib/admin-guard";
import { ACTIVITY_TYPES, validateConfig, type ActivityType } from "@/lib/activities";
import { parseYoutubeId } from "@/lib/youtube";
import { storageEnabled, uploadFile } from "@/lib/storage";

async function ownDay(dayId: string) {
  const ctx = await adminAction();
  const [d] = await sql<{ id: string }[]>`select id from sipatgo.campaign_days where id = ${dayId} and campaign_id = ${ctx.campaign.id}`;
  if (!d) throw new HttpError(404, "Dia não encontrado.");
  return ctx;
}

export async function saveDay(_: ActionResult | null, fd: FormData) {
  return safe(async () => {
    const d = z.object({
      day_id: z.string().uuid(), title: z.string().trim().max(120), theme: z.string().trim().max(120),
      youtube: z.string().trim().max(300).default(""), video_duration_s: z.coerce.number().int().min(0).max(7200).default(0),
      clip_start: z.string().trim().max(10).default(""), clip_end: z.string().trim().max(10).default(""),
    }).parse(Object.fromEntries(fd));
    const start = parseClock(d.clip_start);
    const end = parseClock(d.clip_end);
    if (start === undefined || end === undefined) throw new HttpError(400, "Trecho inválido. Use minutos:segundos, ex.: 4:30.");
    if (start !== null && end !== null && end <= start) throw new HttpError(400, "O fim do trecho precisa ser depois do início.");
    // com trecho definido, a duração que vale (anti-pulo e carga horária) é a do trecho
    const duration = start !== null && end !== null ? end - start : end !== null ? end : d.video_duration_s;
    await ownDay(d.day_id);
    const vid = d.youtube ? parseYoutubeId(d.youtube) : null;
    if (d.youtube && !vid) throw new HttpError(400, "Link do YouTube inválido.");
    await sql`update sipatgo.campaign_days set title = ${d.title}, theme = ${d.theme}, youtube_video_id = ${vid},
              video_duration_s = ${duration || null}, video_start_s = ${vid ? start : null}, video_end_s = ${vid ? end : null},
              has_wheel = ${fd.get("has_wheel") === "on"} where id = ${d.day_id}`;
    revalidatePath("/admin/dias");
  });
}

export async function saveActivity(dayId: string, type: ActivityType, config: unknown): Promise<ActionResult> {
  return safe(async () => {
    await ownDay(dayId);
    if (!ACTIVITY_TYPES.includes(type)) throw new HttpError(400, "Tipo inválido.");
    const parsed = validateConfig(type, config);
    if (!parsed.success) {
      const i = parsed.error.issues[0];
      throw new HttpError(400, `${i.path.length ? `Item ${Number(i.path[1] ?? 0) + 1}: ` : ""}${i.message}`);
    }
    const [existing] = await sql<{ id: string; type: string; n: number }[]>`
      select a.id, a.type, (select count(*)::int from sipatgo.attempts t where t.activity_id = a.id) as n
        from sipatgo.activities a where a.campaign_day_id = ${dayId}`;
    if (existing && existing.n > 0 && existing.type !== type) {
      throw new HttpError(400, "Já há respostas neste dia: não é possível trocar o tipo da dinâmica.");
    }
    await sql`
      insert into sipatgo.activities (campaign_day_id, type, config) values (${dayId}, ${type}, ${sql.json(parsed.data as never)})
      on conflict (campaign_day_id) do update set type = excluded.type, config = excluded.config`;
    revalidatePath("/admin/dias");
    return existing?.n ? "Salvo. Atenção: já existem respostas — mudanças valem para as próximas." : "Dinâmica salva!";
  });
}

const familySchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("word_search"), config: z.object({ title: z.string().max(80).default(""), words: z.array(z.string().trim().min(2).max(10)).min(4, "Mínimo 4 palavras").max(10) }) }),
  z.object({ type: z.literal("light_quiz"), config: z.object({ title: z.string().max(80).default(""), items: z.array(z.object({ question: z.string().trim().min(1), options: z.array(z.string().trim().min(1)).min(2).max(4), correct_index: z.number().int().min(0).max(3) })).length(5, "São 5 perguntas") }) }),
]);

export async function saveFamily(dayId: string, input: unknown): Promise<ActionResult> {
  return safe(async () => {
    await ownDay(dayId);
    const f = familySchema.parse(input);
    await sql`
      insert into sipatgo.family_games (campaign_day_id, type, config) values (${dayId}, ${f.type}, ${sql.json(f.config as never)})
      on conflict (campaign_day_id) do update set type = excluded.type, config = excluded.config`;
    revalidatePath("/admin/dias");
    return "Game da família salvo!";
  });
}

export async function addMaterial(_: ActionResult | null, fd: FormData) {
  return safe(async () => {
    const dayId = String(fd.get("day_id"));
    const ctx = await ownDay(dayId);
    const title = String(fd.get("title") ?? "").trim();
    if (!title) throw new HttpError(400, "Informe o título.");
    let url = String(fd.get("url") ?? "").trim();
    let kind = "link";
    const file = fd.get("file");
    if (file instanceof File && file.size > 0) {
      if (!storageEnabled()) throw new HttpError(503, "Storage não configurado: use um link.");
      if (file.type !== "application/pdf") throw new HttpError(400, "Envie um PDF.");
      if (file.size > 10 * 1024 * 1024) throw new HttpError(400, "PDF maior que 10 MB.");
      url = await uploadFile("public", `materials/${ctx.campaign.id}/${randomUUID()}.pdf`, Buffer.from(await file.arrayBuffer()), "application/pdf");
      kind = "pdf";
    } else if (!/^https?:\/\//.test(url)) throw new HttpError(400, "Informe um link (https://) ou envie um PDF.");
    else if (/\.pdf(\?|$)/i.test(url)) kind = "pdf";
    const [{ n }] = await sql<{ n: number }[]>`select count(*)::int as n from sipatgo.materials where campaign_day_id = ${dayId}`;
    await sql`insert into sipatgo.materials (campaign_day_id, title, url, kind, sort) values (${dayId}, ${title}, ${url}, ${kind}, ${n})`;
    revalidatePath("/admin/dias");
    return "Material adicionado.";
  });
}

export async function deleteMaterial(_: ActionResult | null, fd: FormData) {
  return safe(async () => {
    const ctx = await adminAction();
    await sql`delete from sipatgo.materials m using sipatgo.campaign_days d
               where m.id = ${String(fd.get("id"))} and d.id = m.campaign_day_id and d.campaign_id = ${ctx.campaign.id}`;
    revalidatePath("/admin/dias");
  });
}

/** Upload de imagem (dinâmica Encontre os Erros). */
export async function uploadActivityImage(fd: FormData): Promise<{ url?: string; error?: string }> {
  try {
    const ctx = await adminAction();
    const file = fd.get("file");
    if (!(file instanceof File) || !file.size) throw new HttpError(400, "Escolha uma imagem.");
    if (!/^image\/(png|jpeg|webp|svg\+xml)$/.test(file.type)) throw new HttpError(400, "Formato não suportado.");
    if (file.size > 8 * 1024 * 1024) throw new HttpError(400, "Imagem maior que 8 MB.");
    if (!storageEnabled()) throw new HttpError(503, "Storage não configurado (Supabase).");
    const ext = file.type.split("/")[1].replace("svg+xml", "svg").replace("jpeg", "jpg");
    const url = await uploadFile("public", `activities/${ctx.campaign.id}/${randomUUID()}.${ext}`, Buffer.from(await file.arrayBuffer()), file.type);
    return { url };
  } catch (e) {
    return { error: e instanceof HttpError ? e.message : "Falha no upload." };
  }
}

/** "4:30", "1:02:05" ou "270" → segundos. Vazio → null. Inválido → undefined. */
function parseClock(v: string): number | null | undefined {
  if (!v) return null;
  if (/^\d+$/.test(v)) return Number(v);
  const m = /^(?:(\d+):)?(\d{1,2}):(\d{2})$/.exec(v);
  if (!m) return undefined;
  return Number(m[1] ?? 0) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}
