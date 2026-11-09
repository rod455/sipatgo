import { body, handle } from "@/lib/api";
import { consumeRhPasswordToken, recordLogin, throttle } from "@/lib/login";
import { setSession } from "@/lib/session";

export const POST = handle(async (req: Request) => {
  throttle(`rhreset:${req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "?"}`, 10);
  const b = await body<{ token: string; password: string }>(req);
  const p = await consumeRhPasswordToken(b.token, b.password);
  await setSession({ pid: p.id, cid: p.company_id, v: p.session_version, stage: "full" });
  await recordLogin(p.id, "primeiro_acesso", req.headers.get("user-agent"));
  return { ok: true, role: p.role };
});
