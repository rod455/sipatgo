"use client";

import { useEffect, useState } from "react";
import { Check, Lock, Play, Timer, Trophy } from "lucide-react";
import { DEMO_CLIENT } from "@/content/site/demo-client";
import { cn } from "@/lib/utils";


export type PhoneScreen = "day" | "quiz" | "wheel";
const SCREENS: { id: PhoneScreen; label: string }[] = [
  { id: "day", label: "Tela do dia" },
  { id: "quiz", label: "Dinâmica" },
  { id: "wheel", label: "Roleta" },
];

function ClientBar({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 px-4 pt-3 pb-3 text-white" style={{ background: DEMO_CLIENT.primary }}>
      <span
        className="inline-flex size-7 items-center justify-center rounded-lg bg-white text-[11px] font-extrabold"
        style={{ color: DEMO_CLIENT.primary }}
        aria-hidden
      >
        {DEMO_CLIENT.short}
      </span>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-[11px] font-semibold opacity-90">{DEMO_CLIENT.name}</p>
        <p className="truncate text-[13px] font-bold">{title}</p>
      </div>
    </div>
  );
}

function DayScreen() {
  const days = [
    { d: "Seg", t: "Abertura", state: "done" as const },
    { d: "Ter", t: "Ergonomia", state: "today" as const },
    { d: "Qua", t: "Esmagamento", state: "locked" as const },
    { d: "Qui", t: "Saúde mental", state: "locked" as const },
    { d: "Sex", t: "Compromisso", state: "locked" as const },
  ];
  return (
    <div className="flex h-full flex-col bg-slate-50">
      <ClientBar title="SIPAT 2026 · Mãos seguras" />
      <div className="flex items-center gap-2 px-4 py-3">
        <span className="inline-flex size-9 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: DEMO_CLIENT.secondary }} aria-hidden>
          A
        </span>
        <div className="leading-tight">
          <p className="text-[13px] font-bold text-slate-900">Olá, Ana!</p>
          <p className="text-[11px] text-slate-600">Você está em 4º no ranking</p>
        </div>
        <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900 tabular">1.190 pts</span>
      </div>
      <ul className="space-y-2 px-4">
        {days.map((day) => (
          <li
            key={day.d}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-3 py-2.5",
              day.state === "today" ? "border-transparent text-white shadow-md" : "border-slate-200 bg-white",
              day.state === "locked" && "opacity-60",
            )}
            style={day.state === "today" ? { background: DEMO_CLIENT.primary } : undefined}
          >
            <span className={cn("w-8 text-[12px] font-extrabold", day.state === "today" ? "text-white" : "text-slate-900")}>{day.d}</span>
            <span className={cn("flex-1 truncate text-[12px]", day.state === "today" ? "text-white" : "text-slate-600")}>{day.t}</span>
            {day.state === "done" ? (
              <span className="inline-flex size-6 items-center justify-center rounded-full bg-green-100 text-green-700">
                <Check className="size-3.5" strokeWidth={3} aria-label="Concluído" />
              </span>
            ) : day.state === "today" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-bold" style={{ color: DEMO_CLIENT.primary }}>
                <Play className="size-3" strokeWidth={3} aria-hidden /> Hoje
              </span>
            ) : (
              <Lock className="size-4 text-slate-400" strokeWidth={2} aria-label="Bloqueado" />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function QuizScreen() {
  return (
    <div className="flex h-full flex-col bg-slate-50">
      <ClientBar title="Terça · Fato ou Fake" />
      <div className="flex items-center justify-between px-4 pt-3 text-[11px] font-semibold text-slate-600">
        <span>Item 2 de 5</span>
        <span className="inline-flex items-center gap-1 tabular">
          <Timer className="size-3.5" aria-hidden /> 0:14
        </span>
      </div>
      <div className="mx-4 mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full w-[70%] rounded-full" style={{ background: DEMO_CLIENT.secondary }} />
      </div>
      <div className="mx-4 mt-4 rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-[14px] leading-5 font-bold text-slate-900">
          “Usar luva perto de máquina rotativa aumenta a proteção das mãos.”
        </p>
      </div>
      <div className="mx-4 mt-4 grid grid-cols-2 gap-3">
        <span className="rounded-xl border-2 border-slate-200 bg-white py-3 text-center text-[13px] font-extrabold text-slate-900">Fato</span>
        <span className="rounded-xl py-3 text-center text-[13px] font-extrabold text-white ring-4 ring-green-200" style={{ background: "#16A34A" }}>
          Fake ✓
        </span>
      </div>
      <div className="mx-4 mt-3 rounded-xl bg-green-50 p-3 text-[11px] leading-4 text-green-900">
        <b>Acertou! +100 +14 de bônus.</b> A luva pode ser puxada pela máquina e levar a mão junto.
      </div>
    </div>
  );
}

function MiniWheel({ size = 150 }: { size?: number }) {
  const colors = [DEMO_CLIENT.primary, DEMO_CLIENT.secondary, DEMO_CLIENT.accent, "#0F172A"];
  const slices = 8;
  const r = 50;
  return (
    <svg viewBox="-55 -55 110 110" width={size} height={size} aria-hidden>
      {Array.from({ length: slices }).map((_, i) => {
        const a0 = (i / slices) * Math.PI * 2 - Math.PI / 2;
        const a1 = ((i + 1) / slices) * Math.PI * 2 - Math.PI / 2;
        const x0 = r * Math.cos(a0);
        const y0 = r * Math.sin(a0);
        const x1 = r * Math.cos(a1);
        const y1 = r * Math.sin(a1);
        return <path key={i} d={`M0 0 L${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`} fill={colors[i % colors.length]} />;
      })}
      <circle r="10" fill="#fff" />
      <circle r="52" fill="none" stroke="#fff" strokeWidth="3" />
    </svg>
  );
}

function WheelScreen() {
  return (
    <div className="flex h-full flex-col bg-slate-50">
      <ClientBar title="Quarta · Roleta de brindes" />
      <div className="relative mx-auto mt-6">
        <span className="absolute -top-2 left-1/2 z-10 -translate-x-1/2 border-x-8 border-t-[14px] border-x-transparent border-t-slate-900" aria-hidden />
        <div className="motion-safe:animate-[spin_6s_linear_infinite]">
          <MiniWheel />
        </div>
      </div>
      <div className="mx-4 mt-5 rounded-2xl bg-white p-3 text-center shadow-sm">
        <p className="text-[14px] font-extrabold text-slate-900">Você ganhou um brinde! 🎉</p>
        <p className="mt-1 text-[11px] text-slate-600">Retire no RH com o código</p>
        <p className="mt-1 font-mono text-[15px] font-bold tracking-widest tabular" style={{ color: DEMO_CLIENT.secondary }}>
          H7QK-2M9P
        </p>
      </div>
    </div>
  );
}

/** Moldura de celular em HTML/CSS com a plataforma na marca fictícia. Gira 3 telas automaticamente. */
export function PhoneMockup({ screen, autoRotate = true, className }: { screen?: PhoneScreen; autoRotate?: boolean; className?: string }) {
  const [index, setIndex] = useState(() => Math.max(0, SCREENS.findIndex((s) => s.id === screen)));
  const [paused, setPaused] = useState(false);
  const rotating = autoRotate && !screen;

  useEffect(() => {
    if (!rotating || paused) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % SCREENS.length), 3800);
    return () => window.clearInterval(t);
  }, [rotating, paused]);

  const current = SCREENS[index].id;

  return (
    <div className={cn("relative", className)} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div
        role="img"
        aria-label={`Celular mostrando a plataforma com a marca fictícia ${DEMO_CLIENT.name}: ${SCREENS[index].label}`}
        className="relative mx-auto h-[520px] w-[260px] rounded-[42px] border-[10px] border-slate-900 bg-slate-900 shadow-2xl shadow-black/40"
      >
        <span className="absolute top-2 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-slate-900" aria-hidden />
        <div className="relative h-full w-full overflow-hidden rounded-[32px] bg-white pt-6">
          {SCREENS.map((s) => (
            <div
              key={s.id}
              aria-hidden={s.id !== current}
              className={cn("absolute inset-0 pt-6 transition-opacity duration-500", s.id === current ? "opacity-100" : "pointer-events-none opacity-0")}
            >
              {s.id === "day" ? <DayScreen /> : s.id === "quiz" ? <QuizScreen /> : <WheelScreen />}
            </div>
          ))}
        </div>
      </div>
      {rotating ? (
        <div className="mt-4 flex justify-center gap-2">
          {SCREENS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Mostrar ${s.label}`}
              aria-pressed={i === index}
              className={cn("h-2 rounded-full transition-all", i === index ? "w-6 bg-sg-orange-500" : "w-2 bg-white/40 hover:bg-white/70")}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Mini ranking ao vivo com avatares, para o lado do celular no hero. */
export function MiniRanking({ className }: { className?: string }) {
  const rows = [
    { n: "Carla M.", s: "Manutenção", p: 1310, c: "#1D4ED8" },
    { n: "Jorge P.", s: "Usinagem", p: 1285, c: "#15803D" },
    { n: "Bia R.", s: "Qualidade", p: 1240, c: "#B45309" },
    { n: "Ana S.", s: "Montagem", p: 1190, c: "#7C3AED", me: true },
  ];
  return (
    <div className={cn("w-60 rounded-2xl bg-white p-4 text-slate-900 shadow-2xl shadow-black/30", className)} aria-label="Exemplo de ranking ao vivo" role="img">
      <div className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[13px] font-extrabold">
          <Trophy className="size-4 text-sg-orange-500" aria-hidden /> Ranking geral
        </p>
        <span className="flex items-center gap-1 text-[10px] font-bold text-red-600">
          <span className="size-1.5 animate-pulse rounded-full bg-red-600" /> AO VIVO
        </span>
      </div>
      <ol className="space-y-2">
        {rows.map((r, i) => (
          <li key={r.n} className={cn("flex items-center gap-2 rounded-lg px-1.5 py-1", r.me && "bg-amber-50 ring-1 ring-amber-300")}>
            <span className="w-4 text-[12px] font-extrabold text-slate-500 tabular">{i + 1}</span>
            <span className="inline-flex size-7 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: r.c }} aria-hidden>
              {r.n[0]}
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-[12px] font-bold">{r.n}</span>
              <span className="block truncate text-[10px] text-slate-500">{r.s}</span>
            </span>
            <span className="font-display text-[12px] font-extrabold tabular">{r.p}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
