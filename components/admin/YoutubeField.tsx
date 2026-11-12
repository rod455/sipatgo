"use client";

import { useState } from "react";
import { Button, Input, Label } from "@/components/ui";

const clock = (n?: number | null) => (n == null ? "" : `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`);

export function YoutubeField({ initialId, initialDuration, initialSegments }: {
  initialId: string | null; initialDuration: number | null; initialSegments?: { start: number; end: number | null }[] | null;
}) {
  const [clips, setClips] = useState((initialSegments ?? []).map((s) => `${clock(s.start)}-${clock(s.end)}`).join("\n"));
  const [url, setUrl] = useState(initialId ? `https://youtu.be/${initialId}` : "");
  const [dur, setDur] = useState(initialDuration ? String(initialDuration) : "");
  const [msg, setMsg] = useState("");
  async function fetchMeta() {
    setMsg("Buscando...");
    const r = await fetch(`/api/youtube-meta?url=${encodeURIComponent(url)}`);
    const j = await r.json();
    if (!r.ok) { setMsg(j.error); return; }
    if (j.duration_s) setDur(String(j.duration_s));
    setMsg(j.title ? `“${j.title}”${j.duration_s ? ` · ${Math.floor(j.duration_s / 60)}min${j.duration_s % 60}s` : " · informe a duração manualmente"}` : "Vídeo encontrado.");
  }
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
      <div>
        <Label>Vídeo do YouTube</Label>
        <div className="flex gap-2">
          <Input name="youtube" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtu.be/..." />
          <Button type="button" variant="outline" onClick={fetchMeta} disabled={!url}>Buscar</Button>
        </div>
        {msg && <p className="mt-1 text-xs text-slate-500">{msg}</p>}
      </div>
      <div>
        <Label>Duração (segundos)</Label>
        <Input name="video_duration_s" type="number" min={0} value={dur} onChange={(e) => setDur(e.target.value)} />
        <p className="mt-1 text-xs text-slate-500">Usada no anti-pulo e na carga horária.</p>
      </div>
      <div className="sm:col-span-2 sm:max-w-md">
        <Label>Trechos (opcional)</Label>
        <textarea name="clips" value={clips} onChange={(e) => setClips(e.target.value)} rows={3}
          placeholder={"01:49-03:08\n08:27-09:07"}
          className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2 font-mono text-sm text-brand-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30" />
        <p className="mt-1 text-xs text-slate-500">Um trecho por linha, no formato início-fim. Tocam em sequência, na ordem da lista. Em branco, toca o vídeo inteiro.</p>
      </div>
    </div>
  );
}
