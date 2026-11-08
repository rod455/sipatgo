"use client";

import { useEffect, useRef, useState } from "react";
import type { ActivityView, SubmitResult } from "@/lib/game";
import { cn } from "@/lib/utils";
import { BonusBar, Progress } from "./Shared";
import { useActivity, useCountdown } from "./useActivity";

type Rect = { x: number; y: number; w: number; h: number };

/** Encontre os Erros: toque nas áreas com problema; o servidor confere. */
export function FindErrors({ day, view, onDayComplete }: { day: number; view: ActivityView; onDayComplete: (b: string[]) => void }) {
  const { correct, points, busy, error, submit, start, startedAt } = useActivity(day, view, onDayComplete);
  const pub = view.public as Extract<ActivityView["public"], { type: "find_errors" }>;
  const box = useRef<HTMLDivElement>(null);
  const [misses, setMisses] = useState<{ x: number; y: number; id: number }[]>([]);
  const [last, setLast] = useState<SubmitResult | null>(null);
  const [hint, setHint] = useState<Rect | null>(null);
  const [wrongStreak, setWrongStreak] = useState(0);
  const done = correct.size >= view.total;
  const bonus = useCountdown(startedAt, view.bonus_window_s, !done);

  useEffect(() => { void start(); }, [start]);

  async function onTap(e: React.MouseEvent<HTMLDivElement>) {
    if (busy || done || !box.current) return;
    const r = box.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    const res = await submit(-1, { kind: "click", x, y });
    if (!res || res.status === "ignored") return;
    setLast(res);
    if (res.status === "wrong") {
      const id = Date.now();
      setMisses((m) => [...m, { x, y, id }]);
      setTimeout(() => setMisses((m) => m.filter((k) => k.id !== id)), 900);
      setWrongStreak((s) => s + 1);
      if (res.hint_rect) setHint(res.hint_rect);
    } else {
      setWrongStreak(0);
      setHint(null);
    }
  }

  const found = [...correct.values()].filter((c) => c.hotspot);

  return (
    <div className="space-y-4">
      <Progress done={correct.size} total={view.total} points={points} />
      {!done && <BonusBar left={bonus.left} total={view.bonus_window_s} makeup={view.is_makeup} label="Bônus do próximo erro" />}
      <p className="text-sm text-slate-600">Encontre {view.total} situações de risco na imagem. Toque em cima de cada uma.</p>
      <div ref={box} onClick={onTap} className="relative w-full cursor-crosshair select-none overflow-hidden rounded-2xl bg-slate-200 shadow ring-1 ring-slate-300">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={pub.image_url} alt="Cena para encontrar os erros" className="pointer-events-none block w-full" draggable={false} />
        {found.map((c) => (
          <div key={c.item_index} className="animate-pop absolute rounded-lg border-4 border-green-500 bg-green-500/20"
            style={{ left: `${c.hotspot!.x}%`, top: `${c.hotspot!.y}%`, width: `${c.hotspot!.w}%`, height: `${c.hotspot!.h}%` }}>
            <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">✓</span>
          </div>
        ))}
        {hint && !done && (
          <div className="pointer-events-none absolute animate-pulse rounded-full border-4 border-dashed border-amber-400"
            style={{ left: `${hint.x}%`, top: `${hint.y}%`, width: `${hint.w}%`, height: `${hint.h}%` }} />
        )}
        {misses.map((m) => (
          <span key={m.id} className="animate-pop pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-2xl font-black text-red-600 drop-shadow"
            style={{ left: `${m.x}%`, top: `${m.y}%` }}>✕</span>
        ))}
      </div>
      {wrongStreak > 0 && wrongStreak < pub.max_wrong_clicks && !done && (
        <p className="text-xs text-slate-500">Cliques errados: {wrongStreak}/{pub.max_wrong_clicks} — depois disso aparece uma dica.</p>
      )}
      {last && (
        <div className={cn("animate-pop rounded-xl p-3 text-sm", last.status === "correct" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700")}>
          {last.status === "correct"
            ? <><strong>+{last.points}{last.bonus ? ` +${last.bonus}⚡` : ""} · {last.label}.</strong> {last.explanation}</>
            : hint ? "Dica: procure na área destacada." : "Aí não tem erro. Continue procurando!"}
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
