"use client";

import { CheckCircle2, XCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SubmitResult } from "@/lib/game";

export function BonusBar({ left, total, makeup, label = "Bônus de velocidade" }: { left: number; total: number; makeup: boolean; label?: string }) {
  if (makeup) return <p className="text-xs font-medium text-amber-700">Recuperação: 50% dos pontos, sem bônus.</p>;
  const pct = Math.max(0, Math.min(100, (left / total) * 100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-medium text-slate-600">
        <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-brand-accent" /> {label}</span>
        <span className="tabular">{Math.ceil(left)}s</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div className={cn("h-full rounded-full transition-[width] duration-100", pct > 40 ? "bg-brand-accent" : pct > 15 ? "bg-orange-500" : "bg-red-500")} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function FeedbackPanel({ result, onNext, onRetry, nextLabel = "Próxima" }: {
  result: SubmitResult; onNext?: () => void; onRetry?: () => void; nextLabel?: string;
}) {
  const ok = result.status === "correct";
  return (
    <div className={cn("animate-pop rounded-2xl p-4", ok ? "bg-green-50 ring-1 ring-green-200" : "bg-red-50 ring-1 ring-red-200")}>
      <div className="flex items-center gap-2">
        {ok ? <CheckCircle2 className="h-6 w-6 text-green-600" /> : <XCircle className="h-6 w-6 text-red-600" />}
        <p className={cn("font-display text-lg font-bold", ok ? "text-green-700" : "text-red-700")}>
          {ok ? "Acertou!" : result.timed_out ? "Tempo esgotado!" : "Não foi dessa vez"}
        </p>
        {ok && (
          <span className="ml-auto font-display text-lg font-extrabold tabular text-green-700">
            +{result.points}{result.bonus > 0 && <span className="text-brand-accent"> +{result.bonus}⚡</span>}
          </span>
        )}
      </div>
      {ok && (result.label || result.explanation) && (
        <p className="mt-2 text-sm text-slate-700">{result.label && <strong>{result.label}. </strong>}{result.explanation}</p>
      )}
      {!ok && <p className="mt-1 text-sm text-slate-700">Tente de novo: acertando agora você ganha 50 pontos.</p>}
      <div className="mt-3">
        {ok && onNext && <button onClick={onNext} className="h-11 w-full rounded-xl bg-brand font-semibold text-brand-fg">{nextLabel}</button>}
        {!ok && onRetry && <button onClick={onRetry} className="h-11 w-full rounded-xl bg-slate-900 font-semibold text-white">Tentar de novo</button>}
      </div>
    </div>
  );
}

export function Progress({ done, total, points }: { done: number; total: number; points: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-1 gap-1">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className={cn("h-2 flex-1 rounded-full", i < done ? "bg-green-500" : "bg-slate-200")} />
        ))}
      </div>
      <span className="font-display text-sm font-extrabold tabular text-slate-800">{points} pts</span>
    </div>
  );
}
