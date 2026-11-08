import { cookies } from "next/headers";
import { body, handle } from "@/lib/api";
import { companyBySlug, verifyPin } from "@/lib/login";
import { setSession } from "@/lib/session";

export const POST = handle(async (req: Request) => {
  const b = await body<{ slug: string; cpf: string; pin: string }>(req);
  const company = await companyBySlug(b.slug);
  const p = await verifyPin(company, b.cpf, b.pin);
  await setSession({ pid: p.id, cid: company.id, v: p.session_version, stage: "full" });
  (await cookies()).set("sg_last_company", company.slug, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  return { ok: true, role: p.role };
});
