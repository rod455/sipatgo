import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { sql } from "@/lib/db";
import { brandStyle } from "@/lib/theme";
import { getViewer } from "@/lib/auth";
import { LoginFlow } from "@/components/auth/LoginFlow";
import { AlreadySignedIn } from "@/components/auth/AlreadySignedIn";
import { MadeWith } from "@/components/app/MadeWith";
import type { Company } from "@/lib/types";
import { isCompanySlug } from "@/lib/slugs";

export const dynamic = "force-dynamic";

async function load(slug: string) {
  if (!isCompanySlug(slug.toLowerCase())) return undefined;
  const [c] = await sql<(Company & { campaign_name: string | null; theme: string | null })[]>`
    select co.*, ca.name as campaign_name, ca.theme from sipatgo.companies co
      left join lateral (select name, theme from sipatgo.campaigns where company_id = co.id and status <> 'draft'
                          order by (status = 'active') desc, start_date desc limit 1) ca on true
     where co.slug = ${slug.toLowerCase()}`;
  return c;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = await load((await params).slug);
  return { title: c ? `${c.campaign_name ?? "SIPAT"} · ${c.name}` : "SipatGo", robots: { index: false } };
}

export default async function CompanyLogin({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ next?: string }> }) {
  const { slug } = await params;
  const { next } = await searchParams;
  const c = await load(slug);
  if (!c) notFound();
  const v = await getViewer();
  const dest = v ? (next && next.startsWith("/") ? next : v.participant.role === "admin" || v.participant.role === "superadmin" ? "/admin" : "/app") : null;

  return (
    <main style={brandStyle(c)} className="min-h-dvh bg-gradient-to-b from-brand to-brand-2">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-4 py-8">
        <div className="mb-6 text-center text-brand-fg">
          {c.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.logo_url} alt={c.name} className="mx-auto mb-4 h-16 w-auto rounded-lg bg-white/95 p-2" />
          ) : (
            <div className="mx-auto mb-4 inline-flex rounded-xl bg-white/15 px-4 py-2 font-display text-xl font-bold">{c.name}</div>
          )}
          <h1 className="font-display text-3xl font-extrabold leading-tight">{c.campaign_name ?? "SIPAT"}</h1>
          {c.theme && <p className="mt-1 opacity-90">{c.theme}</p>}
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-xl">
          {v && dest
            ? <AlreadySignedIn name={v.participant.name} company={v.company.name} dest={dest} here={`/${c.slug}`} />
            : <LoginFlow slug={c.slug} brandColors={[c.primary_color, c.secondary_color, c.accent_color]} next={next} />}
        </div>
        <div className="mt-auto pt-8 text-brand-fg"><MadeWith light /></div>
      </div>
    </main>
  );
}
