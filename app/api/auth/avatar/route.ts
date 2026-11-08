import { z } from "zod";
import { body, handle } from "@/lib/api";
import { HttpError, getViewer } from "@/lib/auth";
import { sql } from "@/lib/db";
import { sanitizeAvatar } from "@/lib/avatar";

const schema = z.object({ config: z.unknown() });

export const POST = handle(async (req: Request) => {
  const v = await getViewer({ allowOnboarding: true });
  if (!v) throw new HttpError(401, "Sessão expirada.");
  const { config } = schema.parse(await body(req));
  const clean = sanitizeAvatar(config, v.participant.id);
  await sql`update sipatgo.participants set avatar_config = ${sql.json(clean as never)} where id = ${v.participant.id}`;
  return { ok: true };
});
