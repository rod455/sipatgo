import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/site/Logo";
import { brandStyle } from "@/lib/theme";
import { ResetForm } from "./ResetForm";

export const metadata: Metadata = { title: "Criar senha — SipatGo", robots: { index: false } };

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <main style={{ ...brandStyle({ primary_color: "#FF6A13", secondary_color: "#0B1F33", accent_color: "#FFC628" }),
      ["--brand-ink" as string]: "#0B1F33", ["--brand-muted" as string]: "#5B6B7B", ["--brand-200" as string]: "#D5DCE4",
      ["--brand-100" as string]: "#E8EDF2", ["--brand-50" as string]: "#F4F6F9" }}
      className="flex min-h-dvh flex-col items-center justify-center bg-[var(--sg-navy-900)] px-4 py-10">
      <Link href="/" aria-label="SipatGo — início" className="mb-6"><Logo variant="white" className="h-9" /></Link>
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl sm:p-8">
        <h1 className="mb-2 font-display text-2xl font-extrabold text-[var(--sg-navy-900)]">Criar sua senha</h1>
        {token ? <ResetForm token={token} /> : (
          <p className="text-sm text-slate-600">Link incompleto. Peça um novo em <Link href="/login" className="font-semibold text-[var(--sg-orange-600)]">Entrar → Sou empresa</Link>.</p>
        )}
      </div>
    </main>
  );
}
