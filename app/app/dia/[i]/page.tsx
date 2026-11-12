import Link from "next/link";
import { notFound } from "next/navigation";
import { requireViewer, HttpError } from "@/lib/auth";
import { dayContext } from "@/lib/game";
import { sql } from "@/lib/db";
import { weekdayName } from "@/lib/dates";
import { ACTIVITY_LABELS } from "@/lib/activities";
import { DayVideo } from "./DayVideo";
import { FileText, Link2, ArrowLeft } from "lucide-react";
import { Alert } from "@/components/ui";

export default async function DayPage({ params }: { params: Promise<{ i: string }> }) {
  const { participant: p } = await requireViewer();
  const idx = Number((await params).i);
  if (!(idx >= 1 && idx <= 5)) notFound();
  let ctx;
  try { ctx = await dayContext(p, idx); } catch (e) { if (e instanceof HttpError) notFound(); throw e; }
  if (ctx.state === "locked") {
    return <div className="space-y-4"><Back /><Alert tone="amber">Este dia ainda não foi liberado. Volte no horário de abertura!</Alert></div>;
  }
  const [view] = await sql<{ completed: boolean }[]>`
    select completed_at is not null as completed from sipatgo.video_views where participant_id = ${p.id} and campaign_day_id = ${ctx.day.id}`;
  const materials = await sql<{ id: string; title: string; url: string; kind: string }[]>`
    select id, title, url, kind from sipatgo.materials where campaign_day_id = ${ctx.day.id} order by sort, title`;
  const done = ctx.state === "done" || ctx.state === "done_makeup";

  return (
    <div className="space-y-5">
      <Back />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">{weekdayName(ctx.day.date)} · Dia {idx}</p>
        <h1 className="font-display text-2xl font-bold">{ctx.day.title || `Dia ${idx}`}</h1>
        {ctx.day.theme && <p className="text-sm text-brand-muted">{ctx.day.theme}</p>}
      </div>
      {ctx.state === "makeup" && <Alert tone="amber">Você está recuperando este dia: vale 50% dos pontos, sem bônus de velocidade.</Alert>}
      {ctx.state === "missed" && <Alert>O prazo para este dia terminou.</Alert>}

      <DayVideo
        day={idx}
        videoId={ctx.day.youtube_video_id}
        segments={ctx.day.video_segments?.length ? ctx.day.video_segments
          : ctx.day.video_start_s || ctx.day.video_end_s ? [{ start: ctx.day.video_start_s ?? 0, end: ctx.day.video_end_s }] : null}
        alreadyDone={!!view?.completed || !ctx.day.youtube_video_id}
        dayDone={done}
        activityLabel={ctx.activity ? ACTIVITY_LABELS[ctx.activity.type] : null}
        canPlay={ctx.state === "available" || ctx.state === "makeup"}
      />

      {materials.length > 0 && (
        <section>
          <h2 className="mb-2 font-display text-lg font-bold">Materiais de apoio</h2>
          <ul className="space-y-2">
            {materials.map((m) => (
              <li key={m.id}>
                <a href={m.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl bg-white p-3 text-sm font-medium shadow-sm ring-1 ring-brand-100">
                  {m.kind === "pdf" ? <FileText className="h-5 w-5 text-brand" /> : <Link2 className="h-5 w-5 text-brand" />}{m.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Back() {
  return <Link href="/app" className="inline-flex items-center gap-1 text-sm text-brand-muted"><ArrowLeft className="h-4 w-4" /> Início</Link>;
}
