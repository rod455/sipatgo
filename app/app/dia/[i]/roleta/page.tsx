import Link from "next/link";
import { requireViewer } from "@/lib/auth";
import { dayContext } from "@/lib/game";
import { sql } from "@/lib/db";
import { isClosed } from "@/lib/calendar";
import { Wheel } from "@/components/wheel/Wheel";
import { Alert, buttonClass } from "@/components/ui";

export default async function WheelPage({ params }: { params: Promise<{ i: string }> }) {
  const { participant: p } = await requireViewer();
  const day = Number((await params).i);
  const ctx = await dayContext(p, day);
  const [spin] = await sql<{ code: string }[]>`
    select a.code from sipatgo.wheel_spins w join sipatgo.prize_awards a on a.wheel_spin_id = w.id
     where w.participant_id = ${p.id} and w.campaign_day_id = ${ctx.day.id}`;
  let blocker: string | null = null;
  if (!ctx.day.has_wheel) blocker = "Este dia não tem roleta.";
  else if (ctx.state === "done_makeup") blocker = "A roleta não vale para dias feitos na recuperação.";
  else if (ctx.state !== "done") blocker = "Conclua a dinâmica do dia para liberar a roleta.";
  else if (isClosed(ctx.campaign, ctx.now)) blocker = "A campanha foi encerrada.";

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-extrabold">Roleta de brindes</h1>
        <p className="text-sm text-brand-muted">Todo giro ganha! 1 giro por dia de roleta.</p>
      </div>
      {spin ? (
        <div className="rounded-2xl bg-white p-5 text-center shadow ring-1 ring-brand-100">
          <p className="font-display text-xl font-bold">Você já girou hoje 🎁</p>
          <p className="mt-2 text-sm text-brand-muted">Retire seu brinde no RH com o código:</p>
          <p className="mt-1 font-display text-3xl font-extrabold tracking-widest tabular">{spin.code}</p>
        </div>
      ) : blocker ? <Alert tone="amber">{blocker}</Alert> : <Wheel day={day} />}
      <Link href="/app" className={buttonClass("outline", "lg", "w-full")}>Voltar ao início</Link>
    </div>
  );
}
