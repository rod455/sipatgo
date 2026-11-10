"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import { api } from "@/components/ui/fetcher";
import { Button } from "@/components/ui";
import { WHEEL_SLOTS, isWinSlot } from "@/lib/wheel";

const SLICE = 360 / WHEEL_SLOTS;

type SpinResponse = { slot: number; won: boolean; code: string | null };

/** Roleta: casas pares com brinde 🎁, ímpares "quase!". O resultado vem do servidor; aqui só animamos. */
export function Wheel({ day, onDone, demo }: { day: number; onDone?: (code: string | null) => void; demo?: boolean }) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<SpinResponse | null>(null);
  const [err, setErr] = useState("");

  async function spin() {
    if (spinning || result) return;
    setSpinning(true); setErr("");
    try {
      let r: SpinResponse;
      if (demo) {
        const won = Math.random() < 0.5;
        const pool = Array.from({ length: WHEEL_SLOTS }, (_, i) => i).filter((i) => isWinSlot(i) === won);
        r = { slot: pool[Math.floor(Math.random() * pool.length)], won, code: won ? "DEMO-2026" : null };
      } else {
        r = await api<SpinResponse>("/api/game/spin", { day });
      }
      // para em um ponto aleatório dentro da casa (não sempre no centro)
      const jitter = (Math.random() - 0.5) * SLICE * 0.6;
      const target = 360 * 6 + (360 - (r.slot * SLICE + SLICE / 2 + jitter));
      setRotation(target);
      setTimeout(() => {
        setResult(r);
        setSpinning(false);
        if (r.won) confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 } });
        onDone?.(r.code);
      }, 5200);
    } catch (e) {
      setErr((e as Error).message);
      setSpinning(false);
    }
  }

  const colors = ["var(--brand-primary)", "var(--brand-accent)", "var(--brand-secondary)", "#ffffff"];
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative h-72 w-72 sm:h-80 sm:w-80">
        <div className="absolute left-1/2 top-[-6px] z-10 -translate-x-1/2 border-x-[14px] border-t-[26px] border-x-transparent border-t-slate-900 drop-shadow" />
        <svg viewBox="-110 -110 220 220" className="h-full w-full drop-shadow-xl"
          style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? "transform 5s cubic-bezier(.17,.67,.2,1)" : "none" }}>
          <circle r="108" fill="#0f172a" />
          {Array.from({ length: WHEEL_SLOTS }, (_, i) => {
            const a0 = ((i * SLICE - 90) * Math.PI) / 180;
            const a1 = (((i + 1) * SLICE - 90) * Math.PI) / 180;
            const am = (((i + 0.5) * SLICE - 90) * Math.PI) / 180;
            const win = isWinSlot(i);
            const fill = win ? colors[(i / 2) % 3] : "#ffffff";
            return (
              <g key={i}>
                <path d={`M0 0 L ${100 * Math.cos(a0)} ${100 * Math.sin(a0)} A 100 100 0 0 1 ${100 * Math.cos(a1)} ${100 * Math.sin(a1)} Z`} fill={fill} stroke="#0f172a" strokeWidth="1.5" />
                {win ? (
                  <text x={64 * Math.cos(am)} y={64 * Math.sin(am)} textAnchor="middle" dominantBaseline="middle" fontSize="22"
                    transform={`rotate(${(i + 0.5) * SLICE} ${64 * Math.cos(am)} ${64 * Math.sin(am)})`}>🎁</text>
                ) : (
                  <text x={62 * Math.cos(am)} y={62 * Math.sin(am)} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="800"
                    fill="#0f172a" transform={`rotate(${(i + 0.5) * SLICE + 90} ${62 * Math.cos(am)} ${62 * Math.sin(am)})`}>QUASE!</text>
                )}
              </g>
            );
          })}
          <circle r="14" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
        </svg>
      </div>

      {!result ? (
        <Button variant="accent" size="lg" className="w-full max-w-xs text-lg" onClick={spin} disabled={spinning}>
          {spinning ? "Girando..." : "Girar a roleta!"}
        </Button>
      ) : result.won ? (
        <div className="animate-pop w-full rounded-2xl bg-white p-5 text-center shadow-lg ring-2 ring-brand-accent">
          <p className="font-display text-2xl font-extrabold">Você ganhou um brinde! 🎉</p>
          <p className="mt-2 text-sm text-brand-muted">Retire no RH apresentando este código:</p>
          <p className="mt-2 font-display text-3xl font-extrabold tracking-widest tabular text-brand-ink">{result.code}</p>
          <p className="mt-2 text-xs text-brand-muted">O código também fica salvo no seu perfil.</p>
        </div>
      ) : (
        <div className="animate-pop w-full rounded-2xl bg-white p-5 text-center shadow-lg ring-1 ring-brand-100">
          <p className="font-display text-2xl font-extrabold">Quase! Não foi dessa vez 😅</p>
          <p className="mt-2 text-sm text-brand-muted">Seus pontos do dia estão garantidos. Tem mais roleta nos próximos dias: continue jogando!</p>
        </div>
      )}
      {err && <p className="text-sm text-red-600">{err}</p>}
    </div>
  );
}
