import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { brandStyle } from "@/lib/theme";
import { AdminNav } from "@/components/admin/AdminNav";
import { ContextSwitcher } from "@/components/admin/ContextSwitcher";
import { MadeWith } from "@/components/app/MadeWith";

export const metadata: Metadata = { title: "Painel — SipatGo", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireAdmin();
  const superadmin = ctx.participant.role === "superadmin";
  const companies = superadmin ? await sql<{ id: string; name: string }[]>`select id, name from sipatgo.companies order by name` : undefined;
  const badges: Record<string, number> = {};
  if (ctx.campaign) {
    const [b] = await sql<{ posts: number; prizes: number }[]>`
      select (select count(*)::int from sipatgo.wall_posts where campaign_id = ${ctx.campaign.id} and status = 'pending') as posts,
             (select count(*)::int from sipatgo.prize_awards a join sipatgo.prizes p on p.id = a.prize_id where p.campaign_id = ${ctx.campaign.id} and a.status = 'pending') as prizes`;
    badges["/admin/mural"] = b.posts;
    badges["/admin/entregas"] = b.prizes;
  }
  return (
    <div style={brandStyle(ctx.adminCompany)} className="min-h-dvh bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="flex h-14 items-center gap-3 px-4">
          <Link href="/admin" className="flex items-center gap-2 font-display text-lg font-bold">
            {ctx.adminCompany.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ctx.adminCompany.logo_url} alt="" className="h-8 w-auto" />
            ) : <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm text-brand-fg">{ctx.adminCompany.name[0]}</span>}
            <span className="hidden sm:inline">{ctx.adminCompany.name}</span>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <ContextSwitcher campaigns={ctx.campaigns.map((c) => ({ id: c.id, name: c.name, status: c.status }))} campaignId={ctx.campaign?.id ?? null}
              companies={companies} companyId={ctx.adminCompany.id} />
            <Link href="/app" className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 sm:inline">Ver como participante</Link>
          </div>
        </div>
      </header>
      <div className="lg:flex">
        <aside className="border-b border-slate-200 bg-white pt-2 lg:sticky lg:top-14 lg:h-[calc(100dvh-3.5rem)] lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r lg:pt-4">
          <AdminNav superadmin={superadmin} badges={badges} />
          <MadeWith className="mt-6 hidden lg:block" />
        </aside>
        <main className="min-w-0 flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
