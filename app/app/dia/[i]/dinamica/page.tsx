import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireViewer, HttpError } from "@/lib/auth";
import { getActivityView } from "@/lib/game";
import { ACTIVITY_LABELS } from "@/lib/activities";
import { ActivityRunner } from "@/components/activities/ActivityRunner";
import { Alert } from "@/components/ui";
import { ArrowLeft } from "lucide-react";

export default async function ActivityPage({ params }: { params: Promise<{ i: string }> }) {
  const { participant: p } = await requireViewer();
  const day = Number((await params).i);
  let view;
  try { view = await getActivityView(p, day); } catch (e) {
    if (e instanceof HttpError) return <div className="space-y-3"><Link href="/app" className="text-sm text-slate-500">← Início</Link><Alert tone="amber">{e.message}</Alert></div>;
    throw e;
  }
  if (!view) notFound();
  if (view.state === "done" || view.state === "done_makeup") redirect(`/app/dia/${day}/resultado`);
  if (!view.video_done) redirect(`/app/dia/${day}`);
  if (view.state === "missed") return <Alert>O prazo para este dia terminou.</Alert>;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href={`/app/dia/${day}`} className="inline-flex items-center gap-1 text-sm text-slate-500"><ArrowLeft className="h-4 w-4" /> Dia {day}</Link>
        <span className="rounded-full bg-brand px-3 py-1 text-xs font-bold text-brand-fg">{ACTIVITY_LABELS[view.type]}</span>
      </div>
      <ActivityRunner day={day} view={view} />
    </div>
  );
}
