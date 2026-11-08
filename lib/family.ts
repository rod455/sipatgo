import { sql } from "./db";
import { HttpError } from "./auth";
import { dayContext } from "./game";
import { generateWordSearch, type WordSearch } from "./wordsearch";
import { evaluateBadges } from "./badges";
import type { Participant } from "./types";

export type FamilyGameView =
  | { id: string; type: "word_search"; title: string; puzzle: WordSearch; done: boolean }
  | { id: string; type: "light_quiz"; title: string; items: { question: string; options: string[]; correct_index: number; explanation?: string }[]; done: boolean };

export async function getFamilyGame(p: Participant, dayIndex: number): Promise<FamilyGameView | null> {
  const ctx = await dayContext(p, dayIndex);
  if (ctx.state === "locked") throw new HttpError(403, "Ainda não liberado.");
  const [g] = await sql<{ id: string; type: "word_search" | "light_quiz"; config: Record<string, unknown> }[]>`
    select id, type, config from sipatgo.family_games where campaign_day_id = ${ctx.day.id}`;
  if (!g) return null;
  const [done] = await sql`select 1 from sipatgo.family_game_completions where participant_id = ${p.id} and family_game_id = ${g.id}`;
  const title = String(g.config.title ?? (g.type === "word_search" ? "Caça-palavras" : "Quiz em família"));
  if (g.type === "word_search") {
    const words = (g.config.words as string[]) ?? [];
    return { id: g.id, type: "word_search", title, puzzle: generateWordSearch(words, g.id, Number(g.config.size ?? 10)), done: !!done };
  }
  return { id: g.id, type: "light_quiz", title, items: (g.config.items as never) ?? [], done: !!done };
}

export async function completeFamilyGame(p: Participant, gameId: string) {
  const [g] = await sql<{ id: string }[]>`
    select g.id from sipatgo.family_games g join sipatgo.campaign_days d on d.id = g.campaign_day_id
     where g.id = ${gameId} and d.campaign_id = ${p.campaign_id}`;
  if (!g) throw new HttpError(404, "Game não encontrado.");
  await sql`insert into sipatgo.family_game_completions (participant_id, family_game_id) values (${p.id}, ${g.id}) on conflict do nothing`;
  return { new_badges: await evaluateBadges(p.id) };
}

export async function familyHistory(p: Participant) {
  return sql<{ day_index: number; type: string; title: string; completed_at: Date | null }[]>`
    select d.day_index, g.type, coalesce(g.config->>'title', '') as title, f.completed_at
      from sipatgo.family_games g join sipatgo.campaign_days d on d.id = g.campaign_day_id
      left join sipatgo.family_game_completions f on f.family_game_id = g.id and f.participant_id = ${p.id}
     where d.campaign_id = ${p.campaign_id} order by d.day_index`;
}
