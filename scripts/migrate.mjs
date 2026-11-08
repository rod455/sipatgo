// Aplica supabase/migrations/*.sql em ordem, registrando em sipatgo._migrations.
// Uso: DATABASE_URL=... node scripts/migrate.mjs
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL não definida"); process.exit(1); }
const sql = postgres(url, { prepare: false, max: 1, onnotice: () => {} });
const dir = join(process.cwd(), "supabase", "migrations");

try {
  await sql`create schema if not exists sipatgo`;
  await sql`create table if not exists sipatgo._migrations (name text primary key, applied_at timestamptz not null default now())`;
  const done = new Set((await sql`select name from sipatgo._migrations`).map((r) => r.name));
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    if (done.has(f)) continue;
    process.stdout.write(`→ ${f} ... `);
    await sql.begin(async (tx) => {
      await tx.unsafe(readFileSync(join(dir, f), "utf8"));
      await tx`insert into sipatgo._migrations (name) values (${f})`;
    });
    console.log("ok");
  }
  console.log("Migrations em dia.");
} finally {
  await sql.end();
}
