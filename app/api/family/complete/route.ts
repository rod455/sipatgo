import { body, handle } from "@/lib/api";
import { apiViewer } from "@/lib/auth";
import { completeFamilyGame } from "@/lib/family";

export const POST = handle(async (req: Request) => {
  const v = await apiViewer();
  const b = await body<{ game_id: string }>(req);
  return completeFamilyGame(v.participant, String(b.game_id));
});
