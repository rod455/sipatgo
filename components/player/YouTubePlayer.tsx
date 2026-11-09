"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/components/ui/fetcher";

declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement, opts: unknown) => YTPlayer; PlayerState: { ENDED: number; PLAYING: number } };
    onYouTubeIframeAPIReady?: () => void;
  }
}
type YTPlayer = { getCurrentTime(): number; getDuration(): number; destroy(): void };

let apiPromise: Promise<void> | null = null;
function loadApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(); };
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    });
  }
  return apiPromise;
}

/**
 * Player 16:9 sem sugestões. Conta só o tempo assistido de forma contínua
 * (adiantar a barra não conta). Libera a dinâmica com ≥ 90%.
 */
export function YouTubePlayer({ videoId, day, alreadyDone, onCompleted, start, end }: {
  videoId: string; day: number; alreadyDone: boolean; onCompleted: (points: number) => void;
  /** Trecho em segundos (opcional). Sem trecho, vale o vídeo inteiro. */
  start?: number | null; end?: number | null;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(alreadyDone ? 1 : 0);
  const [err, setErr] = useState("");
  const state = useRef({ started: false, completed: alreadyDone, watched: 0, last: 0 });

  useEffect(() => {
    let player: YTPlayer | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    const complete = async (ratio: number) => {
      if (state.current.completed) return;
      state.current.completed = true;
      try {
        const r = await api<{ points: number }>("/api/game/video-complete", { day, watched_pct: Math.min(1, ratio) });
        onCompleted(r.points ?? 0);
      } catch (e) {
        state.current.completed = false;
        setErr((e as Error).message);
      }
    };

    const from = start && start > 0 ? start : 0;
    // duração que conta: o trecho, se houver; senão o vídeo inteiro
    const span = (p: YTPlayer) => {
      const total = p.getDuration();
      const to = end && end > from ? Math.min(end, total || end) : total;
      return to - from;
    };

    loadApi().then(() => {
      if (cancelled || !host.current || !window.YT) return;
      const el = document.createElement("div");
      host.current.appendChild(el);
      player = new window.YT.Player(el, {
        videoId,
        width: "100%", height: "100%",
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1, iv_load_policy: 3, ...(from ? { start: from } : {}), ...(end && end > from ? { end } : {}) },
        events: {
          onStateChange: (ev: { data: number }) => {
            const YT = window.YT!;
            if (ev.data === YT.PlayerState.PLAYING && !state.current.started) {
              state.current.started = true;
              state.current.last = player!.getCurrentTime();
              void api("/api/game/video-start", { day }).catch(() => {});
            }
            if (ev.data === YT.PlayerState.ENDED) {
              const d = span(player!);
              const ratio = d > 0 ? state.current.watched / d : 0;
              setPct(ratio);
              if (ratio >= 0.9) void complete(ratio);
              else setErr("Parece que algumas partes foram puladas. Volte e assista o vídeo completo.");
            }
          },
        },
      });
      timer = setInterval(() => {
        if (!player || !state.current.started) return;
        const t = player.getCurrentTime();
        const delta = t - state.current.last;
        const inClip = t >= from - 1 && (!end || t <= end + 1);
        if (delta > 0 && delta < 2.5 && inClip) state.current.watched += delta;
        state.current.last = t;
        const d = span(player);
        if (d > 0) {
          const ratio = Math.min(1, state.current.watched / d);
          setPct((p) => Math.max(p, ratio));
          if (ratio >= 0.9 && !state.current.completed) void complete(ratio);
        }
      }, 1000);
    });
    return () => { cancelled = true; if (timer) clearInterval(timer); player?.destroy(); };
  }, [videoId, day, onCompleted, start, end]);

  return (
    <div className="space-y-2">
      <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow [&_iframe]:h-full [&_iframe]:w-full" ref={host} />
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${Math.round(pct * 100)}%` }} />
      </div>
      <p className="text-xs text-slate-500">{pct >= 0.9 ? "Vídeo concluído ✔" : `Assistido: ${Math.round(pct * 100)}% (mínimo 90%)`}</p>
      {err && <p className="text-sm text-red-600">{err}</p>}
    </div>
  );
}
