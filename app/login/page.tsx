import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getViewer } from "@/lib/auth";
import { CompanyCodeForm } from "./CompanyCodeForm";

export const metadata: Metadata = { title: "Entrar — SipatGo", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const v = await getViewer();
  if (v) redirect(next && next.startsWith("/") ? next : v.participant.role === "admin" || v.participant.role === "superadmin" ? "/admin" : "/app");
  const last = (await cookies()).get("sg_last_company")?.value;
  const host = (await headers()).get("host") ?? "";
  const root = process.env.ROOT_DOMAIN;
  if (root && host.endsWith(`.${root}`)) {
    const slug = host.slice(0, -root.length - 1).split(".").pop();
    if (slug && slug !== "www") redirect(`/${slug}${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  }
  if (last && /^[a-z0-9-]+$/.test(last)) redirect(`/${last}${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[var(--sg-navy-900)] px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
        <p className="mb-1 font-display text-2xl font-extrabold text-[var(--sg-navy-900)]">Sipat<span className="text-[var(--sg-orange-500)]">Go</span></p>
        <h1 className="mb-4 text-slate-600">Digite o código da sua empresa (está no cartaz e no e-mail da campanha).</h1>
        <CompanyCodeForm next={next} />
      </div>
    </main>
  );
}
