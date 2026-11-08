"use client";

import { useMemo, useState } from "react";
import { AVATAR_CATEGORIES, optionValues, renderAvatarSvg, type AvatarStyle } from "@/lib/avatar";
import type { AvatarConfig } from "@/lib/types";
import { Button } from "@/components/ui";
import { api } from "@/components/ui/fetcher";
import { cn } from "@/lib/utils";
import { Shuffle } from "lucide-react";

const STYLE_LABEL: Record<AvatarStyle, string> = { adventurer: "Aventureiro", avataaars: "Clássico", bottts: "Robô" };

export function AvatarEditor({ initial, seed, brandColors, onSaved, saveLabel = "Salvar avatar" }: {
  initial: AvatarConfig | null; seed: string; brandColors: string[]; onSaved?: () => void; saveLabel?: string;
}) {
  const [cfg, setCfg] = useState<AvatarConfig>(initial ?? { style: "adventurer", seed, options: { backgroundColor: brandColors[0] } });
  const [cat, setCat] = useState<string>(AVATAR_CATEGORIES[cfg.style][0].key);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const categories = AVATAR_CATEGORIES[cfg.style];
  const bgs = useMemo(() => Array.from(new Set([...brandColors, "#E2E8F0", "#FDE68A", "#BFDBFE", "#FBCFE8", "#BBF7D0"])), [brandColors]);

  const set = (k: string, v: string) => setCfg((c) => ({ ...c, options: { ...c.options, [k]: v } }));
  const current = categories.find((c) => c.key === cat) ?? categories[0];
  const values = current ? optionValues(cfg.style, current.key) : [];
  const optional = ["glasses", "earrings", "facialHair", "accessories"].includes(current?.key ?? "");

  async function save() {
    setSaving(true); setErr("");
    try {
      await api("/api/auth/avatar", { config: cfg });
      onSaved?.();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="relative">
          <div className="h-44 w-44 overflow-hidden rounded-full shadow-lg ring-4 ring-white [&>svg]:h-full [&>svg]:w-full"
            dangerouslySetInnerHTML={{ __html: renderAvatarSvg(cfg, seed) }} />
          <button type="button" aria-label="Sortear" onClick={() => setCfg((c) => ({ ...c, seed: Math.random().toString(36).slice(2), options: { backgroundColor: c.options.backgroundColor } }))}
            className="absolute -right-1 bottom-2 rounded-full bg-white p-2 shadow ring-1 ring-slate-200">
            <Shuffle className="h-5 w-5 text-slate-700" />
          </button>
        </div>
      </div>

      <div className="flex justify-center gap-2">
        {(Object.keys(AVATAR_CATEGORIES) as AvatarStyle[]).map((s) => (
          <button key={s} type="button" onClick={() => { setCfg((c) => ({ ...c, style: s, options: { backgroundColor: c.options.backgroundColor } })); setCat(AVATAR_CATEGORIES[s][0].key); }}
            className={cn("rounded-full px-3 py-1.5 text-sm font-semibold", cfg.style === s ? "bg-brand text-brand-fg" : "bg-slate-100 text-slate-700")}>
            {STYLE_LABEL[s]}
          </button>
        ))}
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {categories.map((c) => (
          <button key={c.key} type="button" onClick={() => setCat(c.key)}
            className={cn("shrink-0 rounded-lg border px-3 py-1.5 text-sm", cat === c.key ? "border-brand bg-brand/10 font-semibold text-slate-900" : "border-slate-200 text-slate-600")}>
            {c.label}
          </button>
        ))}
        <button type="button" onClick={() => setCat("backgroundColor")}
          className={cn("shrink-0 rounded-lg border px-3 py-1.5 text-sm", cat === "backgroundColor" ? "border-brand bg-brand/10 font-semibold" : "border-slate-200 text-slate-600")}>
          Fundo
        </button>
      </div>

      {cat === "backgroundColor" ? (
        <div className="flex flex-wrap gap-3">
          {bgs.map((b) => (
            <button key={b} type="button" aria-label={b} onClick={() => set("backgroundColor", b)}
              className={cn("h-10 w-10 rounded-full ring-offset-2", cfg.options.backgroundColor === b && "ring-2 ring-slate-900")} style={{ background: b }} />
          ))}
        </div>
      ) : current?.kind === "color" ? (
        <div className="flex flex-wrap gap-3">
          {values.map((v) => (
            <button key={v} type="button" aria-label={v} onClick={() => set(current.key, v)}
              className={cn("h-10 w-10 rounded-full ring-offset-2", cfg.options[current.key] === v && "ring-2 ring-slate-900")} style={{ background: `#${v}` }} />
          ))}
        </div>
      ) : (
        <div className="grid max-h-64 grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-6">
          {optional && (
            <button type="button" onClick={() => set(current!.key, "none")}
              className={cn("flex aspect-square items-center justify-center rounded-xl border text-xs text-slate-500", cfg.options[current!.key] === "none" ? "border-brand ring-2 ring-brand" : "border-slate-200")}>
              Nenhum
            </button>
          )}
          {values.map((v) => (
            <button key={v} type="button" onClick={() => set(current!.key, v)}
              className={cn("aspect-square overflow-hidden rounded-xl border bg-slate-50 [&>svg]:h-full [&>svg]:w-full", cfg.options[current!.key] === v ? "border-brand ring-2 ring-brand" : "border-slate-200")}
              dangerouslySetInnerHTML={{ __html: renderAvatarSvg({ ...cfg, options: { ...cfg.options, [current!.key]: v } }, seed) }} />
          ))}
        </div>
      )}

      {err && <p className="text-sm text-red-600">{err}</p>}
      <Button className="w-full" size="lg" onClick={save} disabled={saving}>{saving ? "Salvando..." : saveLabel}</Button>
    </div>
  );
}
