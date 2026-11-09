import { body, handle } from "@/lib/api";
import { requestRhPasswordLink, throttle } from "@/lib/login";

/** Envia o link de criar/redefinir senha. A resposta é sempre igual (não revela e-mails cadastrados). */
export const POST = handle(async (req: Request) => {
  throttle(`rhlink:${req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "?"}`, 10);
  const b = await body<{ email: string }>(req);
  await requestRhPasswordLink(b.email);
  return { ok: true };
});
