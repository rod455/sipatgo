"use client";

import { useState } from "react";
import { Button, Input, Label } from "@/components/ui";

export function YoutubeField({ initialId, initialDuration }: { initialId: string | null; initialDuration: number | null }) {
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
    </div>
  );
}
