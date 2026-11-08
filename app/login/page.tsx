import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getViewer } from "@/lib/auth";
import { brandStyle } from "@/lib/theme";
import { Logo } from "@/components/site/Logo";
import { LoginTabs } from "./LoginTabs";

export const metadata: Metadata = { title: "Entrar — SipatGo", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const v = await getViewer();
  if (v) redirect(next && next.startsWith("/") ? next : v.participant.role === "admin" || v.participant.role === "superadmin" ? "/admin" : "/app");
  const host = (await headers()).get("host") ?? "";
  const root = process.env.ROOT_DOMAIN;
  if (root && host.endsWith(`.${root}`)) {
    const slug = host.slice(0, -root.length - 1).split(".").pop();
    if (slug && slug !== "www") redirect(`/${slug}${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  }
  return (
    <main style={{ ...brandStyle({ primary_color: "#FF6A13", secondary_color: "#0B1F33", accent_color: "#FFC628" }),
      ["--brand-ink" as string]: "#0B1F33", ["--brand-muted" as string]: "#5B6B7B", ["--brand-200" as string]: "#D5DCE4",
      ["--brand-100" as string]: "#E8EDF2", ["--brand-50" as string]: "#F4F6F9" }}
      className="flex min-h-dvh flex-col items-center justify-center bg-[var(--sg-navy-900)] px-4 py-10">
      <Link href="/" aria-label="SipatGo — início" className="mb-6"><Logo variant="white" className="h-9" /></Link>
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl sm:p-8">
        <h1 className="mb-5 font-display text-2xl font-extrabold text-[var(--sg-navy-900)]">Entrar</h1>
        <LoginTabs next={next} />
      </div>
      <p className="mt-6 text-center text-xs text-white/60">Problemas para entrar? Fale com o RH da sua empresa.</p>
    </main>
  );
}
