"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { YouTubePlayer, type VideoSegment } from "@/components/player/YouTubePlayer";
import { buttonClass } from "@/components/ui";

export function DayVideo({ day, videoId, alreadyDone, dayDone, activityLabel, canPlay, segments }: {
  day: number; videoId: string | null; alreadyDone: boolean; dayDone: boolean; activityLabel: string | null; canPlay: boolean;
  segments?: VideoSegment[] | null;
}) {
  const [done, setDone] = useState(alreadyDone);
  const [pts, setPts] = useState<number | null>(null);
  const onCompleted = useCallback((p: number) => { setDone(true); setPts(p); }, []);

  return (
    <div className="space-y-4">
      {videoId ? <YouTubePlayer videoId={videoId} day={day} alreadyDone={alreadyDone} onCompleted={onCompleted} segments={segments} /> : null}
      {pts !== null && pts > 0 && <p className="animate-pop text-center font-display text-lg font-bold text-green-600">+{pts} pontos pelo vídeo!</p>}
      {dayDone ? (
        <Link href={`/app/dia/${day}/resultado`} className={buttonClass("secondary", "lg", "w-full")}>Ver resultado do dia</Link>
      ) : canPlay && activityLabel ? (
        done || !videoId ? (
          <Link href={`/app/dia/${day}/dinamica`} className={buttonClass("primary", "lg", "w-full")}>
            Ir para a dinâmica: {activityLabel}
          </Link>
        ) : (
          <div className="space-y-2">
            <p className="text-center text-sm text-brand-muted">Assista o vídeo até o fim para ganhar os pontos do vídeo.</p>
            <Link href={`/app/dia/${day}/dinamica`} className={buttonClass("outline", "md", "w-full")}>
              Responder sem assistir (sem os pontos do vídeo)
            </Link>
          </div>
        )
      ) : !activityLabel ? <p className="text-center text-sm text-brand-muted">A dinâmica deste dia ainda não foi configurada.</p> : null}
    </div>
  );
}
