"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { api } from "@/components/ui/fetcher";
import { Logo } from "@/components/site/Logo";

declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement, opts: unknown) => YTPlayer; PlayerState: { ENDED: number; PLAYING: number } };
    onYouTubeIframeAPIReady?: () => void;
  }
}
type YTPlayer = {
  getCurrentTime(): number; getDuration(): number; destroy(): void;
  playVideo(): void; pauseVideo(): void; seekTo(s: number, allowSeekAhead: boolean): void; mute(): void; unMute(): void;
};

/** Um trecho do vídeo, em segundos. `end` nulo = até o fim do vídeo. */
export type VideoSegment = { start: number; end: number | null };

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

const INTRO_MS = 2600;
const TICK_MS = 250;

/**
 * Player 16:9 com abertura SipatGo e trechos em sequência (ex.: 3 cortes de um TEDx).
 * Conta só o tempo assistido dentro dos trechos, em avanço natural (até 2x);
 * arrastar a barra não conta. Libera os pontos do vídeo com ≥ 90%.
 */
export function YouTubePlayer({ videoId, day, alreadyDone, onCompleted, segments }: {
  videoId: string; day: number; alreadyDone: boolean; onCompleted: (points: number) => void;
  segments?: VideoSegment[] | null;
}) {
  const host = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<"cover" | "intro" | "playing">("cover");
  const [pct, setPct] = useState(alreadyDone ? 1 : 0);
  const [err, setErr] = useState("");
  const segs: VideoSegment[] = segments && segments.length ? segments : [{ start: 0, end: null }];
  const segKey = JSON.stringify(segs);
  const state = useRef({ started: false, completed: alreadyDone, watched: 0, last: 0, wall: 0, retryAt: 0, idx: 0, intro: false, finished: false });

  useEffect(() => {
    let player: YTPlayer | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;
    const list: VideoSegment[] = JSON.parse(segKey);

    const complete = async (ratio: number) => {
      if (state.current.completed) return;
      state.current.completed = true;
      try {
        const r = await api<{ points: number }>("/api/game/video-complete", { day, watched_pct: Math.min(1, ratio) });
        setErr("");
        onCompleted(r.points ?? 0);
      } catch (e) {
        state.current.completed = false;
        setErr((e as Error).message);
      }
    };

    const endOf = (s: VideoSegment, p: YTPlayer) => (s.end && s.end > s.start ? s.end : p.getDuration() || 0);
    const span = (p: YTPlayer) => list.reduce((sum, s) => sum + Math.max(0, endOf(s, p) - s.start), 0);
    const ratioNow = (p: YTPlayer) => { const d = span(p); return d > 0 ? Math.min(1, state.current.watched / d) : 0; };

    const finish = (p: YTPlayer) => {
      state.current.finished = true;
      p.pauseVideo();
      const ratio = ratioNow(p);
      setPct((x) => Math.max(x, ratio));
      if (ratio >= 0.9) void complete(ratio);
      else if (!state.current.completed) setErr("Parece que algumas partes foram puladas. Volte e assista o vídeo completo.");
    };

    loadApi().then(() => {
      if (cancelled || !host.current || !window.YT) return;
      const el = document.createElement("div");
      host.current.appendChild(el);
      player = new window.YT.Player(el, {
        videoId,
        width: "100%", height: "100%",
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1, iv_load_policy: 3, start: Math.floor(list[0].start) },
        events: {
          onReady: () => { playerRef.current = player; setReady(true); },
          onStateChange: (ev: { data: number }) => {
            const YT = window.YT!;
            if (ev.data === YT.PlayerState.PLAYING && !state.current.started) {
              state.current.started = true;
              state.current.last = player!.getCurrentTime();
              state.current.wall = Date.now();
              void api("/api/game/video-start", { day }).catch(() => {});
            }
            if (ev.data === YT.PlayerState.ENDED && !state.current.finished) finish(player!);
          },
        },
      });
      timer = setInterval(() => {
        const p = player;
        if (!p || !state.current.started || state.current.intro) return;
        const t = p.getCurrentTime();
        const now = Date.now();
        const wallDelta = (now - state.current.wall) / 1000;
        const seg = list[state.current.idx];
        const segEnd = endOf(seg, p);

        // fim do trecho atual: pula para o próximo ou encerra
        if (!state.current.finished && segEnd > 0 && t >= segEnd - 0.15) {
          // conta o pedacinho final até o corte
          const tail = Math.min(segEnd, t) - state.current.last;
          if (tail > 0 && tail <= Math.max(1, wallDelta * 2.2 + 0.5)) state.current.watched += tail;
          if (state.current.idx < list.length - 1) {
            state.current.idx += 1;
            const next = list[state.current.idx];
            p.seekTo(next.start, true);
            state.current.last = next.start;
          } else {
            finish(p);
            state.current.last = t;
          }
          state.current.wall = now;
          setPct((x) => Math.max(x, ratioNow(p)));
          return;
        }

        const delta = t - state.current.last;
        const inSeg = t >= seg.start - 1 && t <= segEnd + 1;
        // avanço natural (até 2x, com folga para o timer atrasar); saltos da barra não contam
        if (delta > 0 && delta <= Math.max(1, wallDelta * 2.2 + 0.5) && inSeg) state.current.watched += delta;
        state.current.last = t;
        state.current.wall = now;

        const ratio = ratioNow(p);
        setPct((x) => Math.max(x, ratio));
        // se o servidor recusar (ex.: ainda cedo), tenta de novo a cada 5 s, sem martelar
        if (ratio >= 0.9 && !state.current.completed && now >= state.current.retryAt) {
          state.current.retryAt = now + 5000;
          void complete(ratio);
        }
      }, TICK_MS);
    });
    return () => { cancelled = true; if (timer) clearInterval(timer); player?.destroy(); playerRef.current = null; };
  }, [videoId, day, onCompleted, segKey]);

  /** Toque em "Assistir": abertura com a logo (vídeo já carregando, sem som) e depois o 1º trecho. */
  function startWithIntro() {
    const p = playerRef.current;
    if (!p) return;
    const first = segs[0];
    state.current.intro = true;
    setPhase("intro");
    // o play precisa nascer do toque (regra dos navegadores); começa mudo por trás da abertura
    p.mute();
    p.seekTo(first.start, true);
    p.playVideo();
    setTimeout(() => {
      p.seekTo(first.start, true);
      p.unMute();
      state.current.idx = 0;
      state.current.last = first.start;
      state.current.wall = Date.now();
      state.current.intro = false;
      setPhase("playing");
    }, INTRO_MS);
  }

  return (
    <div className="space-y-2">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow">
        <div className="h-full w-full [&_iframe]:h-full [&_iframe]:w-full" ref={host} />
        {phase !== "playing" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[#0B1F33]">
            <div className={phase === "intro" ? "sg-intro-logo" : undefined}>
              <Logo variant="white" className="h-10 sm:h-12" />
            </div>
            {phase === "cover" ? (
              <button type="button" onClick={startWithIntro} disabled={!ready}
                className="flex items-center gap-2 rounded-full bg-[#FF6A13] px-6 py-3 font-display text-base font-bold text-white shadow-lg transition hover:brightness-110 disabled:opacity-60">
                <Play className="h-5 w-5 fill-white" /> {ready ? "Assistir" : "Carregando..."}
              </button>
            ) : (
              <p className="sg-intro-tag text-sm font-semibold tracking-wide text-white/80">apresenta</p>
            )}
          </div>
        )}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${Math.round(pct * 100)}%` }} />
      </div>
      <p className="text-xs text-slate-500">
        {pct >= 0.9 ? "Vídeo concluído ✔" : `Assistido: ${Math.round(pct * 100)}% (mínimo 90%)`}
        {segs.length > 1 ? ` · ${segs.length} trechos em sequência` : ""}
      </p>
      {err && <p className="text-sm text-red-600">{err}</p>}
    </div>
  );
}
