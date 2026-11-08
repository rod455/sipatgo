import Link from "next/link";
import { Check, Clock, Lock, RotateCcw, Play, X } from "lucide-react";
import type { DaySummary } from "@/lib/game";
import { ACTIVITY_LABELS } from "@/lib/activities";
import { weekdayName, formatDateBR } from "@/lib/dates";
import { cn } from "@/lib/utils";

export function DayCard({ d, tz }: { d: DaySummary; tz: string }) {
  const locked = d.state === "locked";
  const done = d.state === "done" || d.state === "done_makeup";
  const icon = {
    locked: <Lock className="h-5 w-5" />, available: <Play className="h-5 w-5" />, makeup: <RotateCcw className="h-5 w-5" />,
    done: <Check className="h-5 w-5" />, done_makeup: <Check className="h-5 w-5" />, missed: <X className="h-5 w-5" />,
  }[d.state];
  const label = {
    locked: `Abre ${new Intl.DateTimeFormat("pt-BR", { timeZone: tz, weekday: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(d.release_at))}`,
    available: d.video_done ? `Dinâmica ${d.items_correct}/${d.items_total}` : "Disponível agora",
    makeup: "Recuperar (vale 50%)",
    done: `${d.points} pts`,
    done_makeup: `${d.points} pts · recuperado`,
    missed: "Não realizado",
  }[d.state];

  const body = (
    <div className={cn(
      "flex items-center gap-3 rounded-2xl border p-3 transition",
      d.state === "available" && "border-brand bg-white shadow-md ring-2 ring-brand/20",
      d.state === "makeup" && "border-amber-300 bg-amber-50",
      done && "border-green-200 bg-green-50",
      locked && "border-slate-200 bg-slate-100 opacity-70",
      d.state === "missed" && "border-slate-200 bg-white opacity-60",
    )}>
      <div className={cn("flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl text-xs font-bold",
        d.state === "available" ? "bg-brand text-brand-fg" : done ? "bg-green-500 text-white" : d.state === "makeup" ? "bg-amber-400 text-amber-950" : "bg-slate-200 text-slate-500")}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{weekdayName(d.date)} · {formatDateBR(d.date).slice(0, 5)}</p>
        <p className="truncate font-semibold text-slate-900">{locked ? "Bloqueado" : d.title || `Dia ${d.day_index}`}</p>
        <p className="flex items-center gap-1 text-xs text-slate-600">
          {d.state === "locked" && <Clock className="h-3 w-3" />}{label}
          {!locked && d.activity_type && <span className="text-slate-400"> · {ACTIVITY_LABELS[d.activity_type]}</span>}
        </p>
      </div>
      {d.has_wheel && !locked && <span title="Dia de roleta" className="text-xl">🎡</span>}
    </div>
  );
  if (locked || d.state === "missed") return body;
  return <Link href={d.wheel_available ? `/app/dia/${d.day_index}/roleta` : `/app/dia/${d.day_index}`}>{body}</Link>;
}
