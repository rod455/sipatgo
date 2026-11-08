import postgres from "postgres";

/**
 * Conexão Postgres do servidor. Todas as queries usam nomes qualificados
 * (`sipatgo.tabela`) para funcionar mesmo atrás do pooler do Supabase
 * (modo transaction), onde search_path não é confiável.
 */
declare global {
  var __sipatgoSql: postgres.Sql | undefined;
}

/**
 * DATABASE_URL (preferencial) ou POSTGRES_URL (injetada pela integração
 * Supabase da Vercel). Parâmetros extras da URL (ex.: "supa=base-pooler.x")
 * são removidos, pois o driver os enviaria como parâmetros de sessão.
 */
export function databaseUrl(): { url: string; ssl: false | "require" } {
  const raw = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;
  if (!raw) throw new Error("DATABASE_URL (ou POSTGRES_URL) não configurada");
  const u = new URL(raw);
  const local = ["localhost", "127.0.0.1", "::1"].includes(u.hostname);
  const sslmode = u.searchParams.get("sslmode");
  u.search = "";
  return { url: u.toString(), ssl: local || sslmode === "disable" ? false : "require" };
}

function create(): postgres.Sql {
  const { url, ssl } = databaseUrl();
  return postgres(url, {
    ssl,
    prepare: false,
    max: Number(process.env.DB_POOL_MAX || 5),
    idle_timeout: 20,
    connect_timeout: 10,
    transform: { undefined: null },
    types: {
      // date como "YYYY-MM-DD" (sem conversão de fuso)
      date: { to: 1082, from: [1082], serialize: (x: string) => x, parse: (x: string) => x },
      // bigint e numeric como number
      int8: { to: 20, from: [20], serialize: (x: number) => String(x), parse: (x: string) => Number(x) },
      numeric: { to: 1700, from: [1700], serialize: (x: number) => String(x), parse: (x: string) => Number(x) },
    },
  });
}

export function db(): postgres.Sql {
  if (!globalThis.__sipatgoSql) globalThis.__sipatgoSql = create();
  return globalThis.__sipatgoSql;
}

/** Atalho: sql`...` */
export const sql = new Proxy(function () {} as unknown as postgres.Sql, {
  apply(_t, _this, args) {
    return (db() as unknown as (...a: unknown[]) => unknown)(...args);
  },
  get(_t, prop) {
    const real = db() as unknown as Record<string | symbol, unknown>;
    const v = real[prop];
    return typeof v === "function" ? (v as (...a: unknown[]) => unknown).bind(real) : v;
  },
}) as postgres.Sql;

export type Tx = postgres.TransactionSql;
