"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CompanyCodeForm({ next }: { next?: string }) {
  const [code, setCode] = useState("");
  const router = useRouter();
  return (
    <form onSubmit={(e) => { e.preventDefault(); const s = code.trim().toLowerCase().replace(/[^a-z0-9-]/g, ""); if (s) router.push(`/${s}${next ? `?next=${encodeURIComponent(next)}` : ""}`); }} className="space-y-3">
      <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="ex.: industria-horizonte" autoFocus
        className="h-12 w-full rounded-xl border border-slate-300 px-3 outline-none focus:border-[var(--sg-orange-500)]" />
      <button className="h-12 w-full rounded-xl bg-[var(--sg-orange-500)] font-semibold text-white hover:bg-[var(--sg-orange-600)]">Continuar</button>
    </form>
  );
}
