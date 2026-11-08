export const VIDEO_POINTS = 50;
export const VIDEO_MIN_PCT = 0.9;
export const ITEMS_PER_ACTIVITY = 5;
export const CHECKIN_POINTS_DEFAULT = 100;
export const WALL_POST_POINTS = 30;
export const WALL_TOP_POST_POINTS = 100;

export type ActivityScoring = {
  points_per_item: number;
  retry_points: number;
  bonus_max: number;
  bonus_window_s: number;
};

export const DEFAULT_SCORING: ActivityScoring = {
  points_per_item: 100,
  retry_points: 50,
  bonus_max: 20,
  bonus_window_s: 20,
};

/** bonus = round(max * max(0, window - t) / window), t em segundos. */
export function speedBonus(elapsedMs: number, max = 20, windowS = 20): number {
  if (windowS <= 0 || max <= 0) return 0;
  const t = Math.max(0, elapsedMs) / 1000;
  return Math.round((max * Math.max(0, windowS - t)) / windowS);
}

export function itemScore(opts: {
  isCorrect: boolean;
  isFirstAttempt: boolean;
  isMakeup: boolean;
  makeupFactor: number;
  elapsedMs: number;
  scoring?: ActivityScoring;
}): { points: number; bonus: number } {
  const s = opts.scoring ?? DEFAULT_SCORING;
  if (!opts.isCorrect) return { points: 0, bonus: 0 };
  const base = opts.isFirstAttempt ? s.points_per_item : s.retry_points;
  if (opts.isMakeup) return { points: Math.round(base * opts.makeupFactor), bonus: 0 };
  const bonus = opts.isFirstAttempt ? speedBonus(opts.elapsedMs, s.bonus_max, s.bonus_window_s) : 0;
  return { points: base, bonus };
}

export function videoScore(isMakeup: boolean, makeupFactor: number): number {
  return isMakeup ? Math.round(VIDEO_POINTS * makeupFactor) : VIDEO_POINTS;
}

export function maxDailyPoints(s: ActivityScoring = DEFAULT_SCORING): number {
  return VIDEO_POINTS + ITEMS_PER_ACTIVITY * (s.points_per_item + s.bonus_max);
}

/** Carga horária estimada: soma dos vídeos + 10 min por dia da campanha. */
export function certificateHours(videoSeconds: number[], days = 5): number {
  const total = videoSeconds.reduce((a, b) => a + (b || 0), 0) + days * 600;
  return Math.max(0.5, Math.ceil((total / 3600) * 2) / 2);
}
