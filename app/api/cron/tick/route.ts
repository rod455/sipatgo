import { timingSafeEqual } from "node:crypto";
import { handle } from "@/lib/api";
import { HttpError } from "@/lib/auth";
import { sql } from "@/lib/db";
import { runTick } from "@/lib/jobs";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function same(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/**
 * Aceita:
 *  - Vercel Cron: "Authorization: Bearer $CRON_SECRET"
 *  - pg_cron (Supabase): header "x-sipatgo-cron" = sipatgo.app_settings.cron_key
 */
async function authorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  if (secret && same(auth, `Bearer ${secret}`)) return true;
  const key = req.headers.get("x-sipatgo-cron");
  if (key) {
    const [row] = await sql<{ value: string }[]>`select value from sipatgo.app_settings where key = 'cron_key'`;
    if (row && same(key, row.value)) return true;
  }
  return false;
}

async function run(req: Request) {
  if (!(await authorized(req))) throw new HttpError(401, "unauthorized");
  return runTick();
}

export const GET = handle(run);
export const POST = handle(run);
