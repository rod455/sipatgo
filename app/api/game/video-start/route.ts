import { body, handle } from "@/lib/api";
import { apiViewer } from "@/lib/auth";
import { startVideo } from "@/lib/game";

export const POST = handle(async (req: Request) => {
  const v = await apiViewer();
  const b = await body<{ day: number }>(req);
  return startVideo(v.participant, Number(b.day));
});
