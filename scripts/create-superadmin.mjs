// Cria (ou promove) o superadmin da plataforma na empresa interna "sipatgo".
// Uso: DATABASE_URL=... node scripts/create-superadmin.mjs "Nome" 12345678909 1990-01-31
// Depois: acesse /c/sipatgo, faça o 1º acesso com CPF + nascimento e crie um PIN de 6 dígitos.
import postgres from "postgres";

const [name, cpfRaw, birth] = process.argv.slice(2);
if (!(process.env.DATABASE_URL || process.env.POSTGRES_URL) || !name || !cpfRaw || !/^\d{4}-\d{2}-\d{2}$/.test(birth ?? "")) {
  console.error('Uso: DATABASE_URL=... node scripts/create-superadmin.mjs "Nome" CPF AAAA-MM-DD');
  process.exit(1);
}
const cpf = cpfRaw.replace(/\D/g, "");
const u = new URL(process.env.DATABASE_URL || process.env.POSTGRES_URL); const local = ["localhost", "127.0.0.1"].includes(u.hostname); u.search = "";
const sql = postgres(u.toString(), { prepare: false, max: 1, ssl: local ? false : "require" });
try {
  const [c] = await sql`
    insert into sipatgo.companies (slug, name, primary_color, secondary_color, accent_color)
    values ('sipatgo', 'SipatGo', '#0B1F33', '#13385C', '#FF6A13')
    on conflict (slug) do update set name = sipatgo.companies.name returning id`;
  await sql`
    insert into sipatgo.participants (company_id, name, cpf, birth_date, sector, role)
    values (${c.id}, ${name}, ${cpf}, ${birth}, 'Plataforma', 'superadmin')
    on conflict (company_id, cpf) do update set role = 'superadmin', name = excluded.name, birth_date = excluded.birth_date`;
  console.log(`Superadmin pronto. Acesse /c/sipatgo com o CPF ${cpf} e a data ${birth} para criar o PIN.`);
} finally {
  await sql.end();
}
