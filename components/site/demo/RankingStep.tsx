"use client";

import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEMO_RANKING } from "./config";

/** Passo 4: ranking com personagens fictícios + o jogador. */
export function RankingStep({ playerName, points }: { playerName: string; points: number }) {
  const rows = [...DEMO_RANKING.map((p) => ({ ...p, me: false })), { name: playerName, sector: "Visitante", points, color: "#FF6A13", me: true }].sort(
    (a, b) => b.points - a.points || (a.me ? -1 : 1),
  );
  const pos = rows.findIndex((r) => r.me) + 1;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="font-display text-2xl font-extrabold text-sg-navy-900">Ranking do dia</h2>
        <span className="flex items-center gap-1 text-xs font-bold text-red-700">
          <span className="size-2 animate-pulse rounded-full bg-red-600" aria-hidden /> AO VIVO
        </span>
      </div>
      <p className="mt-1 text-sg-gray-600" aria-live="polite">
        Você fez <b className="text-sg-navy-900 tabular">{points} pontos</b> e ficou em <b className="text-sg-navy-900">{pos}º de {rows.length}</b>.
        {pos === 1 ? " Liderando! 🏆" : pos <= 3 ? " Pódio! 🥉" : " Amanhã tem mais."}
      </p>
      <ol className="mt-5 space-y-2">
        {rows.map((r, i) => (
          <li
            key={`${r.name}-${r.sector}`}
            className={cn(
              "flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 shadow-sm ring-1 ring-sg-navy-900/5",
              r.me && "animate-pop bg-[#FFF8E1] ring-2 ring-sg-yellow-400",
            )}
          >
            <span className="w-6 text-center font-display font-extrabold text-sg-gray-600 tabular">
              {i < 3 ? <Trophy aria-label={`${i + 1}º lugar`} className={cn("mx-auto size-5", i === 0 ? "text-sg-yellow-400" : i === 1 ? "text-slate-400" : "text-amber-700")} /> : i + 1}
            </span>
            <span className="inline-flex size-9 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: r.color }} aria-hidden>
              {r.name[0]?.toUpperCase()}
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate font-semibold text-sg-navy-900">
                {r.name}
                {r.me ? " (você)" : ""}
              </span>
              <span className="block truncate text-xs text-sg-gray-600">{r.sector}</span>
            </span>
            <span className="font-display text-lg font-extrabold text-sg-navy-900 tabular">{r.points}</span>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs text-sg-gray-600">Personagens fictícios. Na campanha real, o ranking mostra todos os participantes e também o ranking por setor.</p>
    </div>
  );
}
