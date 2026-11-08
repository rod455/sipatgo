import { randomInt } from "node:crypto";

// Sem 0/O/1/I/L para não confundir na leitura em voz alta no RH
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function randomCode(len: number): string {
  let s = "";
  for (let i = 0; i < len; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return s;
}

/** XXXX-XXXX */
export function prizeCode(): string {
  return `${randomCode(4)}-${randomCode(4)}`;
}

export function normalizeCode(input: string): string {
  return (input ?? "").toUpperCase().replace(/[^0-9A-Z]/g, "");
}
