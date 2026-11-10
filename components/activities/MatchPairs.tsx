"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ActivityView, SubmitResult } from "@/lib/game";
import { cn } from "@/lib/utils";
import { BonusBar, Progress } from "./Shared";
import { useActivity, useCountdown } from "./useActivity";

/** Cores dos pares já ligados (um par = uma cor + número + linha). */
const PAIR_COLORS = ["#16a34a", "#2563eb", "#d97706", "#9333ea", "#db2777", "#0891b2"];

type Line = { x1: number; y1: number; x2: number; y2: number; color: string };

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

  // ordem em que os pares foram acertados → cor e número de cada par
  const pairNo: Record<number, number> = {}; // índice esquerda → nº do par (0..)
  Object.values(rightMatched).forEach((l, k) => { pairNo[l] = k; });
  const leftToRight: Record<number, number> = {};
  for (const [pos, l] of Object.entries(rightMatched)) leftToRight[l] = Number(pos);

  // linhas ligando o par: medidas reais dos cartões, recalculadas ao redimensionar
  const box = useRef<HTMLDivElement>(null);
  const leftRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rightRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const measure = useCallback(() => {
    const host = box.current?.getBoundingClientRect();
    if (!host) return;
    const out: Line[] = [];
    for (const [pos, l] of Object.entries(rightMatched)) {
      const a = leftRefs.current[l]?.getBoundingClientRect();
      const b = rightRefs.current[Number(pos)]?.getBoundingClientRect();
      if (!a || !b) continue;
      out.push({
        x1: a.right - host.left, y1: a.top + a.height / 2 - host.top,
        x2: b.left - host.left, y2: b.top + b.height / 2 - host.top,
        color: PAIR_COLORS[(pairNo[l] ?? 0) % PAIR_COLORS.length],
      });
    }
    setLines(out);
  }, [rightMatched]); // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => { measure(); }, [measure]);
  useEffect(() => {
    if (!box.current || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(box.current);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <div className="space-y-4">
      <Progress done={correct.size} total={view.total} points={points} />
      {!done && <BonusBar left={bonus.left} total={view.bonus_window_s} makeup={view.is_makeup} label="Bônus do próximo par" />}
      <p className="text-sm text-brand-muted">Toque em um item da esquerda e depois no par correspondente da direita.</p>
      <div ref={box} className="relative grid grid-cols-2 gap-x-8 sm:gap-x-12">
        <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible" aria-hidden>
          {lines.map((ln, k) => {
            const mx = (ln.x1 + ln.x2) / 2;
            return (
              <g key={k}>
                <path d={`M ${ln.x1} ${ln.y1} C ${mx} ${ln.y1}, ${mx} ${ln.y2}, ${ln.x2} ${ln.y2}`} fill="none" stroke={ln.color} strokeWidth="3" strokeLinecap="round" pathLength={1} className="sg-draw-line" />
                <circle cx={ln.x1} cy={ln.y1} r="4.5" fill={ln.color} />
                <circle cx={ln.x2} cy={ln.y2} r="4.5" fill={ln.color} />
              </g>
            );
          })}
        </svg>
        <div className="space-y-2">
          {pub.left.map((t, i) => {
            const ok = correct.has(i);
            const color = ok ? PAIR_COLORS[(pairNo[i] ?? 0) % PAIR_COLORS.length] : undefined;
            return (
              <button key={i} ref={(el) => { leftRefs.current[i] = el; }} disabled={ok || busy} onClick={() => setLeft(i)}
                style={ok ? { borderColor: color, backgroundColor: `${color}12` } : undefined}
                className={cn("flex min-h-16 w-full items-center gap-2 rounded-xl border-2 bg-white p-3 text-left text-sm font-semibold shadow-sm transition",
                  ok && "text-brand-ink",
                  !ok && left === i && "border-brand bg-brand/10",
                  !ok && left !== i && "border-brand-100",
                  flash?.l === i && "animate-shake border-red-500 bg-red-50")}>
                {ok && <PairBadge n={(pairNo[i] ?? 0) + 1} color={color!} />}{t}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {pub.right.map((t, pos) => {
            const ok = rightUsed(pos);
            const color = ok ? PAIR_COLORS[(pairNo[rightMatched[pos]] ?? 0) % PAIR_COLORS.length] : undefined;
            return (
              <button key={pos} ref={(el) => { rightRefs.current[pos] = el; }} disabled={ok || busy || left === null} onClick={() => pickRight(pos)}
                style={ok ? { borderColor: color, backgroundColor: `${color}12` } : undefined}
                className={cn("flex min-h-16 w-full items-center gap-2 rounded-xl border-2 bg-white p-3 text-left text-sm font-semibold shadow-sm transition",
                  ok && "text-brand-ink",
                  !ok && left !== null && "border-brand-200 hover:border-brand",
                  !ok && left === null && "border-brand-100 opacity-80",
                  flash?.r === pos && "animate-shake border-red-500 bg-red-50")}>
                {ok && <PairBadge n={(pairNo[rightMatched[pos]] ?? 0) + 1} color={color!} />}{t}
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

function PairBadge({ n, color }: { n: number; color: string }) {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white" style={{ backgroundColor: color }} aria-label={`Par ${n}`}>
      {n}
    </span>
  );
}
