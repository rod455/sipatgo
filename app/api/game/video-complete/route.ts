import { body, handle } from "@/lib/api";
import { apiViewer } from "@/lib/auth";
import { completeVideo } from "@/lib/game";

export const POST = handle(async (req: Request) => {
  const v = await apiViewer();
  const b = await body<{ day: number; watched_pct: number }>(req);
  return completeVideo(v.participant, Number(b.day), Number(b.watched_pct));
});
