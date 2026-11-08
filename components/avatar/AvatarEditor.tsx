"use client";

import { useMemo, useState } from "react";
import { AVATAR_CATEGORIES, categoryVisible, optionValues, renderAvatarSvg, type AvatarStyle } from "@/lib/avatar";
import { analyzeFacePixels } from "@/lib/photo-sampler";
import type { AvatarConfig, AvatarGender } from "@/lib/types";
import { Alert, Button } from "@/components/ui";
import { api } from "@/components/ui/fetcher";
import { PhotoCropper } from "./PhotoCropper";
import { cn } from "@/lib/utils";
import { Shuffle, Sparkles, UserRound, Wand2 } from "lucide-react";

const STYLE_LABEL: Record<AvatarStyle, string> = { adventurer: "Desenho", avataaars: "Clássico", bottts: "Robô" };
type Tab = "character" | "fromPhoto" | "photo";

export function AvatarEditor({ initial, seed, brandColors, onSaved, saveLabel = "Salvar avatar", allowPhoto = false }: {
  initial: AvatarConfig | null; seed: string; brandColors: string[]; onSaved?: () => void; saveLabel?: string; allowPhoto?: boolean;
}) {
  const [cfg, setCfg] = useState<AvatarConfig>(initial ?? { style: "adventurer", seed, options: { backgroundColor: brandColors[0] } });
  // última configuração de personagem (para voltar da foto sem perder nada)
  const [character, setCharacter] = useState<AvatarConfig>(initial && initial.style !== "photo" ? initial : { style: "adventurer", seed, options: { backgroundColor: brandColors[0] }, gender: initial?.gender });
  const [tab, setTab] = useState<Tab>(initial?.style === "photo" ? "photo" : "character");
  const [cat, setCat] = useState<string>("skinColor");
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "red" | "green" | "blue"; text: string } | null>(null);
  const [hints, setHints] = useState<{ beard: boolean; hair?: string } | null>(null);

  const isPhoto = cfg.style === "photo";
  const style = (isPhoto ? character.style : cfg.style) as AvatarStyle;
  const gender = cfg.gender;
  const categories = AVATAR_CATEGORIES[style].filter((c) => categoryVisible(style, c.key, gender));
  const current = categories.find((c) => c.key === cat) ?? categories[0];
  const bgs = useMemo(() => Array.from(new Set([...brandColors.map((c) => c.replace("#", "")), "e2e8f0", "fde68a", "bfdbfe", "fbcfe8", "bbf7d0"])), [brandColors]);

  const update = (next: AvatarConfig) => { setCfg(next); if (next.style !== "photo") setCharacter(next); };
  const setOpt = (k: string, v: string) => update({ ...character, gender, options: { ...character.options, [k]: v } });

  function setGender(g: AvatarGender | undefined) {
    // limpa escolhas incompatíveis com o novo gênero
    const base = isPhoto ? character : cfg;
    const st = base.style as AvatarStyle;
    const options = { ...base.options };
    for (const c of AVATAR_CATEGORIES[st]) {
      const v = options[c.key];
      if (typeof v !== "string" || v === "none" || c.kind === "color") continue;
      if (!categoryVisible(st, c.key, g) || !optionValues(st, c.key, g).includes(v)) delete options[c.key];
    }
    const nextChar = { ...base, options, gender: g };
    setCharacter(nextChar);
    setCfg(isPhoto ? { ...cfg, gender: g } : nextChar);
  }

  async function onAnalyze(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d")!;
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const a = analyzeFacePixels(data, canvas.width);
    const st: AvatarStyle = character.style === "bottts" ? "adventurer" : (character.style as AvatarStyle);
    const h = { beard: a.beard, hair: a.hairContrast > 18 ? a.hair : undefined };
    setHints(h);
    const options: AvatarConfig["options"] = { ...character.options, skinColor: a.skin };
    if (h.hair) options.hairColor = h.hair;
    update({ ...character, style: st, gender, options: withHints(st, options, h, gender) });
    setTab("character");
    setCat(st === "avataaars" ? "top" : "hair");
    setMsg({ tone: "blue", text: "Pele e cabelo copiados da foto! Agora escolha o corte de cabelo e os detalhes. A foto não foi enviada." });
  }

  async function onUsePhoto(canvas: HTMLCanvasElement) {
    setBusy(true); setMsg(null);
    try {
      const blob: Blob = await new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("Falha ao processar a foto"))), "image/jpeg", 0.85));
      const fd = new FormData();
      fd.append("photo", new File([blob], "avatar.jpg", { type: "image/jpeg" }));
      const r = await api<{ url: string }>("/api/auth/avatar-photo", fd);
      setCfg({ style: "photo", seed: cfg.seed || seed, options: {}, gender, photo_url: r.url });
      setMsg({ tone: "green", text: "Foto pronta. Toque em salvar para usar." });
    } catch (e) {
      setMsg({ tone: "red", text: (e as Error).message });
    } finally { setBusy(false); }
  }

  async function save() {
    setSaving(true); setMsg(null);
    try {
      await api("/api/auth/avatar", { config: cfg });
      onSaved?.();
    } catch (e) {
      setMsg({ tone: "red", text: (e as Error).message });
    } finally {
      setSaving(false);
    }
  }

  const values = current ? optionValues(style, current.key, gender) : [];
  const chosen = current ? character.options[current.key] : undefined;
  // cor vinda da foto que não está na paleta aparece primeiro
  const colorValues = current?.kind === "color" && typeof chosen === "string" && chosen && !values.includes(chosen) ? [chosen, ...values] : values;
  const optional = ["glasses", "earrings", "facialHair", "accessories", "features"].includes(current?.key ?? "");

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="relative">
          <div className="h-40 w-40 overflow-hidden rounded-full bg-slate-100 shadow-lg ring-4 ring-white [&>svg]:h-full [&>svg]:w-full"
            dangerouslySetInnerHTML={{ __html: renderAvatarSvg(cfg, seed) }} />
          {!isPhoto && (
            <button type="button" aria-label="Sortear" title="Sortear outro"
              onClick={() => update({ ...character, seed: Math.random().toString(36).slice(2), options: { backgroundColor: character.options.backgroundColor, skinColor: character.options.skinColor, hairColor: character.options.hairColor } })}
              className="absolute -right-1 bottom-2 rounded-full bg-white p-2 shadow ring-1 ring-slate-200">
              <Shuffle className="h-5 w-5 text-slate-700" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Montagens">
        {([["m", "Homem"], ["f", "Mulher"], [undefined, "Todas"]] as const).map(([g, label]) => (
          <button key={label} type="button" role="radio" aria-checked={gender === g} onClick={() => setGender(g)}
            className={cn("h-10 rounded-xl text-sm font-semibold ring-1", gender === g ? "bg-brand text-brand-fg ring-brand" : "bg-white text-slate-700 ring-slate-200")}>
            {label}
          </button>
        ))}
      </div>

      <div className={cn("grid gap-1 rounded-xl bg-slate-100 p-1", allowPhoto ? "grid-cols-3" : "grid-cols-2")}>
        <TabBtn active={tab === "character"} onClick={() => { setTab("character"); if (isPhoto) setCfg(character); }} icon={<Sparkles className="h-4 w-4" />}>Personagem</TabBtn>
        <TabBtn active={tab === "fromPhoto"} onClick={() => setTab("fromPhoto")} icon={<Wand2 className="h-4 w-4" />}>Criar pela foto</TabBtn>
        {allowPhoto && <TabBtn active={tab === "photo"} onClick={() => setTab("photo")} icon={<UserRound className="h-4 w-4" />}>Usar foto</TabBtn>}
      </div>

      {tab === "fromPhoto" && (
        <PhotoCropper onConfirm={onAnalyze} confirmLabel="Gerar meu avatar"
          hint="Tire uma selfie: copiamos o tom de pele, a cor do cabelo e a barba para o seu personagem. A foto fica só no seu celular." />
      )}

      {tab === "photo" && allowPhoto && (
        isPhoto && cfg.photo_url ? (
          <div className="space-y-2 text-center">
            <p className="text-sm text-slate-600">Sua foto aparece no ranking e no mural para os colegas.</p>
            <Button type="button" variant="ghost" size="sm" onClick={() => setCfg({ ...cfg, photo_url: undefined })}>Escolher outra foto</Button>
          </div>
        ) : (
          <PhotoCropper onConfirm={onUsePhoto} busy={busy} confirmLabel="Usar esta foto"
            hint="Sua foto vira o avatar e aparece no ranking para os colegas. Use uma foto de rosto, sem filtros." />
        )
      )}

      {tab === "character" && (
        <>
          <div className="flex justify-center gap-2">
            {(Object.keys(AVATAR_CATEGORIES) as AvatarStyle[]).map((s) => (
              <button key={s} type="button" onClick={() => {
                const keep = { backgroundColor: character.options.backgroundColor, skinColor: character.options.skinColor, hairColor: character.options.hairColor };
                update({ ...character, style: s, gender, options: s === "bottts" ? { backgroundColor: keep.backgroundColor } : withHints(s, keep, hints, gender) });
                setCat(AVATAR_CATEGORIES[s][0].key);
              }}
                className={cn("rounded-full px-3 py-1.5 text-sm font-semibold", style === s ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700")}>
                {STYLE_LABEL[s]}
              </button>
            ))}
          </div>

          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {categories.map((c) => (
              <button key={c.key} type="button" onClick={() => setCat(c.key)}
                className={cn("shrink-0 rounded-lg border px-3 py-1.5 text-sm", current?.key === c.key && cat !== "backgroundColor" ? "border-brand bg-brand/10 font-semibold text-slate-900" : "border-slate-200 text-slate-600")}>
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
                <button key={b} type="button" aria-label={`Fundo ${b}`} onClick={() => setOpt("backgroundColor", b)}
                  className={cn("h-10 w-10 rounded-full ring-offset-2", String(character.options.backgroundColor ?? "").replace("#", "") === b && "ring-2 ring-slate-900")} style={{ background: `#${b}` }} />
              ))}
            </div>
          ) : current?.kind === "color" ? (
            <div className="flex flex-wrap gap-3">
              {colorValues.map((v, i) => (
                <button key={v} type="button" aria-label={`Cor ${v}`} onClick={() => setOpt(current.key, v)}
                  className={cn("relative h-10 w-10 rounded-full ring-offset-2", chosen === v && "ring-2 ring-slate-900")} style={{ background: `#${v}` }}>
                  {i === 0 && colorValues !== values && <span className="absolute -right-1 -top-1 rounded-full bg-white px-1 text-[9px] font-bold shadow">foto</span>}
                </button>
              ))}
            </div>
          ) : (
            <div className="grid max-h-64 grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-6">
              {optional && (
                <button type="button" onClick={() => setOpt(current!.key, "none")}
                  className={cn("flex aspect-square items-center justify-center rounded-xl border text-xs text-slate-500", chosen === "none" ? "border-brand ring-2 ring-brand" : "border-slate-200")}>
                  Nenhum
                </button>
              )}
              {values.map((v) => (
                <button key={v} type="button" onClick={() => setOpt(current!.key, v)}
                  className={cn("aspect-square overflow-hidden rounded-xl border bg-slate-50 [&>svg]:h-full [&>svg]:w-full", chosen === v ? "border-brand ring-2 ring-brand" : "border-slate-200")}
                  dangerouslySetInnerHTML={{ __html: renderAvatarSvg({ ...character, gender, options: { ...character.options, [current!.key]: v } }, seed) }} />
              ))}
            </div>
          )}
        </>
      )}

      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
      <Button className="w-full" size="lg" onClick={save} disabled={saving || busy || (isPhoto && !cfg.photo_url)}>{saving ? "Salvando..." : saveLabel}</Button>
    </div>
  );
}

/** Aplica barba/bigode detectados na foto conforme o estilo. */
function withHints(st: AvatarStyle, options: AvatarConfig["options"], h: { beard: boolean; hair?: string } | null, gender?: AvatarGender) {
  if (!h || gender === "f") return options;
  const o = { ...options };
  if (st === "avataaars") {
    if (h.beard) { o.facialHair = "beardMedium"; if (h.hair) o.facialHairColor = h.hair; }
    else o.facialHair = "none";
  }
  if (st === "adventurer" && h.beard) o.features = "mustache";
  return o;
}

function TabBtn({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={cn("flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold sm:text-sm", active ? "bg-white shadow" : "text-slate-600")}>
      {icon}{children}
    </button>
  );
}
