import { notFound } from "next/navigation";
import { requireAdminCampaign } from "@/lib/auth";
import { sql } from "@/lib/db";
import { checkinUrl, qrSvg } from "@/lib/qr";
import { formatDateTimeBR } from "@/lib/dates";
import { formatCpf } from "@/lib/cpf";
import { PrintButton } from "@/components/admin/PrintButton";

export default async function EventQr({ params }: { params: Promise<{ id: string }> }) {
  const { campaign, adminCompany } = await requireAdminCampaign();
  const { id } = await params;
  const [e] = await sql<{ id: string; name: string; secret: string; code: string; starts_at: Date; ends_at: Date; points: number }[]>`
    select * from sipatgo.events where id = ${id} and campaign_id = ${campaign.id}`;
  if (!e) notFound();
  const svg = await qrSvg(checkinUrl(e.id, e.secret), adminCompany.primary_color);
  const list = await sql<{ name: string; cpf: string; sector: string; created_at: Date }[]>`
    select p.name, p.cpf, p.sector, c.created_at from sipatgo.checkins c join sipatgo.participants p on p.id = c.participant_id
     where c.event_id = ${e.id} order by c.created_at`;
  return (
    <div className="space-y-6">
      <div className="no-print flex gap-2"><PrintButton /></div>
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 text-center shadow ring-1 ring-slate-200 print:shadow-none print:ring-0">
        <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">{adminCompany.name} · {campaign.name}</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold">{e.name}</h1>
        <p className="text-slate-600">Check-in: {formatDateTimeBR(e.starts_at, adminCompany.timezone)} às {formatDateTimeBR(e.ends_at, adminCompany.timezone).slice(-5)}</p>
        <div className="mx-auto my-6 w-72 [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
        <p className="text-slate-600">Aponte a câmera do celular ou digite no app:</p>
        <p className="mt-1 font-display text-5xl font-extrabold tracking-[.3em]">{e.code}</p>
        <p className="mt-4 font-semibold text-brand">Vale {e.points} pontos!</p>
      </div>
      <div className="no-print rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h2 className="mb-2 font-display font-bold">Check-ins ({list.length})</h2>
        <table className="w-full text-sm"><tbody className="divide-y divide-slate-100">
          {list.map((c) => <tr key={c.cpf}><td className="py-1.5">{c.name}</td><td>{formatCpf(c.cpf)}</td><td>{c.sector}</td><td className="text-right text-slate-500">{formatDateTimeBR(c.created_at, adminCompany.timezone)}</td></tr>)}
        </tbody></table>
      </div>
    </div>
  );
}
