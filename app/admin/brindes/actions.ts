"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { HttpError } from "@/lib/auth";
import { adminAction, safe, type ActionResult } from "@/lib/admin-guard";
import { deliverPrize } from "@/lib/prizes";
import { normalizeCode } from "@/lib/codes";
import { now } from "@/lib/clock";

const prize = z.object({
  internal_name: z.string().trim().min(1, "Nome obrigatório").max(120),
  stock_total: z.coerce.number().int().min(0).max(100000),
  weight: z.coerce.number().int().min(1).max(1000),
});

export async function createPrize(_: ActionResult | null, fd: FormData) {
  return safe(async () => {
    const ctx = await adminAction();
    const d = prize.parse(Object.fromEntries(fd));
    await sql`insert into sipatgo.prizes (campaign_id, internal_name, stock_total, stock_available, weight)
              values (${ctx.campaign.id}, ${d.internal_name}, ${d.stock_total}, ${d.stock_total}, ${d.weight})`;
    revalidatePath("/admin/brindes");
    return "Brinde criado.";
  });
}

export async function updatePrize(_: ActionResult | null, fd: FormData) {
  return safe(async () => {
    const ctx = await adminAction();
    const d = prize.parse(Object.fromEntries(fd));
    const id = String(fd.get("id"));
    // estoque disponível acompanha a mudança no total (sem ficar negativo)
    const rows = await sql`
      update sipatgo.prizes p set internal_name = ${d.internal_name}, weight = ${d.weight}, active = ${fd.get("active") === "on"},
             stock_available = greatest(0, p.stock_available + (${d.stock_total} - p.stock_total)), stock_total = ${d.stock_total}
       where id = ${id} and campaign_id = ${ctx.campaign.id} returning id`;
    if (!rows.length) throw new HttpError(404, "Brinde não encontrado.");
    revalidatePath("/admin/brindes");
  });
}

export async function deletePrize(_: ActionResult | null, fd: FormData) {
  return safe(async () => {
    const ctx = await adminAction();
    const id = String(fd.get("id"));
    const [used] = await sql`select 1 from sipatgo.prize_awards where prize_id = ${id} limit 1`;
    if (used) {
      await sql`update sipatgo.prizes set active = false where id = ${id} and campaign_id = ${ctx.campaign.id}`;
      revalidatePath("/admin/brindes");
      return "Brinde já sorteado: foi desativado em vez de excluído.";
    }
    await sql`delete from sipatgo.prizes where id = ${id} and campaign_id = ${ctx.campaign.id}`;
    revalidatePath("/admin/brindes");
    return "Brinde excluído.";
  });
}

export async function markDelivered(_: ActionResult | null, fd: FormData) {
  return safe(async () => {
    const ctx = await adminAction();
    const id = fd.get("id") ? String(fd.get("id")) : undefined;
    const raw = fd.get("code") ? normalizeCode(String(fd.get("code"))) : "";
    const code = raw.length === 8 ? `${raw.slice(0, 4)}-${raw.slice(4)}` : undefined;
    if (!id && !code) throw new HttpError(400, "Informe o código (8 caracteres).");
    const ok = await deliverPrize(ctx.participant.id, ctx.campaign.id, { id, code });
    if (!ok) throw new HttpError(404, "Código não encontrado ou já entregue.");
    revalidatePath("/admin/entregas");
    return "Entrega registrada ✔";
  });
}

export async function cancelAward(_: ActionResult | null, fd: FormData) {
  return safe(async () => {
    const ctx = await adminAction();
    const id = String(fd.get("id"));
    await sql.begin(async (tx) => {
      const [a] = await tx<{ prize_id: string }[]>`
        update sipatgo.prize_awards a set status = 'cancelled', delivered_at = ${now()}, delivered_by = ${ctx.participant.id}
          from sipatgo.prizes p where p.id = a.prize_id and p.campaign_id = ${ctx.campaign.id} and a.id = ${id} and a.status = 'pending'
        returning a.prize_id`;
      if (!a) throw new HttpError(404, "Não encontrado.");
      await tx`update sipatgo.prizes set stock_available = stock_available + 1 where id = ${a.prize_id}`;
    });
    revalidatePath("/admin/entregas");
    return "Cancelado e estoque devolvido.";
  });
}
