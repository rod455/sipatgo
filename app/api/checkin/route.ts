import { body, handle } from "@/lib/api";
import { apiViewer } from "@/lib/auth";
import { doCheckin } from "@/lib/checkins";

export const POST = handle(async (req: Request) => {
  const v = await apiViewer();
  const b = await body<{ code: string }>(req);
  return doCheckin(v.participant, String(b.code ?? ""));
});
