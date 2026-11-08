"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/components/ui/fetcher";
import type { ActivityView, SubmitResult } from "@/lib/game";
import type { Answer } from "@/lib/activities";

export type Feedback = { result: SubmitResult; itemIndex: number } | null;

export function useActivity(day: number, view: ActivityView, onDayComplete: (badges: string[]) => void) {
  const [correct, setCorrect] = useState(() => new Map(view.correct.map((c) => [c.item_index, c])));
  const [points, setPoints] = useState(view.points);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const completeRef = useRef(onDayComplete);
  completeRef.current = onDayComplete;

  const start = useCallback(async () => {
    setStartedAt(Date.now());
    try { await api("/api/game/item-start", { day }); } catch (e) { setError((e as Error).message); }
  }, [day]);

  const submit = useCallback(async (itemIndex: number, answer: Answer): Promise<SubmitResult | null> => {
    setBusy(true); setError("");
    try {
      const r = await api<SubmitResult>("/api/game/item-submit", { day, item_index: itemIndex, answer });
      if (r.status === "correct") {
        setCorrect((m) => new Map(m).set(r.item_index, { item_index: r.item_index, explanation: r.explanation ?? "", label: r.label, hotspot: r.hotspot }));
      }
      setPoints((p) => p + r.points + r.bonus);
      setStartedAt(Date.now());
      if (r.day_completed) setTimeout(() => completeRef.current(r.new_badges), 1600);
      return r;
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally {
      setBusy(false);
    }
  }, [day]);

  return { correct, points, busy, error, submit, start, startedAt };
}

/** Contagem regressiva em segundos desde `since` (re-renderiza a cada 100ms). */
export function useCountdown(since: number, seconds: number, running: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, [running]);
  const elapsed = Math.max(0, (now - since) / 1000);
  return { elapsed, left: Math.max(0, seconds - elapsed) };
}
