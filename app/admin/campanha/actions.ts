"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { ADMIN_CAMPAIGN_COOKIE, HttpError } from "@/lib/auth";
import { adminAction, adminOnly, safe, type ActionResult } from "@/lib/admin-guard";
import { addDays, weekdayName, zonedInstant } from "@/lib/dates";
import { createCampaignWithDefaults } from "@/lib/defaults";
import { closeCampaign, issueCertificates } from "@/lib/close";
import { db } from "@/lib/db";

const dateRe = /^\d{4}-\d{2}-\d{2}$/;
const campaignSchema = z.object({
  name: z.string().trim().min(2, "Nome obrigatório").max(120),
  theme: z.string().trim().max(200).default(""),
  start_date: z.string().regex(dateRe, "Data inválida"),
  release_time: z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido"),
  makeup_deadline: z.string().optional().default(""),
  wall_voting_deadline: z.string().optional().default(""),
  makeup_factor: z.coerce.number().min(0).max(1),
  min_days_for_certificate: z.coerce.number().int().min(1).max(5),
  opening_message: z.string().max(2000).default(""),
  opening_video_url: z.string().max(300).default(""),
  wall_challenge: z.string().max(300).default(""),
  cipa_approval: z.string().trim().max(300).default(""),
  status: z.enum(["draft", "scheduled", "active", "closed"]),
});

function localToInstant(v: string, tz: string): Date | null {
  if (!v) return null;
  const [d, t] = v.split("T");
  return zonedInstant(d, t ?? "00:00", tz);
}

export async function saveCampaign(_: ActionResult | null, fd: FormData) {
  return safe(async () => {
    const ctx = await adminAction();
    const d = campaignSchema.parse(Object.fromEntries(fd));
    if (weekdayName(d.start_date) !== "Segunda") throw new HttpError(400, "A campanha deve começar numa segunda-feira.");
    const tz = ctx.adminCompany.timezone;
    if (d.status === "closed" && ctx.campaign.status !== "closed") throw new HttpError(400, "Use o botão “Encerrar campanha agora” para encerrar.");
    await sql.begin(async (tx) => {
      await tx`
        update sipatgo.campaigns set name = ${d.name}, theme = ${d.theme}, start_date = ${d.start_date}, end_date = ${addDays(d.start_date, 4)},
               release_time = ${d.release_time}, makeup_deadline = ${localToInstant(d.makeup_deadline, tz)},
               wall_voting_deadline = ${localToInstant(d.wall_voting_deadline, tz)},
               makeup_factor = ${d.makeup_factor}, min_days_for_certificate = ${d.min_days_for_certificate},
               opening_message = ${d.opening_message || null}, opening_video_url = ${d.opening_video_url || null},
               wall_challenge = ${d.wall_challenge || null}, cipa_approval = ${d.cipa_approval || null}, status = ${d.status}
         where id = ${ctx.campaign.id} and company_id = ${ctx.adminCompany.id}`;
      for (let i = 1; i <= 5; i++) {
        await tx`update sipatgo.campaign_days set date = ${addDays(d.start_date, i - 1)} where campaign_id = ${ctx.campaign.id} and day_index = ${i}`;
      }
    });
    revalidatePath("/admin", "layout");
  });
}

export async function createCampaign(_: ActionResult | null, fd: FormData) {
  let id: string | null = null;
  const res = await safe(async () => {
    const ctx = await adminOnly();
    const d = z.object({ name: z.string().trim().min(2, "Nome obrigatório"), theme: z.string().trim().default(""), start_date: z.string().regex(dateRe, "Data inválida") }).parse(Object.fromEntries(fd));
    if (weekdayName(d.start_date) !== "Segunda") throw new HttpError(400, "Escolha uma segunda-feira como início.");
    const template = fd.get("template") === "transporte" ? "transporte" : "industria";
    id = await createCampaignWithDefaults(db(), ctx.adminCompany.id, { ...d, template, withPrizes: fd.get("with_prizes") === "on" });
    (await cookies()).set(ADMIN_CAMPAIGN_COOKIE, id, { path: "/", httpOnly: true, sameSite: "lax" });
  });
  if (res.ok && id) redirect("/admin/campanha");
  return res;
}

export async function closeNow() {
  return safe(async () => {
    const ctx = await adminAction();
    await closeCampaign(ctx.campaign.id);
    revalidatePath("/admin", "layout");
    return "Campanha encerrada, pódio calculado e certificados emitidos.";
  });
}

export async function reissueCertificates() {
  return safe(async () => {
    const ctx = await adminAction();
    const n = await issueCertificates(ctx.campaign.id);
    return `${n} certificado(s) novo(s) emitido(s).`;
  });
}
