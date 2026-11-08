"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, RotateCcw, Timer, XCircle } from "lucide-react";
import { DEMO_CLIENT } from "@/content/site/demo-client";
import { cn } from "@/lib/utils";
import { BONUS_TIMER_SECONDS, FACT_ITEMS, POINTS, speedBonus } from "./config";

export type ItemResult = { base: number; bonus: number; firstTry: boolean; seconds: number };

type Phase = "answering" | "wrong" | "right";

/** Passo 2: Fato ou Fake com 3 itens. 100 na 1ª, 50 no refazer, bônus 0–20 pelo tempo. */
export function FactOrFake({ onDone }: { onDone: (results: ItemResult[]) => void }) {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("answering");
  const [wrongCount, setWrongCount] = useState(0);
  const [results, setResults] = useState<ItemResult[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(0);

  const item = FACT_ITEMS[idx];
  const timerRunning = phase === "answering" && wrongCount === 0;

  useEffect(() => {
    startRef.current = performance.now();
    setElapsed(0);
  }, [idx]);

  useEffect(() => {
    if (!timerRunning) return;
    const t = window.setInterval(() => setElapsed((performance.now() - startRef.current) / 1000), 100);
    return () => window.clearInterval(t);
  }, [timerRunning, idx]);

  function answer(choice: boolean) {
    if (phase !== "answering") return;
    const seconds = (performance.now() - startRef.current) / 1000;
    if (choice === item.answer) {
      const firstTry = wrongCount === 0;
      const r: ItemResult = {
        base: firstTry ? POINTS.firstTry : POINTS.retry,
        bonus: firstTry ? speedBonus(seconds) : 0,
        firstTry,
        seconds,
      };
      setResults((prev) => [...prev, r]);
      setElapsed(seconds);
      setPhase("right");
    } else {
      setWrongCount((n) => n + 1);
      setElapsed(seconds);
      setPhase("wrong");
    }
  }

  function next() {
    if (idx < FACT_ITEMS.length - 1) {
      setIdx(idx + 1);
      setWrongCount(0);
      setPhase("answering");
    } else {
      onDone(results);
    }
  }

  const last = results[results.length - 1];
  const remaining = Math.max(0, BONUS_TIMER_SECONDS - elapsed);
  const total = results.reduce((s, r) => s + r.base + r.bonus, 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-2xl font-extrabold text-sg-navy-900">Fato ou Fake</h2>
        <span className="rounded-full bg-sg-sand-100 px-3 py-1 text-sm font-semibold text-sg-navy-900 tabular">
          Item {idx + 1} de {FACT_ITEMS.length} · {total} pts
        </span>
      </div>

      <div className="mt-4 flex items-center gap-3 text-sm text-sg-gray-600">
        <Timer aria-hidden className="size-4" />
        {wrongCount === 0 ? (
          <span className="tabular" aria-live="off">
            Bônus de velocidade: <b className="text-sg-navy-900">+{phase === "right" && last ? last.bonus : speedBonus(elapsed)}</b> ({Math.ceil(remaining)}s)
          </span>
        ) : (
          <span>Refazendo: acerto agora vale {POINTS.retry} pontos, sem bônus.</span>
        )}
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-sg-sand-100" aria-hidden>
        <div
          className="h-full rounded-full transition-[width] duration-100"
          style={{ width: `${wrongCount === 0 ? (remaining / BONUS_TIMER_SECONDS) * 100 : 0}%`, background: DEMO_CLIENT.secondary }}
        />
      </div>

      <div className={cn("mt-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sg-navy-900/10", phase === "wrong" && "animate-shake")}>
        <p className="font-display text-xl leading-8 font-bold text-sg-navy-900">“{item.statement}”</p>
      </div>

      {phase === "answering" ? (
        <div className="mt-5 grid grid-cols-2 gap-3">
          {[
            { v: true, label: "Fato" },
            { v: false, label: "Fake" },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              onClick={() => answer(o.v)}
              className="h-16 rounded-2xl text-xl font-extrabold text-white shadow-md transition hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-sg-yellow-400/70 focus-visible:outline-none"
              style={{ background: o.v ? DEMO_CLIENT.primary : DEMO_CLIENT.secondary }}
            >
              {o.label}
            </button>
          ))}
        </div>
      ) : null}

      <div aria-live="assertive">
        {phase === "wrong" ? (
          <div className="mt-5 rounded-2xl bg-red-50 p-5 ring-1 ring-red-200">
            <p className="flex items-center gap-2 font-bold text-red-800">
              <XCircle aria-hidden className="size-5" /> Não foi dessa vez.
            </p>
            <p className="mt-1 text-red-900">{item.hint}</p>
            <button
              type="button"
              onClick={() => setPhase("answering")}
              className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-sg-navy-900 px-5 font-semibold text-white hover:bg-sg-navy-700"
            >
              <RotateCcw aria-hidden className="size-4" /> Tentar de novo (vale {POINTS.retry})
            </button>
          </div>
        ) : null}

        {phase === "right" && last ? (
          <div className="animate-pop mt-5 rounded-2xl bg-green-50 p-5 ring-1 ring-green-200">
            <p className="flex flex-wrap items-center gap-2 font-bold text-green-900">
              <CheckCircle2 aria-hidden className="size-5" /> Acertou! +{last.base}
              {last.bonus ? ` +${last.bonus} de bônus` : ""}
            </p>
            <p className="mt-1 text-green-950">{item.explanation}</p>
            <button
              type="button"
              onClick={next}
              className="mt-4 inline-flex h-11 items-center rounded-xl px-5 font-semibold text-white"
              style={{ background: DEMO_CLIENT.primary }}
            >
              {idx < FACT_ITEMS.length - 1 ? "Próximo item" : "Ver meu resultado"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
