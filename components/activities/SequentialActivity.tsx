"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ActivityView, SubmitResult } from "@/lib/game";
import type { Answer } from "@/lib/activities";
import { cn } from "@/lib/utils";
import { BonusBar, FeedbackPanel, Progress } from "./Shared";
import { useActivity, useCountdown } from "./useActivity";
import { Timer } from "lucide-react";

/** Fato ou Fake, Acerte em Tempo e Novos Hábitos: um item por vez. */
export function SequentialActivity({ day, view, onDayComplete }: { day: number; view: ActivityView; onDayComplete: (b: string[]) => void }) {
  const { correct, points, busy, error, submit, start, startedAt } = useActivity(day, view, onDayComplete);
  const total = view.total;
  const firstOpen = useMemo(() => { for (let i = 0; i < total; i++) if (!correct.has(i)) return i; return total; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [idx, setIdx] = useState(firstOpen);
  const [feedback, setFeedback] = useState<SubmitResult | null>(null);
  const [picked, setPicked] = useState<number | boolean | null>(null);
  const timedLimit = view.public.type === "timed_quiz" ? view.public.time_limit_s : null;
  const running = !feedback && idx < total;
  const bonus = useCountdown(startedAt, view.bonus_window_s, running);
  const cut = useCountdown(startedAt, timedLimit ?? 999, running && !!timedLimit);
  const autoSent = useRef(-1);

  useEffect(() => { if (idx < total) void start(); }, [idx, start, total]);

  async function answer(a: Answer, pick: number | boolean | null) {
    if (busy || feedback) return;
    setPicked(pick);
    const r = await submit(idx, a);
    if (r && r.status !== "ignored") setFeedback(r);
  }

  // tempo esgotado no Acerte em Tempo
  useEffect(() => {
    if (timedLimit && running && cut.left <= 0 && autoSent.current !== idx) {
      autoSent.current = idx;
      void answer({ kind: "choice", index: null }, null);
    }
  });

  const next = () => {
    setFeedback(null); setPicked(null); autoSent.current = -1;
    let n = idx + 1;
    while (n < total && correct.has(n)) n++;
    setIdx(n);
  };
  const retry = () => { setFeedback(null); setPicked(null); autoSent.current = -1; void start(); };

  if (idx >= total) return <Progress done={correct.size} total={total} points={points} />;
  const pub = view.public;

  let prompt = "";
  let options: { label: string; answer: Answer; pick: number | boolean }[] = [];
  if (pub.type === "true_false") {
    prompt = pub.items[idx].statement;
    options = [
      { label: "Fato ✅", answer: { kind: "bool", value: true }, pick: true },
      { label: "Fake ❌", answer: { kind: "bool", value: false }, pick: false },
    ];
  } else if (pub.type === "timed_quiz" || pub.type === "new_habits") {
    const it = pub.items[idx];
    prompt = "question" in it ? it.question : it.situation;
    options = it.options.map((o, i) => ({ label: o, answer: { kind: "choice", index: i } as Answer, pick: i }));
  }

  return (
    <div className="space-y-4">
      <Progress done={correct.size} total={total} points={points} />
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>Item {idx + 1} de {total}</span>
        {timedLimit && running && (
          <span className={cn("flex items-center gap-1 font-display text-lg font-extrabold tabular", cut.left < 5 ? "text-red-600" : "text-slate-800")}>
            <Timer className="h-4 w-4" />{Math.ceil(cut.left)}s
          </span>
        )}
      </div>
      {running && <BonusBar left={bonus.left} total={view.bonus_window_s} makeup={view.is_makeup} />}

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        {pub.type === "new_habits" && <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand">Situação</p>}
        <p className="font-display text-xl font-bold leading-snug text-slate-900">{prompt}</p>
      </div>

      <div className={cn("grid gap-3", pub.type === "true_false" ? "grid-cols-2" : "grid-cols-1")}>
        {options.map((o) => {
          const chosen = picked === o.pick;
          return (
            <button key={String(o.pick)} disabled={busy || !!feedback} onClick={() => answer(o.answer, o.pick)}
              className={cn(
                "rounded-2xl border-2 bg-white p-4 text-left font-semibold text-slate-800 shadow-sm transition active:scale-[.98]",
                pub.type === "true_false" && "py-6 text-center text-lg",
                chosen && feedback?.status === "correct" && "border-green-500 bg-green-50",
                chosen && feedback?.status === "wrong" && "animate-shake border-red-500 bg-red-50",
                !chosen && "border-slate-200 hover:border-brand",
              )}>
              {o.label}
            </button>
          );
        })}
      </div>

      {feedback && <FeedbackPanel result={feedback} onNext={next} onRetry={retry} nextLabel={correct.size >= total ? "Ver resultado" : "Próxima"} />}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
