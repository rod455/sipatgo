import { getAdminContext, HttpError, type AdminContext } from "./auth";
import type { Campaign } from "./types";

/** Para server actions: garante admin + campanha selecionada da própria company. */
export async function adminAction(): Promise<AdminContext & { campaign: Campaign }> {
  const ctx = await getAdminContext();
  if (!ctx) throw new HttpError(401, "Sessão expirada.");
  if (!ctx.campaign) throw new HttpError(400, "Selecione uma campanha.");
  return ctx as AdminContext & { campaign: Campaign };
}

export async function adminOnly(): Promise<AdminContext> {
  const ctx = await getAdminContext();
  if (!ctx) throw new HttpError(401, "Sessão expirada.");
  return ctx;
}

export type ActionResult = { ok: boolean; message?: string; error?: string };

export async function safe(fn: () => Promise<string | void>): Promise<ActionResult> {
  try {
    const m = await fn();
    return { ok: true, message: m || "Salvo!" };
  } catch (e) {
    if (e instanceof HttpError) return { ok: false, error: e.message };
    if (e && typeof e === "object" && "issues" in e) {
      const issue = (e as { issues: { message: string; path: (string | number)[] }[] }).issues[0];
      return { ok: false, error: `${issue.path.join(".") ? issue.path.join(".") + ": " : ""}${issue.message}` };
    }
    console.error("[action]", e);
    return { ok: false, error: "Erro ao salvar. Tente novamente." };
  }
}
