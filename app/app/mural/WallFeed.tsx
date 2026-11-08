"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Heart, Camera, Star } from "lucide-react";
import { Avatar } from "@/components/avatar/Avatar";
import { Alert, Button, Pill, Textarea } from "@/components/ui";
import { api } from "@/components/ui/fetcher";
import { cn } from "@/lib/utils";
import type { WallPost } from "@/lib/wall";

async function resizeImage(file: File, max = 1600): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("Falha ao processar a imagem"))), "image/jpeg", 0.85));
}

export function WallFeed({ posts, mine, canPost, canVote, votingUntil, meId }: {
  posts: WallPost[]; mine: WallPost[]; canPost: boolean; canVote: boolean; votingUntil: string; meId: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"feed" | "mine">("feed");
  const [votes, setVotes] = useState(() => Object.fromEntries(posts.map((p) => [p.id, { n: p.votes, v: p.voted }])));
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "red" | "green"; text: string } | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function vote(id: string) {
    const prev = votes[id];
    setVotes((s) => ({ ...s, [id]: { n: prev.n + (prev.v ? -1 : 1), v: !prev.v } }));
    try { await api("/api/wall/vote", { post_id: id }); } catch (e) { setVotes((s) => ({ ...s, [id]: prev })); setMsg({ tone: "red", text: (e as Error).message }); }
  }

  async function send() {
    if (!file) return;
    setBusy(true); setMsg(null);
    try {
      const blob = await resizeImage(file);
      const fd = new FormData();
      fd.append("image", new File([blob], "post.jpg", { type: "image/jpeg" }));
      fd.append("caption", caption);
      await api("/api/wall/post", fd);
      setOpen(false); setFile(null); setPreview(null); setCaption(""); setTab("mine");
      setMsg({ tone: "green", text: "Post enviado! Ele aparece no mural depois que o RH aprovar." });
      router.refresh();
    } catch (e) {
      setMsg({ tone: "red", text: (e as Error).message });
    } finally { setBusy(false); }
  }

  const list = tab === "feed" ? posts : mine;
  return (
    <div className="space-y-4">
      {canPost && !open && <Button className="w-full" size="lg" onClick={() => setOpen(true)}><Camera className="h-5 w-5" /> Postar no mural</Button>}
      {open && (
        <div className="space-y-3 rounded-2xl bg-white p-4 shadow ring-1 ring-brand-100">
          <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => {
            const f = e.target.files?.[0]; if (!f) return;
            if (f.size > 15 * 1024 * 1024) { setMsg({ tone: "red", text: "Imagem muito grande." }); return; }
            setFile(f); setPreview(URL.createObjectURL(f));
          }} />
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Prévia" className="max-h-80 w-full rounded-xl object-cover" onClick={() => input.current?.click()} />
          ) : (
            <button onClick={() => input.current?.click()} className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-200 text-brand-muted">
              <Camera className="h-8 w-8" /> Tirar foto ou escolher da galeria
            </button>
          )}
          <Textarea rows={2} maxLength={280} placeholder="Legenda (até 280 caracteres)" value={caption} onChange={(e) => setCaption(e.target.value)} />
          <p className="text-right text-xs text-brand-muted">{caption.length}/280</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => { setOpen(false); setFile(null); setPreview(null); }}>Cancelar</Button>
            <Button onClick={send} disabled={!file || busy}>{busy ? "Enviando..." : "Enviar"}</Button>
          </div>
          <p className="text-xs text-brand-muted">Post aprovado vale 30 pontos (1 por dia). O mais votado do dia ganha +100!</p>
        </div>
      )}
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}

      <div className="grid grid-cols-2 rounded-xl bg-brand-100 p-1">
        <button onClick={() => setTab("feed")} className={cn("rounded-lg py-2 text-sm font-semibold", tab === "feed" ? "bg-white shadow" : "text-brand-muted")}>Mural</button>
        <button onClick={() => setTab("mine")} className={cn("rounded-lg py-2 text-sm font-semibold", tab === "mine" ? "bg-white shadow" : "text-brand-muted")}>Meus posts</button>
      </div>
      {tab === "feed" && <p className="text-xs text-brand-muted">{canVote ? `Votação aberta até ${votingUntil}.` : "Votação encerrada."}</p>}

      {list.length === 0 && <p className="py-10 text-center text-sm text-brand-muted">{tab === "feed" ? "Nenhum post aprovado ainda. Seja o primeiro!" : "Você ainda não postou."}</p>}
      <div className="space-y-4">
        {list.map((p) => (
          <article key={p.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-brand-100">
            <div className="flex items-center gap-2 p-3">
              <Avatar config={p.avatar_config} seed={p.participant_id} size={32} />
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{p.name}</p><p className="text-xs text-brand-muted">{p.sector} · Dia {p.day_index}</p></div>
              {p.is_winner && <Pill tone="amber"><Star className="h-3 w-3" /> Destaque</Pill>}
              {tab === "mine" && <Pill tone={p.status === "approved" ? "green" : p.status === "rejected" ? "red" : "amber"}>{p.status === "approved" ? "Aprovado" : p.status === "rejected" ? "Recusado" : "Em análise"}</Pill>}
            </div>
            {p.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image_url} alt={p.caption || "Post do mural"} className="w-full" loading="lazy" />
            ) : <div className="aspect-square bg-brand-50" />}
            <div className="flex items-start gap-3 p-3">
              {tab === "feed" && (
                <button onClick={() => vote(p.id)} disabled={!canVote || p.participant_id === meId} className="flex items-center gap-1 disabled:opacity-60">
                  <Heart className={cn("h-6 w-6", votes[p.id]?.v ? "fill-red-500 text-red-500" : "text-brand-ink")} />
                  <span className="text-sm font-semibold tabular">{votes[p.id]?.n ?? p.votes}</span>
                </button>
              )}
              {p.caption && <p className="text-sm text-brand-ink">{p.caption}</p>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
