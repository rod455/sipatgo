import { body, handle } from "@/lib/api";
import { recordLogin, setRhPassword, throttle } from "@/lib/login";
import { setSession } from "@/lib/session";

/** Primeiro acesso do RH: confirma e-mail + CPF + nascimento e cria a senha. */
export const POST = handle(async (req: Request) => {
  throttle(`rhpw:${req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "?"}`, 10);
  const b = await body<{ email: string; cpf: string; birth_date: string; password: string }>(req);
  const p = await setRhPassword(b.email, b.cpf, b.birth_date, b.password);
  await setSession({ pid: p.id, cid: p.company_id, v: p.session_version, stage: "full" });
  await recordLogin(p.id, "primeiro_acesso", req.headers.get("user-agent"));
  return { ok: true, role: p.role };
});
