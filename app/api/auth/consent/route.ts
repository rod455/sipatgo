import { handle } from "@/lib/api";
import { HttpError, getViewer } from "@/lib/auth";
import { sql } from "@/lib/db";
import { now } from "@/lib/clock";

export const POST = handle(async () => {
  const v = await getViewer({ allowOnboarding: true });
  if (!v) throw new HttpError(401, "Sessão expirada. Comece de novo.");
  await sql`insert into sipatgo.consents (participant_id, text_version, text_snapshot) values (${v.participant.id}, ${v.company.consent_version}, ${v.company.consent_text})`;
  await sql`update sipatgo.participants set consent_at = ${now()} where id = ${v.participant.id}`;
  return { ok: true };
});
