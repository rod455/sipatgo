"use client";

import { useEffect, useState } from "react";
import type { ActivityView, SubmitResult } from "@/lib/game";
import { cn } from "@/lib/utils";
import { BonusBar, Progress } from "./Shared";
import { useActivity, useCountdown } from "./useActivity";
import { CheckCircle2 } from "lucide-react";

/** Ligue os Pares: toque à esquerda e depois à direita. */
export function MatchPairs({ day, view, onDayComplete }: { day: number; view: ActivityView; onDayComplete: (b: string[]) => void }) {
  const { correct, points, busy, error, submit, start, startedAt } = useActivity(day, view, onDayComplete);
  const pub = view.public as Extract<ActivityView["public"], { type: "match_pairs" }>;
  const [left, setLeft] = useState<number | null>(null);
  const [rightMatched, setRightMatched] = useState<Record<number, number>>(view.matched_right ?? {}); // pos direita → índice esquerda
  const [flash, setFlash] = useState<{ l: number; r: number } | null>(null);
  const [last, setLast] = useState<SubmitResult | null>(null);
  const done = correct.size >= view.total;
  const bonus = useCountdown(startedAt, view.bonus_window_s, !done);

  useEffect(() => { void start(); }, [start]);

  async function pickRight(r: number) {
    if (left === null || busy || r in rightMatched) return;
    const res = await submit(left, { kind: "pair", left, right: r });
    if (!res) return;
    setLast(res);
    if (res.status === "correct") {
      setRightMatched((m) => ({ ...m, [r]: left }));
      setLeft(null);
    } else if (res.status === "wrong") {
      setFlash({ l: left, r });
      setTimeout(() => setFlash(null), 700);
    }
  }

  const rightUsed = (pos: number) => pos in rightMatched;

  return (
    <div className="space-y-4">
      <Progress done={correct.size} total={view.total} points={points} />
      {!done && <BonusBar left={bonus.left} total={view.bonus_window_s} makeup={view.is_makeup} label="Bônus do próximo par" />}
      <p className="text-sm text-slate-600">Toque em um item da esquerda e depois no par correspondente da direita.</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {pub.left.map((t, i) => {
            const ok = correct.has(i);
            return (
              <button key={i} disabled={ok || busy} onClick={() => setLeft(i)}
                className={cn("flex min-h-16 w-full items-center rounded-xl border-2 bg-white p-3 text-left text-sm font-semibold shadow-sm transition",
                  ok && "border-green-500 bg-green-50 text-green-800",
                  !ok && left === i && "border-brand bg-brand/10",
                  !ok && left !== i && "border-slate-200",
                  flash?.l === i && "animate-shake border-red-500 bg-red-50")}>
                {ok && <CheckCircle2 className="mr-1 h-4 w-4 shrink-0 text-green-600" />}{t}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {pub.right.map((t, pos) => {
            const ok = rightUsed(pos);
            return (
              <button key={pos} disabled={ok || busy || left === null} onClick={() => pickRight(pos)}
                className={cn("flex min-h-16 w-full items-center rounded-xl border-2 bg-white p-3 text-left text-sm font-semibold shadow-sm transition",
                  ok && "border-green-500 bg-green-50 text-green-800",
                  !ok && left !== null && "border-slate-300 hover:border-brand",
                  !ok && left === null && "border-slate-200 opacity-80",
                  flash?.r === pos && "animate-shake border-red-500 bg-red-50")}>
                {t}
              </button>
            );
          })}
        </div>
      </div>
      {last && (
        <div className={cn("animate-pop rounded-xl p-3 text-sm", last.status === "correct" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700")}>
          {last.status === "correct"
            ? <><strong>+{last.points}{last.bonus ? ` +${last.bonus}⚡` : ""}</strong> {last.explanation}</>
            : "Esse par não combina. Tente outro (acertando depois vale 50)."}
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
