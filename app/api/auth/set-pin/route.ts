import bcrypt from "bcryptjs";
import { body, handle } from "@/lib/api";
import { HttpError, getViewer } from "@/lib/auth";
import { getSession, setSession } from "@/lib/session";
import { setPin } from "@/lib/login";

export const POST = handle(async (req: Request) => {
  const s = await getSession();
  const v = await getViewer({ allowOnboarding: true });
  if (!s || !v) throw new HttpError(401, "Sessão expirada. Comece de novo.");
  const b = await body<{ pin: string; current_pin?: string }>(req);
  if (s.stage === "full") {
    // troca de PIN pelo perfil
    if (!v.participant.pin_hash || !(await bcrypt.compare(String(b.current_pin ?? ""), v.participant.pin_hash))) {
      throw new HttpError(401, "Senha atual incorreta.");
    }
  } else if (!v.participant.consent_at) {
    throw new HttpError(400, "Aceite o termo de consentimento primeiro.");
  }
  const version = await setPin(v.participant, b.pin);
  await setSession({ pid: v.participant.id, cid: v.company.id, v: version, stage: "full" });
  return { ok: true, role: v.participant.role };
});
