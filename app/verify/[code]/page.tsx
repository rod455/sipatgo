import type { Metadata } from "next";
import { getCertificate } from "@/lib/certificates";
import { formatDateBR } from "@/lib/dates";
import { maskCpf } from "@/lib/cpf";
import { BadgeCheck, XCircle } from "lucide-react";

export const metadata: Metadata = { title: "Verificação de certificado — SipatGo", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function VerifyPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const c = await getCertificate(code);
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[var(--sg-sand-50)] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
        {c ? (
          <>
            <div className="flex items-center gap-2 text-green-700"><BadgeCheck className="h-8 w-8" /><h1 className="font-display text-2xl font-extrabold">Certificado válido</h1></div>
            <dl className="mt-5 space-y-3 text-sm">
              <Item k="Participante" v={c.name} />
              <Item k="CPF" v={maskCpf(c.cpf)} />
              <Item k="Empresa" v={c.company_name} />
              <Item k="Campanha" v={`${c.campaign_name}${c.theme ? ` — ${c.theme}` : ""}`} />
              <Item k="Período" v={`${formatDateBR(c.start_date)} a ${formatDateBR(c.end_date)}`} />
              <Item k="Dias concluídos" v={`${c.days_completed} de 5`} />
              <Item k="Carga horária" v={`${String(c.hours).replace(".", ",")} h`} />
              <Item k="Código" v={c.code} />
            </dl>
            <a href={`/api/certificate/${c.code}`} target="_blank" className="mt-6 flex h-11 items-center justify-center rounded-xl bg-[var(--sg-navy-900)] font-semibold text-white">Ver PDF</a>
          </>
        ) : (
          <div className="flex items-center gap-2 text-red-600"><XCircle className="h-8 w-8" /><h1 className="font-display text-2xl font-extrabold">Certificado não encontrado</h1></div>
        )}
        <p className="mt-6 text-center text-xs text-slate-400">Verificação pública · Sipat<span className="text-[var(--sg-orange-500)]">Go</span></p>
      </div>
    </main>
  );
}

function Item({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-4 border-b border-slate-100 pb-2"><dt className="text-slate-500">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>;
}
