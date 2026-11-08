import { handle } from "@/lib/api";
import { apiViewer, HttpError } from "@/lib/auth";
import { createPost } from "@/lib/wall";

export const POST = handle(async (req: Request) => {
  const v = await apiViewer();
  const form = await req.formData();
  const file = form.get("image");
  if (!(file instanceof File)) throw new HttpError(400, "Escolha uma imagem.");
  return createPost(v.participant, file, String(form.get("caption") ?? ""));
});
