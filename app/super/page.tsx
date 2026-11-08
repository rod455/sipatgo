import type { Metadata } from "next";
import { requireSuperadmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { campaignUrl } from "@/lib/utils";
import { formatDateBR } from "@/lib/dates";
import { Card, Field, Input, PageTitle, Pill, Button } from "@/components/ui";
import { ActionForm } from "@/components/admin/ActionForm";
import { createAdmin, createCompany, manageCompany } from "./actions";

export const metadata: Metadata = { title: "Super admin — SipatGo", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function SuperPage() {
  await requireSuperadmin();
  const companies = await sql<{ id: string; slug: string; name: string; primary_color: string; created_at: Date; people: number; admins: number }[]>`
    select c.*, (select count(*)::int from sipatgo.participants p where p.company_id = c.id) as people,
           (select count(*)::int from sipatgo.participants p where p.company_id = c.id and p.role in ('admin','superadmin')) as admins
      from sipatgo.companies c order by c.created_at`;
  const campaigns = await sql<{ id: string; company_id: string; name: string; status: string; start_date: string; people: number }[]>`
    select ca.id, ca.company_id, ca.name, ca.status, ca.start_date,
           (select count(*)::int from sipatgo.participants p where p.campaign_id = ca.id) as people
      from sipatgo.campaigns ca order by ca.start_date desc`;
  const notif = await sql<{ type: string; status: string; error: string | null; created_at: Date; company: string | null }[]>`
    select n.type, n.status, n.error, n.created_at, c.name as company from sipatgo.notification_log n left join sipatgo.companies c on c.id = n.company_id
     order by n.created_at desc limit 20`;

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 lg:p-8">
      <PageTitle title="Super admin" subtitle="Empresas, administradores e campanhas da plataforma." />
      <Card>
        <h2 className="mb-3 font-display font-bold">Nova empresa</h2>
        <ActionForm action={createCompany} submitLabel="Criar empresa" resetOnSuccess>
          <div className="grid gap-3 sm:grid-cols-5">
            <Field label="Nome" className="sm:col-span-2"><Input name="name" required /></Field>
            <Field label="Slug (subdomínio)"><Input name="slug" required placeholder="industria-horizonte" /></Field>
            <Field label="Cor primária"><input type="color" name="primary_color" defaultValue="#0F766E" className="h-11 w-full rounded-xl border" /></Field>
            <Field label="Destaque"><input type="color" name="accent_color" defaultValue="#F59E0B" className="h-11 w-full rounded-xl border" /></Field>
          </div>
        </ActionForm>
      </Card>

      {companies.map((c) => (
        <Card key={c.id} className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="h-8 w-8 rounded-lg" style={{ background: c.primary_color }} />
            <div className="min-w-0 flex-1"><p className="font-display text-lg font-bold">{c.name}</p><p className="text-xs text-slate-500">{campaignUrl(c.slug)} · {c.people} pessoas · {c.admins} admin(s)</p></div>
            <form action={manageCompany}><input type="hidden" name="company_id" value={c.id} /><Button size="sm">Gerenciar</Button></form>
          </div>
          <div className="flex flex-wrap gap-2">
            {campaigns.filter((x) => x.company_id === c.id).map((x) => <Pill key={x.id} tone={x.status === "active" ? "green" : x.status === "closed" ? "slate" : "blue"}>{x.name} · {formatDateBR(x.start_date)} · {x.people} pessoas · {x.status}</Pill>)}
          </div>
          <details>
            <summary className="cursor-pointer text-sm font-semibold text-brand">Criar admin inicial</summary>
            <ActionForm action={createAdmin} submitLabel="Criar admin" resetOnSuccess className="mt-3">
              <input type="hidden" name="company_id" value={c.id} />
              <div className="grid gap-3 sm:grid-cols-4">
                <Input name="name" placeholder="Nome" required /><Input name="cpf" placeholder="CPF" required /><Input name="birth_date" type="date" required /><Input name="email" placeholder="E-mail" />
              </div>
            </ActionForm>
          </details>
        </Card>
      ))}

      <Card>
        <h2 className="mb-2 font-display font-bold">Últimas notificações (n8n)</h2>
        <ul className="divide-y divide-slate-100 text-sm">
          {notif.map((n, i) => (
            <li key={i} className="flex flex-wrap items-center gap-2 py-1.5">
              <code className="text-xs">{n.type}</code><span className="text-slate-500">{n.company}</span>
              <Pill tone={n.status === "sent" ? "green" : n.status === "failed" ? "red" : "slate"}>{n.status}</Pill>
              {n.error && <span className="text-xs text-red-600">{n.error}</span>}
              <span className="ml-auto text-xs text-slate-400">{new Date(n.created_at).toLocaleString("pt-BR")}</span>
            </li>
          ))}
        </ul>
      </Card>
    </main>
  );
}
