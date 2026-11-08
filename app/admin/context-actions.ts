"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ADMIN_CAMPAIGN_COOKIE, ADMIN_COMPANY_COOKIE, getAdminContext } from "@/lib/auth";

export async function selectCampaign(id: string) {
  const ctx = await getAdminContext();
  if (!ctx || !ctx.campaigns.some((c) => c.id === id)) return;
  (await cookies()).set(ADMIN_CAMPAIGN_COOKIE, id, { path: "/", httpOnly: true, sameSite: "lax" });
  revalidatePath("/admin", "layout");
}

export async function selectCompany(id: string) {
  const ctx = await getAdminContext();
  if (!ctx || ctx.participant.role !== "superadmin") return;
  const jar = await cookies();
  jar.set(ADMIN_COMPANY_COOKIE, id, { path: "/", httpOnly: true, sameSite: "lax" });
  jar.delete(ADMIN_CAMPAIGN_COOKIE);
  revalidatePath("/admin", "layout");
  redirect("/admin");
}
