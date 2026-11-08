import { handle } from "@/lib/api";
import { getAdminContext, HttpError } from "@/lib/auth";
import { fetchYoutubeMeta, parseYoutubeId } from "@/lib/youtube";

export const GET = handle(async (req: Request) => {
  if (!(await getAdminContext())) throw new HttpError(401, "Apenas admin.");
  const id = parseYoutubeId(new URL(req.url).searchParams.get("url") ?? "");
  if (!id) throw new HttpError(400, "Link do YouTube inválido.");
  return { id, ...(await fetchYoutubeMeta(id)) };
});
