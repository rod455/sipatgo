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

/** Casas pares têm brinde 🎁; casas ímpares são "não foi dessa vez". */
export function isWinSlot(slot: number): boolean {
  return slot % 2 === 0;
}

/** Casa onde a roda vai parar, coerente com o resultado. Não revela qual brinde. */
export function slotFor(won: boolean, rand: () => number = Math.random): number {
  const pool = Array.from({ length: WHEEL_SLOTS }, (_, i) => i).filter((i) => isWinSlot(i) === won);
  return pool[Math.min(pool.length - 1, Math.floor(rand() * pool.length))];
}

/** Ganhou? `pct` de 0 a 100. */
export function rollWin(pct: number, rand: () => number = Math.random): boolean {
  if (pct <= 0) return false;
  if (pct >= 100) return true;
  return rand() * 100 < pct;
}
