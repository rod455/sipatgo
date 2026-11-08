"use server";

import { revalidatePath } from "next/cache";
import { adminAction, safe, type ActionResult } from "@/lib/admin-guard";
import { moderatePost, electDailyWinner } from "@/lib/wall";

export async function moderate(_: ActionResult | null, fd: FormData) {
  return safe(async () => {
    const ctx = await adminAction();
    await moderatePost(ctx.participant.id, ctx.campaign.id, String(fd.get("id")), fd.get("approve") === "1");
    revalidatePath("/admin/mural");
  });
}

export async function electWinner(_: ActionResult | null, fd: FormData) {
  return safe(async () => {
    const ctx = await adminAction();
    const w = await electDailyWinner(ctx.campaign.id, Number(fd.get("day")));
    revalidatePath("/admin/mural");
    return w ? "Vencedor definido." : "Nenhum post com votos neste dia.";
  });
}
