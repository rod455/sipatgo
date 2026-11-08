"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import type { ActivityView } from "@/lib/game";
import { SequentialActivity } from "./SequentialActivity";
import { MatchPairs } from "./MatchPairs";
import { FindErrors } from "./FindErrors";

export function ActivityRunner({ day, view }: { day: number; view: ActivityView }) {
  const router = useRouter();
  const onDayComplete = useCallback((badges: string[]) => {
    router.push(`/app/dia/${day}/resultado${badges.length ? `?novos=${badges.join(",")}` : ""}`);
  }, [day, router]);
  if (view.type === "match_pairs") return <MatchPairs day={day} view={view} onDayComplete={onDayComplete} />;
  if (view.type === "find_errors") return <FindErrors day={day} view={view} onDayComplete={onDayComplete} />;
  return <SequentialActivity day={day} view={view} onDayComplete={onDayComplete} />;
}
