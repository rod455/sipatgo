import { handle } from "@/lib/api";
import { apiViewer } from "@/lib/auth";
import { leaderNudge } from "@/lib/team";

export const POST = handle(async () => {
  const v = await apiViewer();
  return leaderNudge(v.participant);
});
