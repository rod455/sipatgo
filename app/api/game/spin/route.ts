import { body, handle } from "@/lib/api";
import { apiViewer } from "@/lib/auth";
import { spinWheel } from "@/lib/prizes";

export const POST = handle(async (req: Request) => {
  const v = await apiViewer();
  const b = await body<{ day: number }>(req);
  return spinWheel(v.participant, Number(b.day));
});
