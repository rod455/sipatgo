import Link from "next/link";
import { requireViewer } from "@/lib/auth";
import { dayResult } from "@/lib/game";
import { buttonClass, Card } from "@/components/ui";
import { Confetti } from "@/components/app/Confetti";

export default async function ResultPage({ params, searchParams }: { params: Promise<{ i: string }>; searchParams: Promise<{ novos?: string }> }) {
  const { participant: p } = await requireViewer();
  const day = Number((await params).i);
  const r = await dayResult(p, day);
  const fresh = (await searchParams).novos;
  if (!r.completed) {
    return <div className="space-y-4"><p>Você ainda não concluiu este dia.</p><Link href={`/app/dia/${day}`} className={buttonClass("primary", "lg", "w-full")}>Continuar</Link></div>;
  }
  const rows = [
    ["Vídeo", r.video_points],
    [`Itens (${r.correct_first_try} de primeira${r.correct_retry ? `, ${r.correct_retry} refeitos` : ""})`, r.item_points],
    ["Bônus de velocidade ⚡", r.bonus_points],
  ] as const;
  return (
    <div className="space-y-5">
      {fresh !== undefined && <Confetti />}
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">Dia {r.day.index} concluído{r.is_makeup ? " (recuperação)" : ""}</p>
        <p className="font-display text-6xl font-extrabold tabular text-slate-900">{r.total}</p>
        <p className="text-slate-500">pontos no dia</p>
      </div>
      <Card className="divide-y divide-slate-100 p-0">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between px-4 py-3 text-sm"><span className="text-slate-600">{k}</span><span className="font-display font-bold tabular">+{v}</span></div>
        ))}
        {r.position && <div className="flex items-center justify-between px-4 py-3 text-sm"><span className="text-slate-600">Sua posição no ranking</span><span className="font-display font-bold">{r.position}º de {r.participants}</span></div>}
      </Card>
      {r.badges.length > 0 && (
        <div className="rounded-2xl bg-brand-accent/15 p-4">
          <p className="mb-2 font-display font-bold">Selos conquistados</p>
          <div className="flex flex-wrap gap-2">{r.badges.map((b) => <span key={b.code} className="animate-pop rounded-full bg-white px-3 py-1.5 text-sm font-semibold shadow-sm">{b.icon} {b.name}</span>)}</div>
        </div>
      )}
      {r.wheel_available && <Link href={`/app/dia/${day}/roleta`} className={buttonClass("accent", "lg", "w-full text-lg animate-pulse-ring")}>🎡 Girar a roleta</Link>}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/app/ranking" className={buttonClass("outline", "lg")}>Ranking</Link>
        <Link href="/app" className={buttonClass("primary", "lg")}>Início</Link>
      </div>
    </div>
  );
}
