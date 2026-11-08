import { z } from "zod";
import { body, handle } from "@/lib/api";
import { apiViewer } from "@/lib/auth";
import { submitItem } from "@/lib/game";

const answer = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("bool"), value: z.boolean() }),
  z.object({ kind: z.literal("choice"), index: z.number().int().min(0).max(10).nullable() }),
  z.object({ kind: z.literal("pair"), left: z.number().int().min(0).max(20), right: z.number().int().min(0).max(20) }),
  z.object({ kind: z.literal("click"), x: z.number().min(0).max(100), y: z.number().min(0).max(100) }),
]);
const schema = z.object({ day: z.number().int().min(1).max(5), item_index: z.number().int().min(-1).max(20), answer });

export const POST = handle(async (req: Request) => {
  const v = await apiViewer();
  const b = schema.parse(await body(req));
  return submitItem(v.participant, b.day, b.item_index, b.answer);
});
