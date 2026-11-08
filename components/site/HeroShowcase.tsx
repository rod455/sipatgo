"use client";

import { useCallback, useState } from "react";
import { Award, BadgeCheck, Building2, Check, FileText, Gift, Home, Lock, Play, Sparkles, Timer, Trophy, Users } from "lucide-react";
import { HERO_DRIVERS, type HeroDriver } from "@/content/site/hero";
import { DEMO_CLIENT } from "@/content/site/demo-client";
import { cn } from "@/lib/utils";

const P = DEMO_CLIENT.primary;
const S = DEMO_CLIENT.secondary;

/**
 * O avanço é comandado pela própria barra do dia: quando ela termina de
 * encher (animationend), troca para o próximo. Assim barra e tela nunca
 * ficam fora de sincronia, e pausar (mouse em cima) pausa os dois juntos.
 */
function useRotation(count: number) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const next = useCallback(() => setI((v) => (v + 1) % count), [count]);
  return { i, setI, next, paused, setPaused };
}

/** Hero: verbo que troca + celular mostrando a semana avançar + cartão do RH. */
export function HeroRotator({ children }: { children: React.ReactNode }) {
  const { i, setI, next, paused, setPaused } = useRotation(HERO_DRIVERS.length);
  const d = HERO_DRIVERS[i];
  return (
    <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-8" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div>
        <h1 className="display-xl font-display text-[42px] font-extrabold leading-[1.04] text-sg-navy-900 sm:text-[56px] lg:text-[70px]">
          A SIPAT que todo mundo quer
          <br />
          <span className="relative inline-block text-sg-orange-500">
            <span key={d.key} className="sg-word-in inline-block">{d.verb}.</span>
            <svg key={`u-${d.key}`} aria-hidden viewBox="0 0 200 18" preserveAspectRatio="none" className="sg-underline absolute -bottom-2 left-0 h-3 w-full text-sg-yellow-400 md:-bottom-3 md:h-4">
              <path d="M3 12 C 50 3, 120 3, 197 9" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" pathLength={1} />
            </svg>
          </span>
        </h1>
        {children}
      </div>

      <div className="relative">
        <Week index={i} paused={paused} onDone={next} />
        <div className="relative mx-auto mt-5 flex max-w-[520px] justify-center">
          <div aria-hidden className="absolute inset-x-8 bottom-4 top-10 rotate-[-4deg] rounded-[48px] bg-sg-yellow-400 sm:inset-x-16" />
          <div aria-hidden className="absolute inset-x-12 bottom-0 top-16 rotate-[3deg] rounded-[48px] bg-sg-navy-900 sm:inset-x-20" />
          <Phone driver={d} />
          <RhCard driver={d} />
        </div>
        <div role="tablist" aria-label="O que engaja" className="mt-7 flex flex-wrap justify-center gap-2">
          {HERO_DRIVERS.map((x, k) => (
            <button
              key={x.key} role="tab" aria-selected={k === i} onClick={() => setI(k)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition",
                k === i ? "bg-sg-navy-900 text-white" : "bg-white text-sg-navy-700 ring-1 ring-sg-navy-900/10 hover:ring-sg-navy-900/30",
              )}
            >
              {x.tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Seg→Sex: a semana avança junto com os slides. */
function Week({ index, paused, onDone }: { index: number; paused: boolean; onDone: () => void }) {
  return (
    <ol className="mx-auto flex max-w-[460px] items-center gap-1.5" aria-label="Semana da campanha">
      {HERO_DRIVERS.map((x, k) => (
        <li key={x.key} className="flex-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-sg-navy-900/10">
            {k < index ? <div className="h-full w-full rounded-full bg-sg-orange-500" /> : null}
            {k === index ? (
              <div
                key={`f-${index}`}
                className="sg-fill h-full w-full rounded-full bg-sg-orange-500"
                style={{ animationPlayState: paused ? "paused" : "running" }}
                onAnimationEnd={onDone}
              />
            ) : null}
          </div>
          <p className={cn("mt-1.5 text-center text-[11px] font-bold uppercase tracking-wide", k <= index ? "text-sg-navy-900" : "text-sg-navy-900/35")}>{x.day}</p>
        </li>
      ))}
    </ol>
  );
}

function Phone({ driver }: { driver: HeroDriver }) {
  return (
    <div className="relative w-[250px] shrink-0 rounded-[38px] bg-sg-navy-900 p-2.5 shadow-[0_40px_80px_-30px_rgba(11,31,51,.7)] sm:w-[270px]">
      <div className="relative h-[500px] overflow-hidden rounded-[30px] bg-slate-50 sm:h-[530px]">
        <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-sg-navy-900" aria-hidden />
        <div key={driver.key} className="sg-screen-in h-full">
          <div className="px-4 pb-3 pt-9 text-white" style={{ background: P }}>
            <p className="text-[10px] font-semibold opacity-85">{DEMO_CLIENT.name} · SIPAT 2026</p>
            <p className="text-[14px] font-bold">{driver.day} · {driver.dayTheme}</p>
          </div>
          {driver.key === "jogar" && <ScreenPlay />}
          {driver.key === "disputar" && <ScreenRanking />}
          {driver.key === "ganhar" && <ScreenWheel />}
          {driver.key === "familia" && <ScreenFamily />}
          {driver.key === "reconhecer" && <ScreenCertificate />}
        </div>
      </div>
    </div>
  );
}

function ScreenPlay() {
  return (
    <div className="space-y-3 p-4">
      <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-slate-800">
        <span className="flex size-10 items-center justify-center rounded-full bg-white/90"><Play className="size-4 translate-x-px" style={{ color: P }} fill={P} /></span>
        <span className="absolute bottom-1.5 right-2 rounded bg-black/60 px-1.5 text-[9px] font-semibold text-white">1:30</span>
      </div>
      <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500"><span>Pergunta 2 de 5</span><span className="flex items-center gap-1"><Timer className="size-3" /> 0:12</span></div>
      <p className="rounded-xl bg-white p-3 text-[12px] font-bold leading-4 text-slate-900 shadow-sm">Antes de começar a tarefa, o que você confere primeiro?</p>
      {["Se o celular tem bateria", "Os riscos e o EPI certo", "Quem está de folga"].map((o, k) => (
        <div key={o} className={cn("rounded-xl border-2 px-3 py-2 text-[11px] font-bold", k === 1 ? "border-green-500 bg-green-50 text-green-800" : "border-slate-200 bg-white text-slate-700")}>
          {o} {k === 1 ? "✓" : ""}
        </div>
      ))}
      <p className="text-center text-[11px] font-extrabold text-green-700">+100 pts · +12 de bônus de tempo</p>
    </div>
  );
}

function ScreenRanking() {
  const rows: [string, number, boolean?][] = [["Manutenção", 94], ["Produção A", 88], ["Logística", 81, true], ["Qualidade", 72], ["Administrativo", 64]];
  return (
    <div className="p-4">
      <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-slate-200/70 p-1 text-center text-[10px] font-bold">
        <span className="rounded-lg py-1 text-slate-500">Individual</span><span className="rounded-lg bg-white py-1 text-slate-900 shadow-sm">Por setor</span>
      </div>
      <ul className="space-y-2">
        {rows.map(([n, v, me], k) => (
          <li key={n} className={cn("rounded-xl bg-white p-2.5 shadow-sm", me && "ring-2")} style={me ? { ["--tw-ring-color" as string]: P } : undefined}>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-900">
              <span className="flex items-center gap-1.5">{k === 0 ? <Trophy className="size-3.5 text-amber-500" /> : <span className="w-3.5 text-center text-slate-400">{k + 1}</span>}{n}{me ? <span className="rounded bg-slate-900 px-1 text-[8px] text-white">SEU</span> : null}</span>
              <span className="tabular-nums text-slate-500">{v}%</span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${v}%`, background: k === 0 ? "#F59E0B" : S }} /></div>
          </li>
        ))}
      </ul>
      <p className="mt-3 rounded-lg bg-amber-50 p-2 text-center text-[10px] font-bold text-amber-900">Faltam 7% de adesão para a Logística passar a Produção A</p>
    </div>
  );
}

function ScreenWheel() {
  const colors = [P, S, DEMO_CLIENT.accent, "#0F172A"];
  const n = 8;
  return (
    <div className="flex flex-col items-center p-4">
      <p className="text-[12px] font-extrabold text-slate-900">Dia de roleta! Concluiu, girou.</p>
      <div className="relative mt-3">
        <svg viewBox="-52 -52 104 104" className="sg-spin size-40">
          {Array.from({ length: n }).map((_, k) => {
            const a0 = (k / n) * Math.PI * 2, a1 = ((k + 1) / n) * Math.PI * 2;
            return <path key={k} d={`M0 0 L${50 * Math.cos(a0)} ${50 * Math.sin(a0)} A50 50 0 0 1 ${50 * Math.cos(a1)} ${50 * Math.sin(a1)} Z`} fill={colors[k % 4]} />;
          })}
          <circle r="9" fill="#fff" />
        </svg>
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 border-x-[7px] border-t-[12px] border-x-transparent border-t-slate-900" aria-hidden />
      </div>
      <div className="mt-4 w-full rounded-xl bg-white p-3 text-center shadow-sm">
        <Gift className="mx-auto size-5" style={{ color: P }} />
        <p className="mt-1 text-[13px] font-extrabold text-slate-900">Você ganhou: Garrafa térmica</p>
        <p className="mt-1 font-mono text-[11px] font-bold tracking-widest text-slate-500">RETIRADA · K7Q2</p>
      </div>
      <p className="mt-2 text-[10px] text-slate-500">O RH foi avisado. Retire até sexta.</p>
    </div>
  );
}

function ScreenFamily() {
  const grid = ["CAPACETE", "LUVAXRBO", "OCULOSTA", "PAUSAMEU", "RISCOIAX"];
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 rounded-xl bg-white p-2.5 shadow-sm">
        <span className="flex size-8 items-center justify-center rounded-full bg-amber-100"><Home className="size-4 text-amber-700" /></span>
        <div className="leading-tight"><p className="text-[11px] font-extrabold text-slate-900">Jogue com quem você ama</p><p className="text-[10px] text-slate-500">Caça-palavras da prevenção</p></div>
      </div>
      <div className="mt-3 grid grid-cols-8 gap-0.5 rounded-xl bg-white p-2 shadow-sm">
        {grid.join("").split("").map((ch, k) => {
          const row = Math.floor(k / 8);
          const hit = row === 0 || (row === 1 && k % 8 < 4) || (row === 3 && k % 8 < 5);
          return <span key={k} className={cn("flex aspect-square items-center justify-center rounded text-[10px] font-bold", hit ? "text-white" : "text-slate-600")} style={hit ? { background: row === 0 ? P : row === 1 ? S : "#F59E0B" } : undefined}>{ch}</span>;
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {["CAPACETE ✓", "LUVA ✓", "PAUSA ✓", "ÓCULOS", "RISCO"].map((w) => (
          <span key={w} className={cn("rounded-full px-2 py-0.5 text-[9px] font-bold", w.includes("✓") ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-600")}>{w}</span>
        ))}
      </div>
      <p className="mt-3 flex items-center justify-center gap-1 text-[10px] font-semibold text-slate-600"><Users className="size-3.5" /> Jogado com a Lara, 9 anos</p>
    </div>
  );
}

function ScreenCertificate() {
  return (
    <div className="p-4">
      <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-3 text-center">
        <Award className="mx-auto size-7" style={{ color: P }} />
        <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-slate-500">Certificado</p>
        <p className="text-[13px] font-extrabold text-slate-900">Ana Souza</p>
        <p className="text-[10px] leading-3 text-slate-500">concluiu a SIPAT 2026 · 5 de 5 dias</p>
        <p className="mt-1.5 font-mono text-[9px] text-slate-400">verificar: SG-4F9K-21</p>
      </div>
      <p className="mt-3 text-[11px] font-extrabold text-slate-900">Selos da semana</p>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {[Sparkles, BadgeCheck, Trophy, Lock].map((I, k) => (
          <span key={k} className={cn("flex aspect-square items-center justify-center rounded-xl", k < 3 ? "text-white" : "bg-slate-200 text-slate-400")} style={k < 3 ? { background: [P, S, "#F59E0B"][k] } : undefined}><I className="size-5" /></span>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-green-50 p-2.5 text-[10px] font-bold text-green-800">
        <Check className="size-4 shrink-0" strokeWidth={3} /> 4 dias no prazo + 1 recuperado
      </div>
    </div>
  );
}

const RH_ICON = { jogar: Users, disputar: Building2, ganhar: Gift, familia: Home, reconhecer: FileText } as const;

/** O lado da empresa: o que o RH/CIPA vê no painel. */
function RhCard({ driver }: { driver: HeroDriver }) {
  const Icon = RH_ICON[driver.key];
  return (
    <div className="absolute -bottom-4 -right-1 w-[200px] sm:bottom-8 sm:right-[-12px] sm:w-[220px] xl:right-[-70px]">
      <div key={driver.key} className="sg-screen-in rounded-2xl bg-white p-4 shadow-[0_24px_50px_-20px_rgba(11,31,51,.55)] ring-1 ring-sg-navy-900/5">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-sg-orange-500"><Icon className="size-3.5" /> Painel do RH</p>
        <p className="mt-2 font-display text-[30px] font-extrabold leading-none text-sg-navy-900 tabular-nums">{driver.rh.value}</p>
        <p className="mt-1 text-[12px] font-bold leading-4 text-sg-navy-900">{driver.rh.label}</p>
        <p className="text-[11px] text-sg-gray-600">{driver.rh.note}</p>
      </div>
    </div>
  );
}
