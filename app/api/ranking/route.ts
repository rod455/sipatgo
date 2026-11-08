import { handle } from "@/lib/api";
import { apiViewer } from "@/lib/auth";
import { getRanking } from "@/lib/ranking";

export const GET = handle(async (req: Request) => {
  const v = await apiViewer();
  const u = new URL(req.url);
  const tab = (u.searchParams.get("tab") ?? "general") as "general" | "today" | "sector";
  const day = u.searchParams.get("day") ? Number(u.searchParams.get("day")) : undefined;
  return getRanking(v.participant, tab, day);
});
