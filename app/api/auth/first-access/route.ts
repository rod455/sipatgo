import { body, handle } from "@/lib/api";
import { companyBySlug, recordLogin, verifyBirthDate } from "@/lib/login";
import { setSession } from "@/lib/session";
import { firstName } from "@/lib/utils";
import { photoAvatarAllowed } from "@/lib/avatar-server";

export const POST = handle(async (req: Request) => {
  const b = await body<{ slug: string; cpf: string; birth_date: string }>(req);
  const company = await companyBySlug(b.slug);
  const p = await verifyBirthDate(company, b.cpf, b.birth_date);
  await setSession({ pid: p.id, cid: company.id, v: p.session_version, stage: "onboarding" });
  await recordLogin(p.id, "primeiro_acesso", req.headers.get("user-agent"));
  return {
    name: p.name,
    first_name: firstName(p.name),
    needs_consent: !p.consent_at,
    consent_text: company.consent_text,
    needs_avatar: !p.avatar_config,
    role: p.role,
    allow_photo: photoAvatarAllowed(company),
  };
});
