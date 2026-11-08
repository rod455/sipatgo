import { hashSeed, mulberry32 } from "./activities";

export type WordPlacement = { word: string; row: number; col: number; dr: number; dc: number };
export type WordSearch = { size: number; grid: string[][]; words: string[]; placements: WordPlacement[] };

export function normalizeWord(w: string): string {
  return w.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z]/g, "");
}

const DIRS = [
  [0, 1],  // →
  [1, 0],  // ↓
  [1, 1],  // ↘
  [-1, 1], // ↗
];

export function generateWordSearch(rawWords: string[], seed: string, size = 10): WordSearch {
  const rnd = mulberry32(hashSeed(seed));
  const words = Array.from(new Set(rawWords.map(normalizeWord).filter((w) => w.length >= 2 && w.length <= size)))
    .sort((a, b) => b.length - a.length);
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(""));
  const placements: WordPlacement[] = [];

  for (const word of words) {
    let placed = false;
    for (let tries = 0; tries < 400 && !placed; tries++) {
      const [dr, dc] = DIRS[Math.floor(rnd() * DIRS.length)];
      const row = Math.floor(rnd() * size);
      const col = Math.floor(rnd() * size);
      const endR = row + dr * (word.length - 1);
      const endC = col + dc * (word.length - 1);
      if (endR < 0 || endR >= size || endC < 0 || endC >= size) continue;
      let ok = true;
      for (let i = 0; i < word.length; i++) {
        const cell = grid[row + dr * i][col + dc * i];
        if (cell && cell !== word[i]) { ok = false; break; }
      }
      if (!ok) continue;
      for (let i = 0; i < word.length; i++) grid[row + dr * i][col + dc * i] = word[i];
      placements.push({ word, row, col, dr, dc });
      placed = true;
    }
  }
  const letters = "ABCDEFGHIJKLMNOPRSTUVZ";
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (!grid[r][c]) grid[r][c] = letters[Math.floor(rnd() * letters.length)];

  return { size, grid, words: placements.map((p) => p.word), placements };
}

/** Confere se a seleção (início→fim) corresponde a alguma palavra. */
export function matchSelection(ws: WordSearch, a: [number, number], b: [number, number]): string | null {
  for (const p of ws.placements) {
    const end: [number, number] = [p.row + p.dr * (p.word.length - 1), p.col + p.dc * (p.word.length - 1)];
    const fwd = a[0] === p.row && a[1] === p.col && b[0] === end[0] && b[1] === end[1];
    const rev = b[0] === p.row && b[1] === p.col && a[0] === end[0] && a[1] === end[1];
    if (fwd || rev) return p.word;
  }
  return null;
}
