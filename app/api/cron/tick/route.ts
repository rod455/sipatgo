import { handle } from "@/lib/api";
import { HttpError } from "@/lib/auth";
import { runTick } from "@/lib/jobs";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function run(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) throw new HttpError(401, "unauthorized");
  return runTick();
}

export const GET = handle(run);
export const POST = handle(run);
