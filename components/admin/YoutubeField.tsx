"use client";

import { useState } from "react";
import { Button, Input, Label } from "@/components/ui";

const clock = (n?: number | null) => (n == null ? "" : `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`);

export function YoutubeField({ initialId, initialDuration, initialStart, initialEnd }: {
  initialId: string | null; initialDuration: number | null; initialStart?: number | null; initialEnd?: number | null;
}) {
  const [clipStart, setClipStart] = useState(clock(initialStart));
  const [clipEnd, setClipEnd] = useState(clock(initialEnd));
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
      <div className="grid grid-cols-2 gap-3 sm:col-span-2 sm:max-w-md">
        <div>
          <Label>Trecho: início</Label>
          <Input name="clip_start" value={clipStart} onChange={(e) => setClipStart(e.target.value)} placeholder="ex.: 4:30" />
        </div>
        <div>
          <Label>Trecho: fim</Label>
          <Input name="clip_end" value={clipEnd} onChange={(e) => setClipEnd(e.target.value)} placeholder="ex.: 6:30" />
        </div>
        <p className="col-span-2 -mt-1 text-xs text-slate-500">Opcional. Para usar só um pedaço de uma palestra (ex.: 2 minutos de um TEDx). Em branco, toca o vídeo inteiro.</p>
      </div>
    </div>
  );
}
