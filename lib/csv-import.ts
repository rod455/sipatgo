import { isValidCpf, normalizeCpf } from "./cpf";

export type ImportRow = { name: string; cpf: string; birth_date: string; sector: string; email: string | null; leader: boolean };
export type ParsedRow = ImportRow & { line: number; errors: string[] };

const ALIASES: Record<string, keyof ImportRow> = {
  nome: "name", name: "name", cpf: "cpf", data_nascimento: "birth_date", nascimento: "birth_date", "data de nascimento": "birth_date",
  setor: "sector", sector: "sector", email: "email", "e-mail": "email", lider: "leader", "líder": "leader", leader: "leader",
};

export function parseBirthDate(v: string): string | null {
  const s = (v ?? "").trim();
  let m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(s);
  let y: number, mo: number, d: number;
  if (m) { d = +m[1]; mo = +m[2]; y = +m[3]; }
  else if ((m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s))) { y = +m[1]; mo = +m[2]; d = +m[3]; }
  else return null;
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
  if (y < 1900 || y > new Date().getFullYear() - 10) return null;
  return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Valida linhas já separadas em colunas (cabeçalho na 1ª linha). */
export function validateRows(table: string[][]): ParsedRow[] {
  if (!table.length) return [];
  const header = table[0].map((h) => ALIASES[h.trim().toLowerCase()] ?? null);
  const seen = new Map<string, number>();
  const out: ParsedRow[] = [];
  table.slice(1).forEach((cols, i) => {
    if (cols.every((c) => !String(c ?? "").trim())) return;
    const get = (k: keyof ImportRow) => {
      const idx = header.indexOf(k);
      return idx >= 0 ? String(cols[idx] ?? "").trim() : "";
    };
    const errors: string[] = [];
    const name = get("name").replace(/\s+/g, " ");
    const cpf = normalizeCpf(get("cpf")).padStart(11, "0");
    const birth = parseBirthDate(get("birth_date"));
    const email = get("email") || null;
    const sector = get("sector") || "Geral";
    const leaderRaw = get("leader").toUpperCase();
    if (name.length < 2) errors.push("nome vazio");
    if (!isValidCpf(cpf)) errors.push("CPF inválido");
    if (!birth) errors.push("data de nascimento inválida");
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.push("e-mail inválido");
    if (seen.has(cpf)) errors.push(`CPF repetido (linha ${seen.get(cpf)})`);
    else seen.set(cpf, i + 2);
    out.push({ line: i + 2, name, cpf, birth_date: birth ?? "", sector, email, leader: ["S", "SIM", "Y", "1", "X", "TRUE"].includes(leaderRaw), errors });
  });
  return out;
}

export const CSV_TEMPLATE = "nome,cpf,data_nascimento,setor,email,lider\nMaria Silva,123.456.789-09,15/03/1988,Produção,maria@empresa.com,N\n";
