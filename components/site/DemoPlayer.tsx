"use client";

import { useCallback, useRef, useState } from "react";
import { Check, Play, RotateCcw } from "lucide-react";
import { DEMO_CLIENT } from "@/content/site/demo-client";
import { cn } from "@/lib/utils";
import { track } from "./analytics";
import { FactOrFake, type ItemResult } from "./demo/FactOrFake";
import { RankingStep } from "./demo/RankingStep";
import { VideoStep } from "./demo/VideoStep";
import { WheelStep } from "./demo/WheelStep";
import { LeadForm } from "./LeadForm";

type Step = "intro" | "video" | "quiz" | "wheel" | "ranking";
const STEPS: { id: Exclude<Step, "intro">; label: string }[] = [
  { id: "video", label: "Vídeo" },
  { id: "quiz", label: "Desafio" },
  { id: "wheel", label: "Roleta" },
  { id: "ranking", label: "Ranking" },
];

/** Mini campanha jogável, sem login e sem persistência. */
export function DemoPlayer() {
  const [step, setStep] = useState<Step>("intro");
  const [name, setName] = useState("");
  const [videoPts, setVideoPts] = useState(0);
  const [items, setItems] = useState<ItemResult[]>([]);
  const [round, setRound] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);

  const go = useCallback((s: Step) => {
    setStep(s);
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, []);

  const quizPts = items.reduce((s, r) => s + r.base + r.bonus, 0);
  const total = videoPts + quizPts;
  const playerName = name.trim().split(/\s+/)[0]?.slice(0, 20) || "Você";
  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const onVideoDone = useCallback(
    (pts: number) => {
      setVideoPts(pts);
      go("quiz");
    },
    [go],
  );
  const onQuizDone = useCallback(
    (r: ItemResult[]) => {
      setItems(r);
      go("wheel");
    },
    [go],
  );
  const onWheelDone = useCallback(() => {
    track("demo_finish", { points: videoPts + quizPts });
    go("ranking");
  }, [go, videoPts, quizPts]);

  function start(e: React.FormEvent) {
    e.preventDefault();
    track("demo_start");
    go("video");
  }

  function restart() {
    setVideoPts(0);
    setItems([]);
    setRound((r) => r + 1);
    go("video");
  }

  return (
    <div ref={topRef} className="scroll-mt-24">
      <div className="overflow-hidden rounded-3xl bg-sg-sand-50 shadow-xl ring-1 ring-sg-navy-900/10">
        {/* Barra da "empresa cliente" */}
        <div className="flex items-center gap-3 px-5 py-3 text-white" style={{ background: DEMO_CLIENT.primary }}>
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-white text-xs font-extrabold" style={{ color: DEMO_CLIENT.primary }} aria-hidden>
            {DEMO_CLIENT.short}
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-xs opacity-90">{DEMO_CLIENT.name} · marca fictícia</p>
            <p className="truncate text-sm font-bold">SIPAT 2026 · Mãos seguras</p>
          </div>
          {step !== "intro" ? (
            <span className="ml-auto rounded-full bg-white/20 px-3 py-1 text-sm font-bold tabular" aria-live="polite">
              {total} pts
            </span>
          ) : null}
        </div>

        {step !== "intro" ? (
          <ol className="flex gap-1 border-b border-sg-navy-900/10 bg-white px-3 py-2 text-xs font-semibold sm:gap-2 sm:px-5 sm:text-sm" aria-label="Etapas da demo">
            {STEPS.map((s, i) => (
              <li
                key={s.id}
                aria-current={s.id === step ? "step" : undefined}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1 rounded-lg px-1 py-1.5",
                  i < stepIndex ? "text-green-700" : i === stepIndex ? "bg-sg-navy-900 text-white" : "text-sg-gray-600",
                )}
              >
                {i < stepIndex ? <Check aria-hidden className="size-3.5" strokeWidth={3} /> : null}
                {s.label}
              </li>
            ))}
          </ol>
        ) : null}

        <div className="p-5 md:p-8">
          {step === "intro" ? (
            <form onSubmit={start} className="mx-auto max-w-md text-center">
              <span className="inline-flex size-16 items-center justify-center rounded-2xl text-white" style={{ background: DEMO_CLIENT.secondary }}>
                <Play aria-hidden className="size-8" strokeWidth={2} />
              </span>
              <h2 className="mt-4 font-display text-2xl font-extrabold text-sg-navy-900">Jogue um dia de SIPAT</h2>
              <p className="mt-2 text-sg-gray-600">Vídeo curto, 3 perguntas de Fato ou Fake, roleta e ranking. Leva 2 minutos. Sem cadastro.</p>
              <label htmlFor="demo-name" className="mt-6 block text-left text-sm font-semibold text-sg-navy-900">
                Como você quer aparecer no ranking? <span className="font-normal text-sg-gray-600">(opcional)</span>
              </label>
              <input
                id="demo-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
                autoComplete="given-name"
                placeholder="Seu primeiro nome"
                className="mt-1.5 block h-12 w-full rounded-xl border border-sg-navy-900/15 bg-white px-4 text-base text-sg-navy-900 focus:border-sg-navy-500 focus:ring-4 focus:ring-sg-navy-500/20 focus:outline-none"
              />
              <button
                type="submit"
                className="mt-5 inline-flex h-14 w-full items-center justify-center rounded-xl bg-sg-orange-500 px-7 text-lg font-semibold text-sg-navy-900 shadow-[0_6px_20px_-6px_rgba(255,106,19,.7)] hover:bg-[#FF7D33]"
              >
                Começar a demo
              </button>
            </form>
          ) : null}

          {step === "video" ? <VideoStep key={`v${round}`} onDone={onVideoDone} /> : null}
          {step === "quiz" ? <FactOrFake key={`q${round}`} onDone={onQuizDone} /> : null}
          {step === "wheel" ? <WheelStep key={`w${round}`} onDone={onWheelDone} /> : null}
          {step === "ranking" ? (
            <>
              <RankingStep playerName={playerName} points={total} />
              <div className="mt-6 grid gap-2 rounded-2xl bg-white p-4 text-sm text-sg-gray-600 ring-1 ring-sg-navy-900/5 sm:grid-cols-3">
                <p>
                  Vídeo: <b className="text-sg-navy-900 tabular">{videoPts}</b>
                </p>
                <p>
                  Acertos: <b className="text-sg-navy-900 tabular">{items.reduce((s, r) => s + r.base, 0)}</b>
                </p>
                <p>
                  Bônus de velocidade: <b className="text-sg-navy-900 tabular">{items.reduce((s, r) => s + r.bonus, 0)}</b>
                </p>
              </div>
              <button
                type="button"
                onClick={restart}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sg-navy-500 hover:underline"
              >
                <RotateCcw aria-hidden className="size-4" /> Jogar de novo
              </button>
            </>
          ) : null}
        </div>
      </div>

      {step === "ranking" ? (
        <div className="mt-10 rounded-3xl bg-sg-navy-900 p-6 text-white md:p-10">
          <h2 className="font-display text-3xl font-extrabold">Gostou? Monte a sua.</h2>
          <p className="mt-2 text-white/80">5 dias assim, com a marca da sua empresa, ranking por setor e relatório para a NR-5.</p>
          <LeadForm origem="demo" tone="dark" className="mt-6" />
        </div>
      ) : null}
    </div>
  );
}
