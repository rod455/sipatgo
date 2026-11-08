"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { HttpError } from "@/lib/auth";
import { adminOnly, safe, type ActionResult } from "@/lib/admin-guard";
import { isHexColor } from "@/lib/theme";
import { storageEnabled, uploadFile } from "@/lib/storage";

const TIMEZONES = ["America/Sao_Paulo", "America/Manaus", "America/Cuiaba", "America/Belem", "America/Fortaleza", "America/Recife", "America/Bahia", "America/Porto_Velho", "America/Rio_Branco", "America/Noronha"];

export async function saveIdentity(_: ActionResult | null, fd: FormData) {
  return safe(async () => {
    const ctx = await adminOnly();
    const d = z.object({
      name: z.string().trim().min(2).max(120),
      primary_color: z.string(), secondary_color: z.string(), accent_color: z.string(),
      timezone: z.string(), consent_text: z.string().trim().min(20, "Texto de consentimento muito curto").max(4000),
      notifications_webhook_url: z.string().trim().max(500).default(""),
    }).parse(Object.fromEntries(fd));
    for (const k of ["primary_color", "secondary_color", "accent_color"] as const) if (!isHexColor(d[k])) throw new HttpError(400, "Cor inválida.");
    if (!TIMEZONES.includes(d.timezone)) throw new HttpError(400, "Fuso inválido.");
    if (d.notifications_webhook_url && !/^https:\/\//.test(d.notifications_webhook_url)) throw new HttpError(400, "Webhook deve começar com https://");

    let logo: string | undefined;
    const file = fd.get("logo");
    if (file instanceof File && file.size > 0) {
      if (!storageEnabled()) throw new HttpError(503, "Storage não configurado: não é possível enviar o logo.");
      if (!/^image\/(png|jpeg|svg\+xml|webp)$/.test(file.type)) throw new HttpError(400, "Logo deve ser PNG, JPG, WebP ou SVG.");
      if (file.size > 2 * 1024 * 1024) throw new HttpError(400, "Logo maior que 2 MB.");
      const ext = file.type.split("/")[1].replace("svg+xml", "svg").replace("jpeg", "jpg");
      logo = await uploadFile("public", `logos/${ctx.adminCompany.id}/${randomUUID()}.${ext}`, Buffer.from(await file.arrayBuffer()), file.type);
    }
    const [cur] = await sql<{ consent_text: string; consent_version: string }[]>`select consent_text, consent_version from sipatgo.companies where id = ${ctx.adminCompany.id}`;
    const version = cur.consent_text === d.consent_text ? cur.consent_version : `v${(parseInt(cur.consent_version.replace(/\D/g, "")) || 1) + 1}`;
    await sql`
      update sipatgo.companies set name = ${d.name}, primary_color = ${d.primary_color}, secondary_color = ${d.secondary_color}, accent_color = ${d.accent_color},
             timezone = ${d.timezone}, consent_text = ${d.consent_text}, consent_version = ${version},
             notifications_webhook_url = ${d.notifications_webhook_url || null}, allow_photo_avatar = ${fd.get("allow_photo_avatar") === "on"}, logo_url = coalesce(${logo ?? null}, logo_url)
       where id = ${ctx.adminCompany.id}`;
    if (fd.get("remove_logo") === "on") await sql`update sipatgo.companies set logo_url = null where id = ${ctx.adminCompany.id}`;
    revalidatePath("/", "layout");
  });
}


