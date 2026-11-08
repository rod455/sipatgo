import { z } from "zod";
import { body, handle } from "@/lib/api";
import { HttpError, getViewer } from "@/lib/auth";
import { sql } from "@/lib/db";
import { sanitizeAvatar } from "@/lib/avatar";
import { avatarPhotoPrefix, photoAvatarAllowed } from "@/lib/avatar-server";

const schema = z.object({ config: z.unknown() });

export const POST = handle(async (req: Request) => {
  const v = await getViewer({ allowOnboarding: true });
  if (!v) throw new HttpError(401, "Sessão expirada.");
  const { config } = schema.parse(await body(req));
  const wantsPhoto = (config as { style?: string } | null)?.style === "photo";
  if (wantsPhoto && !photoAvatarAllowed(v.company)) throw new HttpError(403, "Sua empresa não permite foto como avatar.");
  let clean;
  try {
    clean = sanitizeAvatar(config, v.participant.id, avatarPhotoPrefix(v.participant.id));
  } catch {
    throw new HttpError(400, "Foto inválida. Envie novamente.");
  }
  await sql`update sipatgo.participants set avatar_config = ${sql.json(clean as never)} where id = ${v.participant.id}`;
  return { ok: true };
});
