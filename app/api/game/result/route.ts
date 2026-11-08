import { handle } from "@/lib/api";
import { apiViewer } from "@/lib/auth";
import { dayResult } from "@/lib/game";

export const GET = handle(async (req: Request) => {
  const v = await apiViewer();
  const day = Number(new URL(req.url).searchParams.get("day"));
  return dayResult(v.participant, day);
});
