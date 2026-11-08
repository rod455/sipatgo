"use client";

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { Alert, Button, Input } from "@/components/ui";
import { api } from "@/components/ui/fetcher";
import { Camera } from "lucide-react";

type Result = { already: boolean; event: string; points: number };

export function CheckinForm({ initialToken }: { initialToken?: string }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<Result | null>(null);
  const [err, setErr] = useState("");
  const [scanning, setScanning] = useState(false);
  const scanner = useRef<{ stop: () => Promise<void> } | null>(null);
  const sentInitial = useRef(false);

  async function send(value: string) {
    setBusy(true); setErr("");
    try {
      const r = await api<Result>("/api/checkin", { code: value });
      setRes(r);
      if (!r.already) confetti({ particleCount: 120, spread: 80 });
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }

  useEffect(() => {
    if (initialToken && !sentInitial.current) { sentInitial.current = true; void send(initialToken); }
  }, [initialToken]);

  async function startScan() {
    setErr(""); setScanning(true);
    const { Html5Qrcode } = await import("html5-qrcode");
    const q = new Html5Qrcode("qr-reader");
    scanner.current = q;
    try {
      await q.start({ facingMode: "environment" }, { fps: 10, qrbox: 240 }, async (text) => {
        await q.stop().catch(() => {});
        setScanning(false);
        const m = /[?&]t=([^&]+)/.exec(text);
        void send(m ? decodeURIComponent(m[1]) : text);
      }, () => {});
    } catch {
      setScanning(false);
      setErr("Não foi possível abrir a câmera. Digite o código.");
    }
  }

  useEffect(() => () => { void scanner.current?.stop().catch(() => {}); }, []);

  if (res) {
    return (
      <div className="animate-pop rounded-2xl bg-white p-6 text-center shadow ring-1 ring-brand-100">
        <p className="text-5xl">📍</p>
        <p className="mt-2 font-display text-2xl font-extrabold">{res.already ? "Você já fez check-in" : "Check-in feito!"}</p>
        <p className="text-brand-muted">{res.event}</p>
        {!res.already && <p className="mt-2 font-display text-xl font-bold text-green-600">+{res.points} pontos</p>}
        <Button className="mt-4" variant="outline" onClick={() => setRes(null)}>Outro evento</Button>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div id="qr-reader" className={scanning ? "overflow-hidden rounded-2xl" : "hidden"} />
      {!scanning && <Button size="lg" className="w-full" onClick={startScan}><Camera className="h-5 w-5" /> Escanear QR code</Button>}
      {scanning && <Button variant="outline" className="w-full" onClick={async () => { await scanner.current?.stop().catch(() => {}); setScanning(false); }}>Cancelar</Button>}
      <div className="flex items-center gap-3 text-xs text-brand-muted"><div className="h-px flex-1 bg-brand-100" />ou<div className="h-px flex-1 bg-brand-100" /></div>
      <form onSubmit={(e) => { e.preventDefault(); void send(code); }} className="flex gap-2">
        <Input placeholder="ABC123" maxLength={7} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="h-12 text-center font-display text-xl tracking-[.3em]" />
        <Button type="submit" size="lg" disabled={busy || code.replace(/[^A-Z0-9]/g, "").length !== 6}>OK</Button>
      </form>
      {err && <Alert>{err}</Alert>}
    </div>
  );
}
