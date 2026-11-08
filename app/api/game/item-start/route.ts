import { body, handle } from "@/lib/api";
import { apiViewer } from "@/lib/auth";
import { startItem } from "@/lib/game";

export const POST = handle(async (req: Request) => {
  const v = await apiViewer();
  const b = await body<{ day: number }>(req);
  return startItem(v.participant, Number(b.day));
});
