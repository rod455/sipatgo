export const WHEEL_SLOTS = 8;

export type WheelPrize = { id: string; weight: number; stock_available: number; active: boolean };

/** Sorteio ponderado por `weight`, só entre brindes ativos com estoque. */
export function pickWeighted<T extends WheelPrize>(prizes: T[], rand: () => number = Math.random): T | null {
  const pool = prizes.filter((p) => p.active && p.stock_available > 0 && p.weight > 0);
  const total = pool.reduce((a, p) => a + p.weight, 0);
  if (total <= 0) return null;
  let r = rand() * total;
  for (const p of pool) {
    r -= p.weight;
    if (r < 0) return p;
  }
  return pool[pool.length - 1];
}

/** Casa genérica (0..7) onde a roda vai parar. Não revela nada sobre o brinde. */
export function randomSlot(rand: () => number = Math.random): number {
  return Math.floor(rand() * WHEEL_SLOTS);
}
