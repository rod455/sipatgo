import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import type { Metadata } from "next";
import { requireViewer, isAdmin } from "@/lib/auth";
import { brandStyle } from "@/lib/theme";
import { Avatar } from "@/components/avatar/Avatar";
import { BottomNav } from "@/components/app/BottomNav";
import { MadeWith } from "@/components/app/MadeWith";
import { ensureClosedIfDue } from "@/lib/close";

export const metadata: Metadata = { robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { participant: p, company } = await requireViewer();
  if (p.campaign_id) await ensureClosedIfDue(p.campaign_id);
  return (
    <div style={brandStyle(company)} className="min-h-dvh bg-brand-50 text-brand-ink">
      <header className="sticky top-0 z-30 bg-gradient-to-r from-brand to-brand-2 text-brand-fg shadow-sm">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <Link href="/app" className="flex min-w-0 items-center gap-2">
            {company.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logo_url} alt={company.name} className="h-8 w-auto rounded bg-white/95 p-0.5" />
            ) : (
              <span className="truncate font-display text-lg font-bold">{company.name}</span>
            )}
          </Link>
          <div className="flex items-center gap-2">
            {isAdmin(p) && <Link href="/admin" className="rounded-lg bg-white/15 px-2 py-1 text-xs font-semibold">Painel</Link>}
            <Link href="/app/perfil" aria-label="Perfil"><Avatar config={p.avatar_config} seed={p.id} size={34} className="ring-2 ring-white/70" /></Link>
            <LogoutButton iconOnly label="Sair" className="rounded-lg bg-white/15 p-2 hover:bg-white/25" />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 pb-28 pt-4">
        {p.campaign_id ? children : (
          <div className="rounded-2xl bg-white p-6 text-center text-brand-muted shadow-sm">
            Você não está vinculado a uma campanha.{isAdmin(p) && <> Acesse o <Link className="font-semibold text-brand underline" href="/admin">painel</Link>.</>}
          </div>
        )}
        <MadeWith className="mt-10" />
      </main>
      <BottomNav />
    </div>
  );
}
