import { body, handle } from "@/lib/api";
import { recordLogin, throttle, verifyRhPassword } from "@/lib/login";
import { setSession } from "@/lib/session";

export const POST = handle(async (req: Request) => {
  throttle(`rh:${req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "?"}`, 15);
  const b = await body<{ email: string; password: string }>(req);
  const p = await verifyRhPassword(b.email, b.password);
  await setSession({ pid: p.id, cid: p.company_id, v: p.session_version, stage: "full" });
  await recordLogin(p.id, "pin", req.headers.get("user-agent"));
  return { ok: true, role: p.role };
});
