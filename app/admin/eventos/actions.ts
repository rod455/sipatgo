"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { HttpError } from "@/lib/auth";
import { adminAction, safe, type ActionResult } from "@/lib/admin-guard";
import { randomCode } from "@/lib/codes";
import { zonedInstant } from "@/lib/dates";

export async function createEvent(_: ActionResult | null, fd: FormData) {
  return safe(async () => {
    const ctx = await adminAction();
    const d = z.object({
      name: z.string().trim().min(2, "Nome obrigatório"), day_id: z.string().default(""),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"), start: z.string().regex(/^\d{2}:\d{2}$/), end: z.string().regex(/^\d{2}:\d{2}$/),
      points: z.coerce.number().int().min(0).max(1000).default(100),
    }).parse(Object.fromEntries(fd));
    const tz = ctx.adminCompany.timezone;
    const starts = zonedInstant(d.date, d.start, tz), ends = zonedInstant(d.date, d.end, tz);
    if (ends <= starts) throw new HttpError(400, "O fim deve ser depois do início.");
    let dayId: string | null = d.day_id || null;
    if (!dayId) {
      const [day] = await sql<{ id: string }[]>`select id from sipatgo.campaign_days where campaign_id = ${ctx.campaign.id} and date = ${d.date}`;
      dayId = day?.id ?? null;
    }
    for (let i = 0; i < 5; i++) {
      try {
        await sql`insert into sipatgo.events (campaign_id, campaign_day_id, name, starts_at, ends_at, points, code)
                  values (${ctx.campaign.id}, ${dayId}, ${d.name}, ${starts}, ${ends}, ${d.points}, ${randomCode(6)})`;
        break;
      } catch (e) { if (i === 4) throw e; }
    }
    revalidatePath("/admin/eventos");
    return "Evento criado.";
  });
}

export async function deleteEvent(_: ActionResult | null, fd: FormData) {
  return safe(async () => {
    const ctx = await adminAction();
    const [n] = await sql<{ n: number }[]>`select count(*)::int as n from sipatgo.checkins c join sipatgo.events e on e.id = c.event_id where e.id = ${String(fd.get("id"))}`;
    if (n?.n) throw new HttpError(400, "Já há check-ins neste evento; não é possível excluir.");
    await sql`delete from sipatgo.events where id = ${String(fd.get("id"))} and campaign_id = ${ctx.campaign.id}`;
    revalidatePath("/admin/eventos");
  });
}
