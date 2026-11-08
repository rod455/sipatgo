"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { YouTubePlayer } from "@/components/player/YouTubePlayer";
import { buttonClass } from "@/components/ui";

export function DayVideo({ day, videoId, alreadyDone, dayDone, activityLabel, canPlay }: {
  day: number; videoId: string | null; alreadyDone: boolean; dayDone: boolean; activityLabel: string | null; canPlay: boolean;
}) {
  const [done, setDone] = useState(alreadyDone);
  const [pts, setPts] = useState<number | null>(null);
  const onCompleted = useCallback((p: number) => { setDone(true); setPts(p); }, []);

  return (
    <div className="space-y-4">
      {videoId ? <YouTubePlayer videoId={videoId} day={day} alreadyDone={alreadyDone} onCompleted={onCompleted} /> : null}
      {pts !== null && pts > 0 && <p className="animate-pop text-center font-display text-lg font-bold text-green-600">+{pts} pontos pelo vídeo!</p>}
      {dayDone ? (
        <Link href={`/app/dia/${day}/resultado`} className={buttonClass("secondary", "lg", "w-full")}>Ver resultado do dia</Link>
      ) : canPlay && activityLabel ? (
        <Link href={done ? `/app/dia/${day}/dinamica` : "#"} aria-disabled={!done}
          className={buttonClass("primary", "lg", `w-full ${done ? "" : "pointer-events-none opacity-50"}`)}>
          {done ? `Ir para a dinâmica: ${activityLabel}` : "Assista o vídeo para liberar a dinâmica"}
        </Link>
      ) : !activityLabel ? <p className="text-center text-sm text-slate-500">A dinâmica deste dia ainda não foi configurada.</p> : null}
    </div>
  );
}
