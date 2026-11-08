import { body, handle } from "@/lib/api";
import { apiViewer } from "@/lib/auth";
import { toggleVote } from "@/lib/wall";

export const POST = handle(async (req: Request) => {
  const v = await apiViewer();
  const b = await body<{ post_id: string }>(req);
  return toggleVote(v.participant, String(b.post_id));
});
