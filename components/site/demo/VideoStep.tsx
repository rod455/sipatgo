"use client";

import { useEffect, useRef, useState } from "react";
import { Play, SkipForward } from "lucide-react";
import { DEMO_CLIENT } from "@/content/site/demo-client";
import { DEMO_YOUTUBE_ID, PLACEHOLDER_SECONDS, POINTS, SKIP_AFTER_SECONDS, VIDEO_SCENES } from "./config";

/** Passo 1: vídeo do dia. Sem DEMO_YOUTUBE_ID, mostra um "vídeo" animado de 60s com botão Pular. */
export function VideoStep({ onDone }: { onDone: (points: number) => void }) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    startRef.current = performance.now();
    const t = window.setInterval(() => {
      if (startRef.current === null) return;
      setElapsed(Math.min(PLACEHOLDER_SECONDS, (performance.now() - startRef.current) / 1000));
    }, 200);
    return () => window.clearInterval(t);
  }, []);

  const watched = elapsed / PLACEHOLDER_SECONDS >= 0.9;

  useEffect(() => {
    if (!DEMO_YOUTUBE_ID && elapsed >= PLACEHOLDER_SECONDS && !doneRef.current) {
      doneRef.current = true;
      onDone(POINTS.video);
    }
  }, [elapsed, onDone]);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone(DEMO_YOUTUBE_ID || watched ? POINTS.video : 0);
  };

  const canSkip = elapsed >= SKIP_AFTER_SECONDS;
  const scene = VIDEO_SCENES[Math.min(VIDEO_SCENES.length - 1, Math.floor((elapsed / PLACEHOLDER_SECONDS) * VIDEO_SCENES.length))];
  const remaining = Math.max(0, Math.ceil(PLACEHOLDER_SECONDS - elapsed));

  return (
    <div>
      <h2 className="font-display text-2xl font-extrabold text-sg-navy-900">Vídeo do dia</h2>
      <p className="mt-1 text-sg-gray-600">
        Na campanha real, assistir até o fim vale <b className="text-sg-navy-900">{POINTS.video} pontos</b> e libera a dinâmica.
      </p>

      <div className="mt-5 overflow-hidden rounded-2xl bg-slate-900 shadow-lg">
        {DEMO_YOUTUBE_ID ? (
          <div className="aspect-video">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(DEMO_YOUTUBE_ID)}?rel=0&modestbranding=1&playsinline=1`}
              title="Vídeo da demo SipatGo"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div
            className="relative flex aspect-video flex-col items-center justify-center p-6 text-center text-white"
            style={{ background: `linear-gradient(135deg, ${DEMO_CLIENT.primary}, ${DEMO_CLIENT.secondary})` }}
            aria-live="polite"
          >
            <span className="absolute top-3 left-3 rounded-md bg-black/30 px-2 py-0.5 text-xs font-semibold">{DEMO_CLIENT.name}</span>
            <span className="absolute top-3 right-3 rounded-md bg-black/30 px-2 py-0.5 text-xs font-semibold tabular">0:{String(remaining).padStart(2, "0")}</span>
            <Play aria-hidden className="mb-3 size-10 opacity-80 motion-safe:animate-pulse" strokeWidth={2} />
            <p key={scene.title} className="animate-pop font-display text-xl font-extrabold md:text-3xl">
              {scene.title}
            </p>
            <p key={scene.text} className="animate-pop mt-2 max-w-md text-sm md:text-lg">
              {scene.text}
            </p>
          </div>
        )}
        {!DEMO_YOUTUBE_ID ? (
          <div className="h-1.5 bg-white/20">
            <div className="h-full bg-sg-yellow-400 transition-[width] duration-200" style={{ width: `${(elapsed / PLACEHOLDER_SECONDS) * 100}%` }} />
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {DEMO_YOUTUBE_ID ? (
          <button
            type="button"
            disabled={!canSkip}
            onClick={finish}
            className="inline-flex h-12 items-center gap-2 rounded-xl px-6 font-semibold text-white disabled:opacity-50"
            style={{ background: DEMO_CLIENT.primary }}
          >
            Ir para a dinâmica
          </button>
        ) : canSkip ? (
          <button
            type="button"
            onClick={finish}
            className="inline-flex h-12 items-center gap-2 rounded-xl border-2 border-sg-navy-900 px-6 font-semibold text-sg-navy-900 hover:bg-sg-navy-900 hover:text-white"
          >
            <SkipForward aria-hidden className="size-5" /> {watched ? "Ir para a dinâmica" : "Pular"}
          </button>
        ) : (
          <p className="text-sm text-sg-gray-600">O botão Pular aparece em {Math.max(0, Math.ceil(SKIP_AFTER_SECONDS - elapsed))}s…</p>
        )}
        {!DEMO_YOUTUBE_ID && canSkip && !watched ? (
          <p className="text-sm text-sg-gray-600">Pulando, você não ganha os {POINTS.video} pontos do vídeo. 😉</p>
        ) : null}
      </div>
    </div>
  );
}
