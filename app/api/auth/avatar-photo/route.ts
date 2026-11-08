import { randomUUID } from "node:crypto";
import { handle } from "@/lib/api";
import { HttpError, getViewer } from "@/lib/auth";
import { uploadFile } from "@/lib/storage";
import { photoAvatarAllowed } from "@/lib/avatar-server";

/** Recebe o recorte 512×512 (JPEG) feito no navegador e guarda no Storage público. */
export const POST = handle(async (req: Request) => {
  const v = await getViewer({ allowOnboarding: true });
  if (!v) throw new HttpError(401, "Sessão expirada.");
  if (!photoAvatarAllowed(v.company)) throw new HttpError(403, "Sua empresa não permite foto como avatar.");
  const form = await req.formData();
  const file = form.get("photo");
  if (!(file instanceof File) || file.size === 0) throw new HttpError(400, "Envie uma foto.");
  if (file.size > 2 * 1024 * 1024) throw new HttpError(400, "Foto muito grande.");
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new HttpError(400, "Formato não suportado.");
  const bytes = Buffer.from(await file.arrayBuffer());
  // confere a assinatura do arquivo (não confia só no content-type)
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50;
  const isWebp = bytes.subarray(8, 12).toString("ascii") === "WEBP";
  if (!isJpeg && !isPng && !isWebp) throw new HttpError(400, "Arquivo de imagem inválido.");
  const ext = isPng ? "png" : isWebp ? "webp" : "jpg";
  const url = await uploadFile("public", `avatars/${v.participant.id}/${randomUUID()}.${ext}`, bytes, `image/${ext === "jpg" ? "jpeg" : ext}`);
  return { url };
});
