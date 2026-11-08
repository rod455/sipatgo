import { handle } from "@/lib/api";
import { apiViewer } from "@/lib/auth";
import { getToday } from "@/lib/game";

export const GET = handle(async () => {
  const v = await apiViewer();
  return getToday(v.participant, v.company);
});
