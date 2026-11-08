"use client";

import { useEffect, useState } from "react";
import { Check, HardHat, HeartPulse, Pickaxe, Tractor, Trophy, Truck } from "lucide-react";
import type { HeroSlide } from "@/content/site/hero";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof HardHat> = {
  industria: HardHat, rural: Tractor, mineracao: Pickaxe, transporte: Truck, escritorio: HeartPulse,
};
const INTERVAL = 3600;

export type ShowcaseSlide = HeroSlide & { scene?: string; person?: string };

function useRotation(count: number) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || count < 2) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setI((v) => (v + 1) % count), INTERVAL);
    return () => window.clearInterval(t);
  }, [paused, count]);
  return { i, setI, setPaused };
}

/** Título com a palavra em destaque que troca a cada slide. */
export function HeroWord({ slides, index }: { slides: HeroSlide[]; index: number }) {
  const s = slides[index];
  return (
    <span className="relative my-1 inline-flex align-middle">
      <span
        key={s.key}
        className="sg-word-in inline-block whitespace-nowrap rounded-[0.42em] bg-gradient-to-r from-sg-yellow-400 to-[#FFB13B] px-[0.28em] pb-[0.06em] text-sg-navy-900 shadow-[0_18px_40px_-20px_rgba(255,160,40,.9)]"
      >
        {s.word}
      </span>
    </span>
  );
}

/** Hero completo: título com palavra rotativa + vitrine com foto e cartões do painel. */
export function HeroRotator({ slides, children }: { slides: ShowcaseSlide[]; children: React.ReactNode }) {
  const { i, setI, setPaused } = useRotation(slides.length);
  return (
    <div
      className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div>
        <h1 className="display-xl font-display text-[42px] font-extrabold leading-[1.08] text-sg-navy-900 sm:text-[56px] lg:text-[68px]">
          A <HeroWord slides={slides} index={i} />
          <br />
          que todo mundo quer jogar.
        </h1>
        {children}
      </div>
      <div>
        <Showcase slides={slides} index={i} />
        <div className="mt-6 flex items-center justify-center gap-2" role="tablist" aria-label="Segmentos">
          {slides.map((s, k) => (
            <button
              key={s.key}
              role="tab"
              aria-selected={k === i}
              aria-label={`${s.word} · ${s.segment}`}
              onClick={() => setI(k)}
              className={cn("h-2 rounded-full transition-all", k === i ? "w-8 bg-sg-orange-500" : "w-2 bg-sg-navy-900/20 hover:bg-sg-navy-900/40")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Showcase({ slides, index }: { slides: ShowcaseSlide[]; index: number }) {
  const s = slides[index];
  return (
    <div className="relative mx-auto w-full max-w-[560px] pt-10">
      {/* moldura */}
      <div className="relative aspect-[5/4] w-full">
        <div className="absolute inset-0 overflow-hidden rounded-[40px] bg-sg-navy-900 ring-1 ring-sg-navy-900/10">
          {slides.map((sl, k) => {
            const Icon = ICONS[sl.key] ?? HardHat;
            return (
              <div key={sl.key} aria-hidden={k !== index} className={cn("absolute inset-0 transition-opacity duration-700", k === index ? "opacity-100" : "opacity-0")}>
                {sl.scene ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sl.scene} alt="" className="h-full w-full object-cover grayscale contrast-[1.05]" loading={k === 0 ? "eager" : "lazy"} />
                ) : (
                  <div className="relative h-full w-full bg-[radial-gradient(circle_at_70%_20%,#1F5A8C_0%,#0B1F33_62%)]">
                    <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,.09)_1px,transparent_1px)] [background-size:18px_18px]" />
                    <Icon aria-hidden className="absolute bottom-[-8%] right-[6%] size-[62%] text-white/[0.07]" strokeWidth={1.2} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* pessoa recortada, saindo da moldura */}
        {slides.map((sl, k) =>
          sl.person ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={sl.key}
              src={sl.person}
              alt=""
              aria-hidden
              className={cn(
                "pointer-events-none absolute bottom-0 left-1/2 h-[118%] w-auto max-w-none -translate-x-1/2 object-contain transition-all duration-700",
                k === index ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
              )}
            />
          ) : null,
        )}

        {/* cartões do painel (exemplo) */}
        <div className="absolute -left-3 top-[8%] w-[46%] space-y-3 sm:-left-10 sm:w-[40%]">
          <StatCard value={`${s.adesao}%`} title="Adesão" text="jogaram ao menos 1 dia" />
          <StatCard value="5/5" title="Dias concluídos" text="com recuperação até sexta" className="hidden sm:block" />
          <StatCard value="QR" title="Check-in presencial" text="nas palestras da CIPA" className="hidden sm:block" />
        </div>
        <div className="absolute -right-8 top-[4%] hidden w-[48%] sm:block">
          <div className="rounded-2xl bg-sg-navy-900 p-4 text-white shadow-[0_24px_50px_-20px_rgba(11,31,51,.7)] ring-1 ring-white/10">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-sg-yellow-400">
              <Trophy aria-hidden className="size-3.5" /> Ranking por setor
            </div>
            {[
              [s.setor, 96],
              ["Logística", 81],
              ["Administrativo", 64],
            ].map(([n, v], k) => (
              <div key={String(n)} className="mt-2.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{k + 1}º {n}</span>
                  <span className="tabular-nums text-white/70">{Number(v) * 12} pts</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-sg-yellow-400 transition-all duration-700" style={{ width: `${v}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute -right-2 bottom-[6%] w-[64%] sm:-right-12 sm:bottom-[12%] sm:w-[56%]">
          <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-sg-orange-500 to-[#FF8A3D] p-3 pr-4 text-white shadow-[0_24px_50px_-20px_rgba(255,106,19,.8)]">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-sg-green-500">
              <Check aria-hidden className="size-5" strokeWidth={3.5} />
            </span>
            <div className="min-w-0">
              <p className="font-display text-sm font-extrabold leading-tight sm:text-base">Meta de adesão atingida</p>
              <p className="truncate text-[11px] text-white/85">Hoje: {s.dia}</p>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-sg-gray-600">Exemplo do painel · {s.segment}</p>
    </div>
  );
}

function StatCard({ value, title, text, className }: { value: string; title: string; text: string; className?: string }) {
  return (
    <div className={cn("rounded-2xl bg-white/95 p-3.5 shadow-[0_20px_40px_-22px_rgba(11,31,51,.55)] ring-1 ring-sg-navy-900/5 backdrop-blur", className)}>
      <p className="font-display text-2xl font-extrabold leading-none text-sg-navy-900 tabular-nums sm:text-[28px]">{value}</p>
      <p className="mt-1.5 text-sm font-bold text-sg-navy-900">{title}</p>
      <p className="text-xs text-sg-gray-600">{text}</p>
    </div>
  );
}
