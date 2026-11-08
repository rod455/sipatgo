"use client";

import { useRef, useState, useTransition } from "react";
import { ACTIVITY_LABELS, ACTIVITY_TYPES, emptyConfig, type ActivityType } from "@/lib/activities";
import { Alert, Button, Input, Label, Select, Textarea } from "@/components/ui";
import { saveActivity, uploadActivityImage } from "@/app/admin/dias/actions";
import { cn } from "@/lib/utils";
import { Eye, Trash2 } from "lucide-react";

type Cfg = Record<string, unknown>;
type Item = Record<string, unknown>;

export function ActivityEditor({ dayId, initialType, initialConfig, hasAttempts }: {
  dayId: string; initialType: ActivityType | null; initialConfig: unknown; hasAttempts: boolean;
}) {
  const [type, setType] = useState<ActivityType>(initialType ?? "true_false");
  const [configs, setConfigs] = useState<Record<string, Cfg>>(() => ({ [initialType ?? "true_false"]: (initialConfig as Cfg) ?? (emptyConfig(initialType ?? "true_false") as Cfg) }));
  const cfg = configs[type] ?? (emptyConfig(type) as Cfg);
  const setCfg = (c: Cfg) => setConfigs((s) => ({ ...s, [type]: c }));
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [preview, setPreview] = useState(false);

  const save = () => start(async () => {
    const r = await saveActivity(dayId, type, cfg);
    setMsg({ ok: r.ok, text: r.ok ? r.message ?? "Salvo!" : r.error ?? "Erro" });
  });

  const items = (cfg.items as Item[] | undefined) ?? [];
  const setItem = (i: number, patch: Item) => setCfg({ ...cfg, items: items.map((it, k) => (k === i ? { ...it, ...patch } : it)) });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-64">
          <Label>Tipo de dinâmica</Label>
          <Select value={type} disabled={hasAttempts} onChange={(e) => setType(e.target.value as ActivityType)}>
            {ACTIVITY_TYPES.map((t) => <option key={t} value={t}>{ACTIVITY_LABELS[t]}</option>)}
          </Select>
        </div>
        {hasAttempts && <p className="text-xs text-amber-700">Já há respostas: o tipo não pode mudar.</p>}
        <Button type="button" variant="ghost" size="sm" onClick={() => setPreview((p) => !p)}><Eye className="h-4 w-4" /> {preview ? "Editar" : "Pré-visualizar"}</Button>
      </div>

      {preview ? <Preview type={type} cfg={cfg} /> : (
        <>
          {type === "true_false" && items.map((it, i) => (
            <ItemBox key={i} n={i}>
              <Textarea rows={2} placeholder="Afirmação" value={String(it.statement ?? "")} onChange={(e) => setItem(i, { statement: e.target.value })} />
              <div className="flex gap-2">
                {[true, false].map((v) => (
                  <button key={String(v)} type="button" onClick={() => setItem(i, { answer: v })}
                    className={cn("rounded-lg px-3 py-1.5 text-sm font-semibold", it.answer === v ? "bg-brand text-brand-fg" : "bg-slate-100")}>{v ? "Fato" : "Fake"}</button>
                ))}
              </div>
              <Input placeholder="Explicação (aparece após acertar)" value={String(it.explanation ?? "")} onChange={(e) => setItem(i, { explanation: e.target.value })} />
            </ItemBox>
          ))}

          {(type === "timed_quiz" || type === "new_habits") && (
            <>
              {type === "timed_quiz" && (
                <div className="w-48"><Label>Tempo limite por pergunta (s)</Label>
                  <Input type="number" min={5} max={60} value={Number(cfg.time_limit_s ?? 15)} onChange={(e) => setCfg({ ...cfg, time_limit_s: Number(e.target.value) })} /></div>
              )}
              {items.map((it, i) => {
                const opts = (it.options as string[]) ?? [];
                return (
                  <ItemBox key={i} n={i}>
                    <Textarea rows={2} placeholder={type === "timed_quiz" ? "Pergunta" : "Situação"} value={String(it.question ?? it.situation ?? "")}
                      onChange={(e) => setItem(i, type === "timed_quiz" ? { question: e.target.value } : { situation: e.target.value })} />
                    <div className="space-y-2">
                      {opts.map((o, k) => (
                        <div key={k} className="flex items-center gap-2">
                          <input type="radio" name={`c-${i}`} checked={it.correct_index === k} onChange={() => setItem(i, { correct_index: k })} className="h-4 w-4" aria-label="Correta" />
                          <Input placeholder={`${type === "timed_quiz" ? "Alternativa" : "Atitude"} ${k + 1}`} value={o}
                            onChange={(e) => setItem(i, { options: opts.map((x, j) => (j === k ? e.target.value : x)) })} />
                        </div>
                      ))}
                      <p className="text-xs text-slate-500">Marque a correta.</p>
                    </div>
                    <Input placeholder="Explicação" value={String(it.explanation ?? "")} onChange={(e) => setItem(i, { explanation: e.target.value })} />
                  </ItemBox>
                );
              })}
            </>
          )}

          {type === "match_pairs" && ((cfg.pairs as Item[]) ?? []).map((p, i) => {
            const pairs = cfg.pairs as Item[];
            const setPair = (patch: Item) => setCfg({ ...cfg, pairs: pairs.map((x, k) => (k === i ? { ...x, ...patch } : x)) });
            return (
              <ItemBox key={i} n={i}>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input placeholder="Coluna A" value={String(p.left ?? "")} onChange={(e) => setPair({ left: e.target.value })} />
                  <Input placeholder="Coluna B (par)" value={String(p.right ?? "")} onChange={(e) => setPair({ right: e.target.value })} />
                </div>
                <Input placeholder="Explicação" value={String(p.explanation ?? "")} onChange={(e) => setPair({ explanation: e.target.value })} />
              </ItemBox>
            );
          })}

          {type === "find_errors" && <HotspotEditor cfg={cfg} setCfg={setCfg} />}
        </>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={save} disabled={pending}>{pending ? "Salvando..." : "Salvar dinâmica"}</Button>
        {msg && (msg.ok ? <span className="text-sm text-green-700">{msg.text}</span> : <Alert>{msg.text}</Alert>)}
      </div>
    </div>
  );
}

function ItemBox({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="space-y-2 rounded-xl border border-slate-200 p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Item {n + 1}</p>
      {children}
    </div>
  );
}

type Hotspot = { id: string; x: number; y: number; w: number; h: number; label: string; explanation: string };

function HotspotEditor({ cfg, setCfg }: { cfg: Cfg; setCfg: (c: Cfg) => void }) {
  const hs = (cfg.hotspots as Hotspot[]) ?? [];
  const box = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<{ x0: number; y0: number; x: number; y: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const setHs = (next: Hotspot[]) => setCfg({ ...cfg, hotspots: next });

  const point = (e: React.PointerEvent) => {
    const r = box.current!.getBoundingClientRect();
    return { x: Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)), y: Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100)) };
  };

  async function upload(f: File) {
    setUploading(true); setErr("");
    const fd = new FormData(); fd.append("file", f);
    const r = await uploadActivityImage(fd);
    setUploading(false);
    if (r.url) setCfg({ ...cfg, image_url: r.url }); else setErr(r.error ?? "Falha");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-64 flex-1"><Label>Imagem</Label>
          <Input value={String(cfg.image_url ?? "")} onChange={(e) => setCfg({ ...cfg, image_url: e.target.value })} placeholder="URL da imagem ou envie um arquivo" /></div>
        <label className="inline-flex h-11 cursor-pointer items-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold">
          {uploading ? "Enviando..." : "Enviar imagem"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </label>
        <div className="w-40"><Label>Cliques errados até a dica</Label>
          <Input type="number" min={1} max={20} value={Number(cfg.max_wrong_clicks ?? 5)} onChange={(e) => setCfg({ ...cfg, max_wrong_clicks: Number(e.target.value) })} /></div>
      </div>
      {err && <Alert>{err}</Alert>}
      {cfg.image_url ? (
        <>
          <p className="text-sm text-slate-600">Arraste sobre a imagem para marcar cada erro ({hs.length}/5).</p>
          <div ref={box} className="relative touch-none select-none overflow-hidden rounded-xl ring-1 ring-slate-300"
            onPointerDown={(e) => { if (hs.length >= 5) return; const p = point(e); setDraft({ x0: p.x, y0: p.y, x: p.x, y: p.y }); (e.target as HTMLElement).setPointerCapture(e.pointerId); }}
            onPointerMove={(e) => { if (draft) { const p = point(e); setDraft({ ...draft, x: p.x, y: p.y }); } }}
            onPointerUp={() => {
              if (!draft) return;
              const x = Math.min(draft.x0, draft.x), y = Math.min(draft.y0, draft.y);
              const w = Math.abs(draft.x - draft.x0), h = Math.abs(draft.y - draft.y0);
              setDraft(null);
              if (w < 2 || h < 2) return;
              setHs([...hs, { id: `h${Date.now()}`, x: +x.toFixed(1), y: +y.toFixed(1), w: +w.toFixed(1), h: +h.toFixed(1), label: "", explanation: "" }]);
            }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={String(cfg.image_url)} alt="" className="pointer-events-none block w-full" draggable={false} />
            {hs.map((h, i) => (
              <div key={h.id} className="pointer-events-none absolute border-2 border-red-500 bg-red-500/20" style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${h.w}%`, height: `${h.h}%` }}>
                <span className="absolute -left-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white">{i + 1}</span>
              </div>
            ))}
            {draft && <div className="pointer-events-none absolute border-2 border-dashed border-blue-500 bg-blue-500/20"
              style={{ left: `${Math.min(draft.x0, draft.x)}%`, top: `${Math.min(draft.y0, draft.y)}%`, width: `${Math.abs(draft.x - draft.x0)}%`, height: `${Math.abs(draft.y - draft.y0)}%` }} />}
          </div>
          {hs.map((h, i) => (
            <div key={h.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 p-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">{i + 1}</span>
              <Input className="min-w-40 flex-1" placeholder="Nome do erro" value={h.label} onChange={(e) => setHs(hs.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)))} />
              <Input className="min-w-56 flex-[2]" placeholder="Explicação" value={h.explanation} onChange={(e) => setHs(hs.map((x, k) => (k === i ? { ...x, explanation: e.target.value } : x)))} />
              <Button type="button" variant="ghost" size="sm" onClick={() => setHs(hs.filter((_, k) => k !== i))} aria-label="Remover"><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </>
      ) : <p className="text-sm text-slate-500">Envie a imagem para marcar os erros.</p>}
    </div>
  );
}

function Preview({ type, cfg }: { type: ActivityType; cfg: Cfg }) {
  const [revealed, setRevealed] = useState<Record<number, boolean | number>>({});
  const items = (cfg.items as Item[]) ?? [];
  if (type === "find_errors") {
    return (
      <div className="relative overflow-hidden rounded-xl ring-1 ring-slate-300">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {cfg.image_url ? <img src={String(cfg.image_url)} alt="" className="block w-full" /> : null}
        {((cfg.hotspots as Hotspot[]) ?? []).map((h, i) => (
          <div key={h.id} title={h.label} className="absolute border-4 border-green-500 bg-green-500/10" style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${h.w}%`, height: `${h.h}%` }}>
            <span className="absolute -left-2 -top-2 rounded bg-green-600 px-1 text-[10px] font-bold text-white">{i + 1} {h.label}</span>
          </div>
        ))}
      </div>
    );
  }
  if (type === "match_pairs") {
    return <ul className="space-y-2">{((cfg.pairs as Item[]) ?? []).map((p, i) => <li key={i} className="rounded-xl bg-slate-50 p-3 text-sm"><strong>{String(p.left)}</strong> ↔ {String(p.right)}</li>)}</ul>;
  }
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">Toque numa resposta para conferir como o participante verá.</p>
      {items.map((it, i) => {
        const opts = type === "true_false" ? ["Fato", "Fake"] : (it.options as string[]);
        const correct = type === "true_false" ? (it.answer ? 0 : 1) : Number(it.correct_index);
        const pick = revealed[i];
        return (
          <div key={i} className="rounded-xl bg-slate-50 p-3">
            <p className="font-semibold">{i + 1}. {String(it.statement ?? it.question ?? it.situation ?? "")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {opts.map((o, k) => (
                <button key={k} type="button" onClick={() => setRevealed((r) => ({ ...r, [i]: k }))}
                  className={cn("rounded-lg border px-3 py-1.5 text-sm", pick === k ? (k === correct ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50") : "border-slate-200 bg-white")}>{o}</button>
              ))}
            </div>
            {pick === correct && it.explanation ? <p className="mt-2 text-sm text-green-800">{String(it.explanation)}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
