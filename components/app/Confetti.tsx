"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

export function Confetti({ big }: { big?: boolean }) {
  useEffect(() => {
    confetti({ particleCount: big ? 220 : 120, spread: big ? 110 : 70, origin: { y: 0.5 } });
    if (big) setTimeout(() => confetti({ particleCount: 160, spread: 140, origin: { y: 0.3 } }), 600);
  }, [big]);
  return null;
}
