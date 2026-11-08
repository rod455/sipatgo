"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { api } from "@/components/ui/fetcher";
import { Button } from "@/components/ui";
import { matchSelection } from "@/lib/wordsearch";
import type { FamilyGameView } from "@/lib/family";
import { cn } from "@/lib/utils";

export function FamilyGame({ game }: { game: FamilyGameView }) {
  const router = useRouter();
  const [done, setDone] = useState(game.done);
  const [badges, setBadges] = useState<string[]>([]);
  async function finish() {
    confetti({ particleCount: 140, spread: 90 });
    if (done) return;
    setDone(true);
    try { const r = await api<{ new_badges: string[] }>("/api/family/complete", { game_id: game.id }); setBadges(r.new_badges); router.refresh(); } catch { /* ok */ }
  }
  return (
    <div className="space-y-3">
      <h2 className="font-display text-xl font-bold">{game.title}</h2>
      {game.type === "word_search" ? <WordSearch game={game} onWin={finish} /> : <LightQuiz game={game} onWin={finish} />}
      {done && <p className="rounded-xl bg-green-50 p-3 text-center text-sm font-semibold text-green-800">Game concluído! 🎉{badges.length ? " Novo selo desbloqueado!" : ""}</p>}
    </div>
  );
}

function WordSearch({ game, onWin }: { game: Extract<FamilyGameView, { type: "word_search" }>; onWin: () => void }) {
  const ws = game.puzzle;
  const [start, setStart] = useState<[number, number] | null>(null);
  const [found, setFound] = useState<string[]>([]);
  const [bad, setBad] = useState<[number, number] | null>(null);
  const cells = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of ws.placements) if (found.includes(p.word))
      for (let i = 0; i < p.word.length; i++) m.set(`${p.row + p.dr * i},${p.col + p.dc * i}`, p.word);
    return m;
  }, [found, ws.placements]);

  function tap(r: number, c: number) {
    if (!start) { setStart([r, c]); return; }
    const w = matchSelection(ws, start, [r, c]);
    if (w && !found.includes(w)) {
      const next = [...found, w];
      setFound(next);
      if (next.length === ws.words.length) onWin();
    } else if (!w) { setBad([r, c]); setTimeout(() => setBad(null), 400); }
    setStart(null);
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-brand-muted">Toque na primeira e na última letra de cada palavra.</p>
      <div className="grid gap-1 rounded-2xl bg-white p-2 shadow ring-1 ring-brand-100" style={{ gridTemplateColumns: `repeat(${ws.size}, minmax(0, 1fr))` }}>
        {ws.grid.map((row, r) => row.map((ch, c) => (
          <button key={`${r}-${c}`} onClick={() => tap(r, c)}
            className={cn("aspect-square rounded-md text-sm font-bold sm:text-base",
              cells.has(`${r},${c}`) ? "bg-green-500 text-white" : "bg-brand-50 text-brand-ink",
              start?.[0] === r && start?.[1] === c && "bg-brand text-brand-fg",
              bad?.[0] === r && bad?.[1] === c && "animate-shake bg-red-200")}>
            {ch}
          </button>
        )))}
      </div>
      <div className="flex flex-wrap gap-2">
        {ws.words.map((w) => <span key={w} className={cn("rounded-full px-3 py-1 text-xs font-bold", found.includes(w) ? "bg-green-100 text-green-800 line-through" : "bg-brand-50 text-brand-ink")}>{w}</span>)}
      </div>
    </div>
  );
}

function LightQuiz({ game, onWin }: { game: Extract<FamilyGameView, { type: "light_quiz" }>; onWin: () => void }) {
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const item = game.items[i];
  if (!item) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center shadow ring-1 ring-brand-100">
        <p className="font-display text-3xl font-extrabold">{score}/{game.items.length}</p>
        <p className="text-brand-muted">acertos em família!</p>
        <Button className="mt-4" variant="outline" onClick={() => { setI(0); setScore(0); setPick(null); }}>Jogar de novo</Button>
      </div>
    );
  }
  const answered = pick !== null;
  return (
    <div className="space-y-3">
      <p className="text-sm text-brand-muted">Pergunta {i + 1} de {game.items.length}</p>
      <p className="rounded-2xl bg-white p-4 font-display text-lg font-bold shadow-sm ring-1 ring-brand-100">{item.question}</p>
      {item.options.map((o, k) => (
        <button key={k} disabled={answered} onClick={() => { setPick(k); if (k === item.correct_index) setScore((s) => s + 1); }}
          className={cn("w-full rounded-xl border-2 bg-white p-3 text-left font-semibold",
            answered && k === item.correct_index && "border-green-500 bg-green-50",
            answered && pick === k && k !== item.correct_index && "border-red-500 bg-red-50",
            !answered && "border-brand-100")}>
          {o}
        </button>
      ))}
      {answered && <Button className="w-full" onClick={() => { const n = i + 1; setPick(null); setI(n); if (n >= game.items.length) onWin(); }}>{i + 1 >= game.items.length ? "Ver resultado" : "Próxima"}</Button>}
    </div>
  );
}
