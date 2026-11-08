"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui";
import { FACE_OVAL } from "@/lib/photo-sampler";

const BOX = 280;      // tamanho da área na tela (px CSS)
const OUT = 512;      // tamanho do recorte gerado

/**
 * Escolhe uma foto, deixa a pessoa encaixar o rosto no oval (arrastar + zoom)
 * e devolve um canvas quadrado OUT×OUT.
 */
export function PhotoCropper({ onConfirm, confirmLabel, busy, hint }: {
  onConfirm: (canvas: HTMLCanvasElement) => void; confirmLabel: string; busy?: boolean; hint?: string;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const camera = useRef<HTMLInputElement>(null);
  const gallery = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (src) URL.revokeObjectURL(src); }, [src]);

  function pick(f?: File) {
    if (!f || !f.type.startsWith("image/")) return;
    const url = URL.createObjectURL(f);
    const el = new Image();
    el.onload = () => { setImg(el); setZoom(1); setOff({ x: 0, y: 0 }); };
    el.src = url;
    setSrc(url);
  }

  const base = img ? Math.max(BOX / img.naturalWidth, BOX / img.naturalHeight) : 1;
  const s = base * zoom;
  const w = img ? img.naturalWidth * s : 0;
  const h = img ? img.naturalHeight * s : 0;
  // limita o arraste para a foto sempre cobrir a área
  const clamp = (o: { x: number; y: number }) => ({
    x: Math.max(-(w - BOX) / 2, Math.min((w - BOX) / 2, o.x)),
    y: Math.max(-(h - BOX) / 2, Math.min((h - BOX) / 2, o.y)),
  });
  const pos = clamp(off);

  function confirm() {
    if (!img) return;
    const k = OUT / BOX;
    const c = document.createElement("canvas");
    c.width = OUT; c.height = OUT;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, OUT, OUT);
    ctx.drawImage(img, (BOX / 2 + pos.x - w / 2) * k, (BOX / 2 + pos.y - h / 2) * k, w * k, h * k);
    onConfirm(c);
  }

  const inputs = (
    <>
      <input ref={camera} type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      <input ref={gallery} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
    </>
  );

  if (!img) {
    return (
      <div className="space-y-3">
        {inputs}
        {hint && <p className="text-sm text-slate-600">{hint}</p>}
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" onClick={() => camera.current?.click()}><Camera className="h-4 w-4" /> Tirar selfie</Button>
          <Button type="button" variant="outline" onClick={() => gallery.current?.click()}><ImagePlus className="h-4 w-4" /> Da galeria</Button>
        </div>
        <p className="text-xs text-slate-500">Dica: rosto de frente, boa luz e sem óculos escuros.</p>
      </div>
    );
  }

  const { cx, cy, rx, ry } = FACE_OVAL;
  return (
    <div className="space-y-3">
      {inputs}
      <p className="text-center text-sm text-slate-600">Arraste e use o zoom para encaixar o rosto no oval.</p>
      <div
        className="relative mx-auto touch-none select-none overflow-hidden rounded-2xl bg-slate-200"
        style={{ width: BOX, height: BOX }}
        onPointerDown={(e) => { drag.current = { x: e.clientX, y: e.clientY, ox: pos.x, oy: pos.y }; (e.target as HTMLElement).setPointerCapture(e.pointerId); }}
        onPointerMove={(e) => { if (drag.current) setOff(clamp({ x: drag.current.ox + e.clientX - drag.current.x, y: drag.current.oy + e.clientY - drag.current.y })); }}
        onPointerUp={() => { drag.current = null; }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src!} alt="" draggable={false} className="pointer-events-none absolute max-w-none"
          style={{ width: w, height: h, left: BOX / 2 + pos.x - w / 2, top: BOX / 2 + pos.y - h / 2 }} />
        <svg className="pointer-events-none absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <mask id="face-mask">
              <rect width="100" height="100" fill="white" />
              <ellipse cx={cx * 100} cy={cy * 100} rx={rx * 100} ry={ry * 100} fill="black" />
            </mask>
          </defs>
          <rect width="100" height="100" fill="rgba(15,23,42,.55)" mask="url(#face-mask)" />
          <ellipse cx={cx * 100} cy={cy * 100} rx={rx * 100} ry={ry * 100} fill="none" stroke="white" strokeWidth="0.8" strokeDasharray="3 2" />
        </svg>
      </div>
      <label className="flex items-center gap-3 text-sm text-slate-600">
        <ZoomIn className="h-4 w-4 shrink-0" />
        <input type="range" min={1} max={4} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-[var(--brand-primary)]" />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="ghost" onClick={() => { setImg(null); setSrc(null); }}>Trocar foto</Button>
        <Button type="button" onClick={confirm} disabled={busy}>{busy ? "Aguarde..." : confirmLabel}</Button>
      </div>
    </div>
  );
}
