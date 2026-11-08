/**
 * Cria uma empresa de demonstração ("Indústria Horizonte") com campanha padrão,
 * 120 participantes fictícios (CPFs válidos gerados), líderes e um admin.
 *
 *   DATABASE_URL=... npx tsx scripts/seed-demo.ts [AAAA-MM-DD da segunda-feira]
 *
 * Admin de demonstração: CPF 529.982.247-25, nascimento 1985-05-20 (1º acesso cria o PIN).
 */
import postgres from "postgres";
import { createCampaignWithDefaults } from "../lib/defaults";

function cpfFrom(n: number): string {
  const base = String(100000000 + n * 7919).slice(-9).split("").map(Number);
  const dv = (arr: number[]) => { const s = arr.reduce((acc, d, i) => acc + d * (arr.length + 1 - i), 0); const r = (s * 10) % 11; return r === 10 ? 0 : r; };
  const d1 = dv(base); const d2 = dv([...base, d1]);
  return [...base, d1, d2].join("");
}

function nextMonday(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + ((8 - d.getUTCDay()) % 7 || 7));
  return d.toISOString().slice(0, 10);
}

const FIRST = ["Ana", "Bruno", "Carla", "Diego", "Eduarda", "Felipe", "Gabriela", "Henrique", "Isabela", "João", "Karina", "Lucas", "Mariana", "Nicolas", "Olívia", "Pedro", "Rafaela", "Samuel", "Tatiane", "Vinícius"];
const LAST = ["Silva", "Santos", "Oliveira", "Souza", "Lima", "Pereira", "Costa", "Rodrigues", "Almeida", "Nascimento"];
const SECTORS = ["Produção", "Logística", "Manutenção", "Qualidade", "Administrativo", "Comercial"];

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL não definida"); process.exit(1); }
const sql = postgres(url, { prepare: false, max: 1 });
const start = process.argv[2] ?? nextMonday();

async function main() {
try {
  const [c] = await sql<{ id: string }[]>`
    insert into sipatgo.companies (slug, name, primary_color, secondary_color, accent_color)
    values ('industria-horizonte', 'Indústria Horizonte', '#15803D', '#1E3A8A', '#FACC15')
    on conflict (slug) do update set name = excluded.name returning id`;
  const campaignId = await createCampaignWithDefaults(sql, c.id, { name: "SIPAT 2026", theme: "Prevenção começa em mim", start_date: start, status: "scheduled", withPrizes: true });
  await sql`update sipatgo.campaign_days set youtube_video_id = 'aqz-KE-bpKQ', video_duration_s = 60 where campaign_id = ${campaignId}`;
  for (let i = 0; i < 120; i++) {
    const name = `${FIRST[i % FIRST.length]} ${LAST[Math.floor(i / FIRST.length) % LAST.length]}`;
    const sector = SECTORS[i % SECTORS.length];
    const role = i < SECTORS.length ? "leader" : "participant";
    await sql`
      insert into sipatgo.participants (company_id, campaign_id, name, cpf, birth_date, sector, role, email)
      values (${c.id}, ${campaignId}, ${name}, ${cpfFrom(i + 1)}, ${`19${70 + (i % 30)}-0${1 + (i % 9)}-1${i % 9}`}, ${sector}, ${role}, ${null})
      on conflict (company_id, cpf) do update set campaign_id = excluded.campaign_id`;
  }
  await sql`
    insert into sipatgo.participants (company_id, campaign_id, name, cpf, birth_date, sector, role)
    values (${c.id}, ${campaignId}, 'RH Demonstração', '52998224725', '1985-05-20', 'RH', 'admin')
    on conflict (company_id, cpf) do update set role = 'admin', campaign_id = excluded.campaign_id`;
  console.log(`Demo criada: /c/industria-horizonte · campanha começa em ${start}.`);
  console.log(`Participante exemplo: CPF ${cpfFrom(7)} (nascimento ${`19${70 + 6}-0${1 + 6}-1${6}`}).`);
  console.log("Admin: CPF 529.982.247-25, nascimento 1985-05-20.");
} finally {
  await sql.end();
}
}

main().catch((e) => { console.error(e); process.exit(1); });
